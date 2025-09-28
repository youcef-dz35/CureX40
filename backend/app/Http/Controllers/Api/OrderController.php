<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Medication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Order::with(["orderItems.medication", "pharmacy"])->forUser(
                $user->id,
            );

            // Filter by status
            if ($request->has("status") && !empty($request->status)) {
                $query->byStatus($request->status);
            }

            // Filter by type
            if ($request->has("type") && !empty($request->type)) {
                $query->byType($request->type);
            }

            // Filter by date range
            if ($request->has("from_date")) {
                $query->whereDate("created_at", ">=", $request->from_date);
            }
            if ($request->has("to_date")) {
                $query->whereDate("created_at", "<=", $request->to_date);
            }

            // Sorting
            $sortBy = $request->get("sort_by", "created_at");
            $sortOrder = $request->get("sort_order", "desc");
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min($request->get("per_page", 20), 50);
            $orders = $query->paginate($perPage);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Orders retrieved successfully",
                "data" => $orders->items(),
                "meta" => [
                    "current_page" => $orders->currentPage(),
                    "last_page" => $orders->lastPage(),
                    "per_page" => $orders->perPage(),
                    "total" => $orders->total(),
                    "from" => $orders->firstItem(),
                    "to" => $orders->lastItem(),
                ],
                "links" => [
                    "first" => $orders->url(1),
                    "last" => $orders->url($orders->lastPage()),
                    "prev" => $orders->previousPageUrl(),
                    "next" => $orders->nextPageUrl(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve orders",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                "items" => ["required", "array", "min:1"],
                "items.*.medication_id" => [
                    "required",
                    "integer",
                    "exists:medications,id",
                ],
                "items.*.quantity" => ["required", "integer", "min:1"],
                "items.*.dosage_instructions" => [
                    "nullable",
                    "string",
                    "max:500",
                ],
                "items.*.substitution_allowed" => ["boolean"],
                "pharmacy_id" => [
                    "nullable",
                    "integer",
                    "exists:pharmacies,id",
                ],
                "delivery_method" => ["required", "in:pickup,delivery"],
                "delivery_address" => [
                    "required_if:delivery_method,delivery",
                    "array",
                ],
                "delivery_address.street" => [
                    "required_if:delivery_method,delivery",
                    "string",
                ],
                "delivery_address.city" => [
                    "required_if:delivery_method,delivery",
                    "string",
                ],
                "delivery_address.postal_code" => [
                    "required_if:delivery_method,delivery",
                    "string",
                ],
                "delivery_address.phone" => [
                    "required_if:delivery_method,delivery",
                    "string",
                ],
                "notes" => ["nullable", "string", "max:1000"],
            ]);

            $user = Auth::user();

            // Start database transaction
            DB::beginTransaction();

            // Create the order
            $order = Order::create([
                "user_id" => $user->id,
                "pharmacy_id" => $validated["pharmacy_id"] ?? null,
                "status" => Order::STATUS_PENDING,
                "type" => Order::TYPE_ONLINE,
                "delivery_method" => $validated["delivery_method"],
                "delivery_address" => $validated["delivery_address"] ?? null,
                "delivery_fee" =>
                    $validated["delivery_method"] === Order::DELIVERY_DELIVERY
                        ? 500.0
                        : 0.0, // 500 DZD delivery fee
                "currency" => "DZD",
                "notes" => $validated["notes"] ?? null,
            ]);

            $subtotal = 0;
            $requiresPrescription = false;

            // Create order items
            foreach ($validated["items"] as $itemData) {
                $medication = Medication::find($itemData["medication_id"]);

                if (!$medication) {
                    throw new \Exception(
                        "Medication not found: {$itemData["medication_id"]}",
                    );
                }

                if (
                    !$medication->is_available ||
                    $medication->stock < $itemData["quantity"]
                ) {
                    throw new \Exception(
                        "Medication {$medication->name} is not available in requested quantity",
                    );
                }

                if ($medication->requires_prescription) {
                    $requiresPrescription = true;
                }

                $unitPrice = $medication->price;
                $totalPrice = $unitPrice * $itemData["quantity"];
                $subtotal += $totalPrice;

                OrderItem::create([
                    "order_id" => $order->id,
                    "medication_id" => $medication->id,
                    "quantity" => $itemData["quantity"],
                    "unit_price" => $unitPrice,
                    "total_price" => $totalPrice,
                    "dosage_instructions" =>
                        $itemData["dosage_instructions"] ?? null,
                    "substitution_allowed" =>
                        $itemData["substitution_allowed"] ?? false,
                ]);

                // Update medication stock (reserve)
                $medication->decrement("stock", $itemData["quantity"]);
            }

            // Calculate totals
            $taxAmount = $subtotal * 0.19; // 19% VAT for Algeria
            $totalAmount = $subtotal + $taxAmount + $order->delivery_fee;

            // Update order totals
            $order->update([
                "subtotal" => $subtotal,
                "tax_amount" => $taxAmount,
                "total_amount" => $totalAmount,
                "requires_prescription" => $requiresPrescription,
                "estimated_ready_at" => now()->addHours(2), // 2 hours preparation time
            ]);

            DB::commit();

            // Load the order with relationships
            $order->load(["orderItems.medication", "pharmacy", "user"]);

            return response()->json(
                [
                    "success" => true,
                    "status" => 201,
                    "message" => "Order created successfully",
                    "data" => [
                        "order" => $order,
                        "summary" => [
                            "order_number" => $order->order_number,
                            "items_count" => $order->items->count(),
                            "total_quantity" => $order->items->sum("quantity"),
                            "subtotal" => $order->subtotal,
                            "tax_amount" => $order->tax_amount,
                            "delivery_fee" => $order->delivery_fee,
                            "total_amount" => $order->total_amount,
                            "estimated_ready_at" => $order->estimated_ready_at,
                            "requires_prescription" =>
                                $order->requires_prescription,
                        ],
                    ],
                ],
                201,
            );
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json(
                [
                    "success" => false,
                    "status" => 422,
                    "message" => "Validation failed",
                    "errors" => $e->errors(),
                ],
                422,
            );
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to create order",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Display the specified order
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            $order = Order::with([
                "orderItems.medication",
                "orderItems.substitutedMedication",
                "orderItems.fulfilledBy",
                "pharmacy",
                "processedBy",
                "prescriptionVerifiedBy",
            ])
                ->forUser($user->id)
                ->find($id);

            if (!$order) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Order not found",
                    ],
                    404,
                );
            }

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Order retrieved successfully",
                "data" => [
                    "order" => $order,
                    "summary" => [
                        "order_number" => $order->order_number,
                        "status" => $order->status_label,
                        "type" => $order->type_label,
                        "delivery_method" => $order->delivery_method_label,
                        "items_count" => $order->items_count,
                        "medications_count" => $order->medications_count,
                        "total_amount" => $order->formatted_total,
                        "estimated_delivery" => $order->estimated_delivery,
                        "can_be_cancelled" => $order->canBeCancelled(),
                        "requires_prescription_verification" => $order->requiresPrescriptionVerification(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve order",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                "status" => [
                    "required",
                    "string",
                    "in:pending,confirmed,preparing,ready,completed,cancelled",
                ],
                "notes" => ["nullable", "string", "max:1000"],
                "estimated_ready_at" => ["nullable", "date_format:Y-m-d H:i:s"],
            ]);

            $user = Auth::user();

            // Find order (pharmacists can access all orders, users only their own)
            if ($user->role === "pharmacist" || $user->role === "admin") {
                $order = Order::find($id);
            } else {
                $order = Order::forUser($user->id)->find($id);
            }

            if (!$order) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Order not found",
                    ],
                    404,
                );
            }

            $oldStatus = $order->status;

            // Update order status
            $updateData = [
                "status" => $validated["status"],
            ];

            if (isset($validated["notes"])) {
                $updateData["pharmacy_notes"] = $validated["notes"];
            }

            if (isset($validated["estimated_ready_at"])) {
                $updateData["estimated_ready_at"] =
                    $validated["estimated_ready_at"];
            }

            // Set timestamps based on status
            switch ($validated["status"]) {
                case Order::STATUS_READY:
                    $updateData["ready_at"] = now();
                    break;
                case Order::STATUS_COMPLETED:
                    $updateData["completed_at"] = now();
                    if (!$order->ready_at) {
                        $updateData["ready_at"] = now();
                    }
                    break;
                case Order::STATUS_CANCELLED:
                    $updateData["cancelled_at"] = now();
                    $updateData["cancelled_by"] = $user->id;
                    break;
            }

            // Set processed_by for pharmacist actions
            if (
                in_array($user->role, ["pharmacist", "admin"]) &&
                in_array($validated["status"], [
                    Order::STATUS_CONFIRMED,
                    Order::STATUS_PREPARING,
                    Order::STATUS_READY,
                ])
            ) {
                $updateData["processed_by"] = $user->id;
            }

            $order->update($updateData);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Order status updated successfully",
                "data" => [
                    "order_id" => $order->id,
                    "order_number" => $order->order_number,
                    "old_status" => $oldStatus,
                    "new_status" => $order->status,
                    "status_label" => $order->status_label,
                    "updated_at" => $order->updated_at,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 422,
                    "message" => "Validation failed",
                    "errors" => $e->errors(),
                ],
                422,
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to update order status",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Cancel an order
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                "cancellation_reason" => ["required", "string", "max:500"],
            ]);

            $user = Auth::user();
            $order = Order::forUser($user->id)->find($id);

            if (!$order) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Order not found",
                    ],
                    404,
                );
            }

            if (!$order->canBeCancelled()) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" => "Order cannot be cancelled at this stage",
                    ],
                    400,
                );
            }

            // Start database transaction
            DB::beginTransaction();

            // Restore medication stock
            foreach ($order->items as $item) {
                if (!$item->is_fulfilled) {
                    $item->medication->increment("stock", $item->quantity);
                }
            }

            // Update order
            $order->update([
                "status" => Order::STATUS_CANCELLED,
                "cancelled_at" => now(),
                "cancelled_by" => $user->id,
                "cancellation_reason" => $validated["cancellation_reason"],
            ]);

            DB::commit();

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Order cancelled successfully",
                "data" => [
                    "order_id" => $order->id,
                    "order_number" => $order->order_number,
                    "status" => $order->status,
                    "cancelled_at" => $order->cancelled_at,
                    "cancellation_reason" => $order->cancellation_reason,
                ],
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json(
                [
                    "success" => false,
                    "status" => 422,
                    "message" => "Validation failed",
                    "errors" => $e->errors(),
                ],
                422,
            );
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to cancel order",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Get user's order history
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $query = Order::with(["orderItems.medication", "pharmacy"])
                ->forUser($user->id)
                ->orderBy("created_at", "desc");

            // Filter by status if provided
            if ($request->has("status") && !empty($request->status)) {
                $query->byStatus($request->status);
            }

            // Search functionality
            if ($request->has("search") && !empty($request->search)) {
                $searchTerms = explode(' ', trim($request->search));
                $query->where(function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        if (strlen($term) > 0) {
                            $q->where(function ($subQuery) use ($term) {
                                $subQuery->whereRaw("LOWER(order_number) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(notes) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereHas("pharmacy", function ($pharmacyQuery) use ($term) {
                                        $pharmacyQuery->whereRaw("LOWER(name) LIKE LOWER(?)", ["%{$term}%"])
                                            ->orWhereRaw("LOWER(address) LIKE LOWER(?)", ["%{$term}%"]);
                                    })
                                    ->orWhereHas("user", function ($userQuery) use ($term) {
                                        $userQuery->whereRaw("LOWER(first_name) LIKE LOWER(?)", ["%{$term}%"])
                                            ->orWhereRaw("LOWER(last_name) LIKE LOWER(?)", ["%{$term}%"])
                                            ->orWhereRaw("LOWER(email) LIKE LOWER(?)", ["%{$term}%"]);
                                    });
                            });
                        }
                    }
                });
            }

            $perPage = min($request->get("per_page", 10), 50);
            $orders = $query->paginate($perPage);

            // Transform data for history view
            $historyData = $orders->getCollection()->map(function ($order) {
                return [
                    "id" => $order->id,
                    "order_number" => $order->order_number,
                    "status" => $order->status,
                    "status_label" => $order->status_label,
                    "type" => $order->type,
                    "type_label" => $order->type_label,
                    "total_amount" => $order->total_amount,
                    "formatted_total" => $order->formatted_total,
                    "items_count" => $order->orderItems->count(),
                    "medications_count" => $order->orderItems->count(),
                    "created_at" => $order->created_at,
                    "estimated_ready_at" => $order->estimated_ready_at,
                    "completed_at" => $order->completed_at,
                    "can_be_cancelled" => $order->canBeCancelled(),
                    "pharmacy_name" => $order->pharmacy->name ?? 'Unknown Pharmacy',
                    "delivery_address" => $order->shipping_address['address'] ?? 'Not provided',
                    "delivery_phone" => $order->shipping_address['phone'] ?? 'Not provided',
                    "notes" => $order->notes ?? '',
                    "items" => $order->orderItems->map(function ($item) {
                        return [
                            "id" => $item->id,
                            "medication_id" => $item->medication_id,
                            "medication_name" => $item->medication->name ?? 'Unknown',
                            "medication_brand" => $item->medication->brand ?? 'Unknown',
                            "quantity" => $item->quantity,
                            "unit_price" => $item->unit_price,
                            "total_price" => $item->total_price,
                        ];
                    }),
                ];
            });

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Order history retrieved successfully",
                "data" => $historyData,
                "meta" => [
                    "current_page" => $orders->currentPage(),
                    "last_page" => $orders->lastPage(),
                    "per_page" => $orders->perPage(),
                    "total" => $orders->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve order history",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }
}
