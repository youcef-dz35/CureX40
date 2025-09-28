<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Medication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of prescriptions for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Prescription::with([
                "items.medication",
                "pharmacy",
                "doctor",
            ])->forUser($user->id);

            // Filter by status
            if ($request->has("status") && !empty($request->status)) {
                $query->byStatus($request->status);
            }

            // Filter by date range
            if ($request->has("from_date")) {
                $query->whereDate("prescribed_date", ">=", $request->from_date);
            }
            if ($request->has("to_date")) {
                $query->whereDate("prescribed_date", "<=", $request->to_date);
            }

            // Filter by pharmacy
            if ($request->has("pharmacy_id") && !empty($request->pharmacy_id)) {
                $query->forPharmacy($request->pharmacy_id);
            }

            // Sorting
            $sortBy = $request->get("sort_by", "prescribed_date");
            $sortOrder = $request->get("sort_order", "desc");
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min($request->get("per_page", 20), 50);
            $prescriptions = $query->paginate($perPage);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescriptions retrieved successfully",
                "data" => $prescriptions->items(),
                "meta" => [
                    "current_page" => $prescriptions->currentPage(),
                    "last_page" => $prescriptions->lastPage(),
                    "per_page" => $prescriptions->perPage(),
                    "total" => $prescriptions->total(),
                    "from" => $prescriptions->firstItem(),
                    "to" => $prescriptions->lastItem(),
                ],
                "links" => [
                    "first" => $prescriptions->url(1),
                    "last" => $prescriptions->url($prescriptions->lastPage()),
                    "prev" => $prescriptions->previousPageUrl(),
                    "next" => $prescriptions->nextPageUrl(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve prescriptions",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Store a newly created prescription
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                "doctor_name" => ["required", "string", "max:255"],
                "doctor_license" => ["nullable", "string", "max:100"],
                "doctor_phone" => ["nullable", "string", "max:20"],
                "doctor_address" => ["nullable", "string", "max:500"],
                "patient_name" => ["required", "string", "max:255"],
                "patient_dob" => ["nullable", "date"],
                "patient_phone" => ["nullable", "string", "max:20"],
                "diagnosis" => ["nullable", "string", "max:1000"],
                "prescribed_date" => ["required", "date"],
                "expiry_date" => ["nullable", "date", "after:prescribed_date"],
                "refills_allowed" => ["integer", "min:0", "max:12"],
                "is_emergency" => ["boolean"],
                "is_controlled" => ["boolean"],
                "special_instructions" => ["nullable", "string", "max:1000"],
                "pharmacy_id" => [
                    "nullable",
                    "integer",
                    "exists:pharmacies,id",
                ],
                "files.*" => ["file", "mimes:png,jpg,jpeg,pdf", "max:10240"], // 10MB max per file
                "items" => ["required", "array", "min:1"],
                "items.*.medication_id" => [
                    "required",
                    "integer",
                    "exists:medications,id",
                ],
                "items.*.medication_name" => ["required", "string", "max:255"],
                "items.*.strength" => ["nullable", "string", "max:100"],
                "items.*.dosage_form" => ["nullable", "string", "max:100"],
                "items.*.dosage_instructions" => [
                    "required",
                    "string",
                    "max:500",
                ],
                "items.*.frequency" => ["required", "string", "max:100"],
                "items.*.quantity_prescribed" => [
                    "required",
                    "integer",
                    "min:1",
                ],
                "items.*.days_supply" => ["nullable", "integer", "min:1"],
                "items.*.special_instructions" => [
                    "nullable",
                    "string",
                    "max:500",
                ],
                "items.*.generic_substitution_allowed" => ["boolean"],
            ]);

            $user = Auth::user();

            // Start database transaction
            DB::beginTransaction();

            // Handle file uploads
            $uploadedFiles = [];
            if ($request->hasFile("files")) {
                foreach ($request->file("files") as $file) {
                    $filename =
                        time() .
                        "_" .
                        uniqid() .
                        "." .
                        $file->getClientOriginalExtension();
                    $path = $file->storeAs(
                        "prescriptions",
                        $filename,
                        "public",
                    );
                    $uploadedFiles[] = [
                        "original_name" => $file->getClientOriginalName(),
                        "filename" => $filename,
                        "path" => $path,
                        "size" => $file->getSize(),
                        "mime_type" => $file->getMimeType(),
                    ];
                }
            }

            // Create the prescription
            $prescription = Prescription::create([
                "user_id" => $user->id,
                "pharmacy_id" => $validated["pharmacy_id"] ?? null,
                "doctor_name" => $validated["doctor_name"],
                "doctor_license" => $validated["doctor_license"] ?? null,
                "doctor_phone" => $validated["doctor_phone"] ?? null,
                "doctor_address" => $validated["doctor_address"] ?? null,
                "patient_name" => $validated["patient_name"],
                "patient_dob" => $validated["patient_dob"] ?? null,
                "patient_phone" => $validated["patient_phone"] ?? null,
                "diagnosis" => $validated["diagnosis"] ?? null,
                "prescribed_date" => $validated["prescribed_date"],
                "expiry_date" => $validated["expiry_date"] ?? null,
                "refills_allowed" => $validated["refills_allowed"] ?? 0,
                "is_emergency" => $validated["is_emergency"] ?? false,
                "is_controlled" => $validated["is_controlled"] ?? false,
                "special_instructions" =>
                    $validated["special_instructions"] ?? null,
                "uploaded_files" => $uploadedFiles,
                "status" => Prescription::STATUS_PENDING,
            ]);

            // Create prescription items
            foreach ($validated["items"] as $itemData) {
                $medication = Medication::find($itemData["medication_id"]);

                PrescriptionItem::create([
                    "prescription_id" => $prescription->id,
                    "medication_id" => $medication->id,
                    "medication_name" => $itemData["medication_name"],
                    "strength" => $itemData["strength"] ?? null,
                    "dosage_form" => $itemData["dosage_form"] ?? null,
                    "dosage_instructions" => $itemData["dosage_instructions"],
                    "frequency" => $itemData["frequency"],
                    "quantity_prescribed" => $itemData["quantity_prescribed"],
                    "days_supply" => $itemData["days_supply"] ?? null,
                    "unit_price" => $medication->price,
                    "total_price" =>
                        $medication->price * $itemData["quantity_prescribed"],
                    "special_instructions" =>
                        $itemData["special_instructions"] ?? null,
                    "generic_substitution_allowed" =>
                        $itemData["generic_substitution_allowed"] ?? true,
                    "status" => PrescriptionItem::STATUS_PENDING,
                ]);
            }

            DB::commit();

            // Load the prescription with relationships
            $prescription->load(["items.medication", "pharmacy"]);

            return response()->json(
                [
                    "success" => true,
                    "status" => 201,
                    "message" => "Prescription uploaded successfully",
                    "data" => [
                        "prescription" => $prescription,
                        "summary" => $prescription->summary,
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
                    "message" => "Failed to create prescription",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Display the specified prescription
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            $prescription = Prescription::with([
                "items.medication",
                "items.substitutedMedication",
                "items.filledBy",
                "pharmacy",
                "verifiedBy",
                "filledBy",
                "cancelledBy",
            ])
                ->forUser($user->id)
                ->find($id);

            if (!$prescription) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Prescription not found",
                    ],
                    404,
                );
            }

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription retrieved successfully",
                "data" => [
                    "prescription" => $prescription,
                    "summary" => $prescription->summary,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve prescription",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Update the specified prescription
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                "special_instructions" => ["nullable", "string", "max:1000"],
                "pharmacy_id" => [
                    "nullable",
                    "integer",
                    "exists:pharmacies,id",
                ],
            ]);

            $user = Auth::user();
            $prescription = Prescription::forUser($user->id)->find($id);

            if (!$prescription) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Prescription not found",
                    ],
                    404,
                );
            }

            if ($prescription->status !== Prescription::STATUS_PENDING) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" =>
                            "Prescription cannot be updated after verification",
                    ],
                    400,
                );
            }

            $prescription->update($validated);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription updated successfully",
                "data" => $prescription,
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
                    "message" => "Failed to update prescription",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Verify a prescription (pharmacist only)
     */
    public function verify(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                "verification_notes" => ["nullable", "string", "max:1000"],
            ]);

            $user = Auth::user();

            // Only pharmacists can verify prescriptions
            if (!in_array($user->role, ["pharmacist", "admin"])) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 403,
                        "message" =>
                            "Only pharmacists can verify prescriptions",
                    ],
                    403,
                );
            }

            $prescription = Prescription::find($id);

            if (!$prescription) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Prescription not found",
                    ],
                    404,
                );
            }

            if (!$prescription->canBeVerified()) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" =>
                            "Prescription cannot be verified at this time",
                    ],
                    400,
                );
            }

            $success = $prescription->verify(
                $user,
                $validated["verification_notes"] ?? null,
            );

            if (!$success) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" => "Failed to verify prescription",
                    ],
                    400,
                );
            }

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription verified successfully",
                "data" => [
                    "prescription_id" => $prescription->id,
                    "prescription_number" => $prescription->prescription_number,
                    "status" => $prescription->status,
                    "verified_at" => $prescription->verified_at,
                    "verified_by" => $prescription->verifiedBy->name ?? null,
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
                    "message" => "Failed to verify prescription",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Fill a prescription (pharmacist only)
     */
    public function fill(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                "items" => ["required", "array", "min:1"],
                "items.*.prescription_item_id" => [
                    "required",
                    "integer",
                    "exists:prescription_items,id",
                ],
                "items.*.quantity_dispensed" => [
                    "required",
                    "integer",
                    "min:1",
                ],
                "items.*.pharmacist_notes" => ["nullable", "string", "max:500"],
                "items.*.substituted_medication_id" => [
                    "nullable",
                    "integer",
                    "exists:medications,id",
                ],
                "items.*.substitution_reason" => [
                    "required_with:items.*.substituted_medication_id",
                    "string",
                    "max:500",
                ],
            ]);

            $user = Auth::user();

            // Only pharmacists can fill prescriptions
            if (!in_array($user->role, ["pharmacist", "admin"])) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 403,
                        "message" => "Only pharmacists can fill prescriptions",
                    ],
                    403,
                );
            }

            $prescription = Prescription::with("items")->find($id);

            if (!$prescription) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Prescription not found",
                    ],
                    404,
                );
            }

            if (!$prescription->canBeFilled()) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" =>
                            "Prescription cannot be filled at this time",
                    ],
                    400,
                );
            }

            // Start database transaction
            DB::beginTransaction();

            $filledItems = [];
            $allItemsFilled = true;

            foreach ($validated["items"] as $itemData) {
                $prescriptionItem = PrescriptionItem::find(
                    $itemData["prescription_item_id"],
                );

                if (
                    !$prescriptionItem ||
                    $prescriptionItem->prescription_id !== $prescription->id
                ) {
                    throw new \Exception(
                        "Invalid prescription item ID: {$itemData["prescription_item_id"]}",
                    );
                }

                // Handle substitution if provided
                if (isset($itemData["substituted_medication_id"])) {
                    $substituteMedication = Medication::find(
                        $itemData["substituted_medication_id"],
                    );
                    $prescriptionItem->addSubstitution(
                        $substituteMedication,
                        $itemData["substitution_reason"],
                        $user,
                    );
                }

                // Fill the item
                $filled = $prescriptionItem->fillPrescription(
                    $itemData["quantity_dispensed"],
                    $user,
                );

                if ($filled && isset($itemData["pharmacist_notes"])) {
                    $prescriptionItem->update([
                        "pharmacist_notes" => $itemData["pharmacist_notes"],
                    ]);
                }

                $filledItems[] = [
                    "item_id" => $prescriptionItem->id,
                    "medication_name" =>
                        $prescriptionItem->medication_display_name,
                    "quantity_dispensed" => $itemData["quantity_dispensed"],
                    "status" => $prescriptionItem->status,
                ];

                if (!$prescriptionItem->isCompletelyFilled()) {
                    $allItemsFilled = false;
                }
            }

            // Update prescription status
            if ($allItemsFilled) {
                $prescription->markAsFilled($user);
            } else {
                $prescription->update([
                    "status" => Prescription::STATUS_PARTIALLY_FILLED,
                ]);
            }

            DB::commit();

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription filled successfully",
                "data" => [
                    "prescription_id" => $prescription->id,
                    "prescription_number" => $prescription->prescription_number,
                    "status" => $prescription->status,
                    "filled_items" => $filledItems,
                    "fill_percentage" => $prescription->fill_percentage,
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
                    "message" => "Failed to fill prescription",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Cancel a prescription
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                "cancellation_reason" => ["required", "string", "max:500"],
            ]);

            $user = Auth::user();
            $prescription = Prescription::forUser($user->id)->find($id);

            if (!$prescription) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Prescription not found",
                    ],
                    404,
                );
            }

            if ($prescription->status === Prescription::STATUS_CANCELLED) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" => "Prescription is already cancelled",
                    ],
                    400,
                );
            }

            $success = $prescription->cancel(
                $user,
                $validated["cancellation_reason"],
            );

            if (!$success) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 400,
                        "message" => "Failed to cancel prescription",
                    ],
                    400,
                );
            }

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription cancelled successfully",
                "data" => [
                    "prescription_id" => $prescription->id,
                    "prescription_number" => $prescription->prescription_number,
                    "status" => $prescription->status,
                    "cancelled_at" => $prescription->cancelled_at,
                    "cancellation_reason" => $prescription->cancellation_reason,
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
                    "message" => "Failed to cancel prescription",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Get user's prescription history
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $query = Prescription::with(["items.medication"])
                ->forUser($user->id)
                ->orderBy("prescribed_date", "desc");

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
                                $subQuery->whereRaw("LOWER(prescription_number) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(doctor_name) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(patient_name) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(diagnosis) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(verification_notes) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereHas("pharmacy", function ($pharmacyQuery) use ($term) {
                                        $pharmacyQuery->whereRaw("LOWER(name) LIKE LOWER(?)", ["%{$term}%"]);
                                    });
                            });
                        }
                    }
                });
            }

            $perPage = min($request->get("per_page", 10), 50);
            $prescriptions = $query->paginate($perPage);

            // Transform data for history view
            $historyData = $prescriptions
                ->getCollection()
                ->map(function ($prescription) {
                    return [
                        "id" => $prescription->id,
                        "prescription_number" =>
                            $prescription->prescription_number,
                        "doctor_name" => $prescription->doctor_name,
                        "status" => $prescription->status,
                        "status_label" => $prescription->status_label,
                        "prescribed_date" => $prescription->prescribed_date,
                        "expiry_date" => $prescription->expiry_date,
                        "days_until_expiry" => $prescription->days_until_expiry,
                        "items_count" => $prescription->items->count(),
                        "total_items" => $prescription->total_items,
                        "filled_items" => $prescription->filled_items,
                        "fill_percentage" => $prescription->fill_percentage,
                        "refills_remaining" => $prescription->getRemainingRefills(),
                        "is_emergency" => $prescription->is_emergency,
                        "is_controlled" => $prescription->is_controlled,
                        "needs_urgent_attention" => $prescription->needsUrgentAttention(),
                    ];
                });

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription history retrieved successfully",
                "data" => $historyData,
                "meta" => [
                    "current_page" => $prescriptions->currentPage(),
                    "last_page" => $prescriptions->lastPage(),
                    "per_page" => $prescriptions->perPage(),
                    "total" => $prescriptions->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve prescription history",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Get prescription statistics for pharmacist dashboard
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Only pharmacists and admins can access statistics
            if (!in_array($user->role, ["pharmacist", "admin"])) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 403,
                        "message" => "Access denied",
                    ],
                    403,
                );
            }

            $query = Prescription::query();

            // Filter by pharmacy if user is a pharmacist
            if ($user->role === "pharmacist" && $user->pharmacy_id) {
                $query->forPharmacy($user->pharmacy_id);
            }

            // Filter by date range if provided
            if ($request->has("from_date")) {
                $query->whereDate("prescribed_date", ">=", $request->from_date);
            }
            if ($request->has("to_date")) {
                $query->whereDate("prescribed_date", "<=", $request->to_date);
            }

            $statistics = [
                "total_prescriptions" => $query->count(),
                "pending_prescriptions" => (clone $query)->pending()->count(),
                "verified_prescriptions" => (clone $query)->verified()->count(),
                "filled_prescriptions" => (clone $query)
                    ->byStatus(Prescription::STATUS_FILLED)
                    ->count(),
                "emergency_prescriptions" => (clone $query)
                    ->emergency()
                    ->count(),
                "controlled_prescriptions" => (clone $query)
                    ->controlled()
                    ->count(),
                "expiring_soon" => (clone $query)->expiringWithin(7)->count(),
                "status_breakdown" => [
                    "pending" => (clone $query)
                        ->byStatus(Prescription::STATUS_PENDING)
                        ->count(),
                    "verified" => (clone $query)
                        ->byStatus(Prescription::STATUS_VERIFIED)
                        ->count(),
                    "partially_filled" => (clone $query)
                        ->byStatus(Prescription::STATUS_PARTIALLY_FILLED)
                        ->count(),
                    "filled" => (clone $query)
                        ->byStatus(Prescription::STATUS_FILLED)
                        ->count(),
                    "expired" => (clone $query)
                        ->byStatus(Prescription::STATUS_EXPIRED)
                        ->count(),
                    "cancelled" => (clone $query)
                        ->byStatus(Prescription::STATUS_CANCELLED)
                        ->count(),
                ],
            ];

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Prescription statistics retrieved successfully",
                "data" => $statistics,
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve prescription statistics",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }
}
