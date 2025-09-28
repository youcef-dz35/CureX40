<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medication;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $cart = Cart::where('user_id', $user->id)
                ->with(['items.medication'])
                ->first();

            if (!$cart) {
                // Create empty cart if it doesn't exist
                $cart = Cart::create([
                    'user_id' => $user->id,
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'shipping_cost' => 0,
                    'total_amount' => 0,
                    'currency' => 'DZD',
                ]);
            }

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Cart retrieved successfully',
                'data' => [
                    'id' => $cart->id,
                    'user_id' => $cart->user_id,
                    'items' => $cart->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'medication_id' => $item->medication_id,
                            'medication' => [
                                'id' => $item->medication->id,
                                'name' => $item->medication->name,
                                'brand' => $item->medication->brand,
                                'strength' => $item->medication->strength,
                                'dosage_form' => $item->medication->dosage_form,
                                'price' => $item->medication->price,
                                'stock' => $item->medication->stock,
                                'category' => $item->medication->category,
                                'image_url' => $item->medication->image_url,
                            ],
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'total_price' => $item->total_price,
                            'added_at' => $item->created_at,
                            'notes' => $item->notes,
                        ];
                    }),
                    'subtotal' => $cart->subtotal,
                    'tax_amount' => $cart->tax_amount,
                    'shipping_cost' => $cart->shipping_cost,
                    'total_amount' => $cart->total_amount,
                    'currency' => $cart->currency,
                    'created_at' => $cart->created_at,
                    'updated_at' => $cart->updated_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to retrieve cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'medication_id' => ['required', 'integer', 'exists:medications,id'],
                'quantity' => ['required', 'integer', 'min:1'],
                'notes' => ['nullable', 'string', 'max:500'],
            ]);

            $user = Auth::user();
            $medication = Medication::find($validated['medication_id']);

            // Check stock availability
            if ($medication->stock < $validated['quantity']) {
                return response()->json([
                    'success' => false,
                    'status' => 400,
                    'message' => 'Insufficient stock. Available: ' . $medication->stock,
                ], 400);
            }

            DB::beginTransaction();

            // Get or create cart
            $cart = Cart::where('user_id', $user->id)->first();
            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $user->id,
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'shipping_cost' => 0,
                    'total_amount' => 0,
                    'currency' => 'DZD',
                ]);
            }

            // Check if item already exists in cart
            $existingItem = $cart->items()->where('medication_id', $medication->id)->first();
            
            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem->quantity + $validated['quantity'];
                if ($medication->stock < $newQuantity) {
                    DB::rollback();
                    return response()->json([
                        'success' => false,
                        'status' => 400,
                        'message' => 'Insufficient stock for requested quantity',
                    ], 400);
                }
                
                $existingItem->update([
                    'quantity' => $newQuantity,
                    'total_price' => $newQuantity * $existingItem->unit_price,
                    'notes' => $validated['notes'] ?? $existingItem->notes,
                ]);
                
                $cartItem = $existingItem;
            } else {
                // Create new cart item
                $cartItem = $cart->items()->create([
                    'medication_id' => $medication->id,
                    'quantity' => $validated['quantity'],
                    'unit_price' => $medication->price,
                    'total_price' => $validated['quantity'] * $medication->price,
                    'notes' => $validated['notes'],
                ]);
            }

            // Recalculate cart totals
            $this->recalculateCartTotals($cart);

            DB::commit();

            $cartItem->load('medication');

            return response()->json([
                'success' => true,
                'status' => 201,
                'message' => 'Item added to cart',
                'data' => [
                    'id' => $cartItem->id,
                    'medication_id' => $cartItem->medication_id,
                    'medication' => [
                        'id' => $cartItem->medication->id,
                        'name' => $cartItem->medication->name,
                        'brand' => $cartItem->medication->brand,
                        'strength' => $cartItem->medication->strength,
                        'dosage_form' => $cartItem->medication->dosage_form,
                        'price' => $cartItem->medication->price,
                        'stock' => $cartItem->medication->stock,
                        'category' => $cartItem->medication->category,
                        'image_url' => $cartItem->medication->image_url,
                    ],
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->unit_price,
                    'total_price' => $cartItem->total_price,
                    'added_at' => $cartItem->created_at,
                    'notes' => $cartItem->notes,
                ],
            ], 201);
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'status' => 422,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to add item to cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update cart item
     */
    public function updateItem(Request $request, string $itemId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'quantity' => ['required', 'integer', 'min:1'],
                'notes' => ['nullable', 'string', 'max:500'],
            ]);

            $user = Auth::user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Cart not found',
                ], 404);
            }

            $cartItem = $cart->items()->find($itemId);
            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Cart item not found',
                ], 404);
            }

            // Check stock availability
            if ($cartItem->medication->stock < $validated['quantity']) {
                return response()->json([
                    'success' => false,
                    'status' => 400,
                    'message' => 'Insufficient stock. Available: ' . $cartItem->medication->stock,
                ], 400);
            }

            DB::beginTransaction();

            $cartItem->update([
                'quantity' => $validated['quantity'],
                'total_price' => $validated['quantity'] * $cartItem->unit_price,
                'notes' => $validated['notes'] ?? $cartItem->notes,
            ]);

            // Recalculate cart totals
            $this->recalculateCartTotals($cart);

            DB::commit();

            $cartItem->load('medication');

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Cart item updated',
                'data' => [
                    'id' => $cartItem->id,
                    'medication_id' => $cartItem->medication_id,
                    'medication' => [
                        'id' => $cartItem->medication->id,
                        'name' => $cartItem->medication->name,
                        'brand' => $cartItem->medication->brand,
                        'strength' => $cartItem->medication->strength,
                        'dosage_form' => $cartItem->medication->dosage_form,
                        'price' => $cartItem->medication->price,
                        'stock' => $cartItem->medication->stock,
                        'category' => $cartItem->medication->category,
                        'image_url' => $cartItem->medication->image_url,
                    ],
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->unit_price,
                    'total_price' => $cartItem->total_price,
                    'added_at' => $cartItem->created_at,
                    'notes' => $cartItem->notes,
                ],
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'status' => 422,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to update cart item',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem(string $itemId): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Cart not found',
                ], 404);
            }

            $cartItem = $cart->items()->find($itemId);
            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Cart item not found',
                ], 404);
            }

            DB::beginTransaction();

            $cartItem->delete();

            // Recalculate cart totals
            $this->recalculateCartTotals($cart);

            DB::commit();

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Item removed from cart',
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to remove item from cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Clear entire cart
     */
    public function clear(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Cart not found',
                ], 404);
            }

            DB::beginTransaction();

            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Cart cleared',
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to clear cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get cart summary
     */
    public function summary(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart) {
                return response()->json([
                    'success' => true,
                    'status' => 200,
                    'message' => 'Cart summary retrieved',
                    'data' => [
                        'items_count' => 0,
                        'subtotal' => 0,
                        'tax_amount' => 0,
                        'shipping_cost' => 0,
                        'total_amount' => 0,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Cart summary retrieved',
                'data' => [
                    'items_count' => $cart->items()->count(),
                    'subtotal' => $cart->subtotal,
                    'tax_amount' => $cart->tax_amount,
                    'shipping_cost' => $cart->shipping_cost,
                    'total_amount' => $cart->total_amount,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to retrieve cart summary',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Recalculate cart totals
     */
    private function recalculateCartTotals(Cart $cart): void
    {
        $subtotal = $cart->items()->sum('total_price');
        $taxRate = 0.19; // 19% tax rate for Algeria
        $taxAmount = $subtotal * $taxRate;
        $shippingCost = $subtotal > 1000 ? 0 : 200; // Free shipping over 1000 DZD
        $totalAmount = $subtotal + $taxAmount + $shippingCost;

        $cart->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_cost' => $shippingCost,
            'total_amount' => $totalAmount,
        ]);
    }
}
