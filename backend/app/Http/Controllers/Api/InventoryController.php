<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Medication;
use App\Models\Pharmacy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display inventory transactions.
     */
    public function transactions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = InventoryTransaction::with(['medication', 'pharmacy', 'user']);

            // Filter by pharmacy if user is a pharmacist
            if ($user->role === 'pharmacist' && $user->pharmacy_id) {
                $query->forPharmacy($user->pharmacy_id);
            }

            // Filter by medication
            if ($request->has('medication_id')) {
                $query->forMedication($request->medication_id);
            }

            // Filter by type
            if ($request->has('type')) {
                $query->byType($request->type);
            }

            // Filter by date range
            if ($request->has('from_date')) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }
            if ($request->has('to_date')) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }

            $transactions = $query->orderBy('created_at', 'desc')
                                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve inventory transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory summary.
     */
    public function summary(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Medication::query();

            // Filter by pharmacy if user is a pharmacist
            if ($user->role === 'pharmacist' && $user->pharmacy_id) {
                $query->whereHas('pharmacies', function($q) use ($user) {
                    $q->where('pharmacy_id', $user->pharmacy_id);
                });
            }

            $medications = $query->get();

            $summary = [
                'total_medications' => $medications->count(),
                'low_stock_medications' => $medications->where('stock_quantity', '<=', 10)->count(),
                'out_of_stock_medications' => $medications->where('stock_quantity', 0)->count(),
                'total_stock_value' => $medications->sum(function($med) {
                    return $med->stock_quantity * $med->price;
                }),
                'categories' => $medications->groupBy('category')->map(function($meds) {
                    return [
                        'count' => $meds->count(),
                        'total_stock' => $meds->sum('stock_quantity'),
                        'total_value' => $meds->sum(function($med) {
                            return $med->stock_quantity * $med->price;
                        })
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve inventory summary: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock medications.
     */
    public function lowStock(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $threshold = $request->get('threshold', 10);
            
            $query = Medication::where('stock_quantity', '<=', $threshold)
                             ->where('is_active', true);

            // Filter by pharmacy if user is a pharmacist
            if ($user->role === 'pharmacist' && $user->pharmacy_id) {
                $query->whereHas('pharmacies', function($q) use ($user) {
                    $q->where('pharmacy_id', $user->pharmacy_id);
                });
            }

            $medications = $query->orderBy('stock_quantity', 'asc')
                               ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $medications
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve low stock medications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add stock to medication.
     */
    public function addStock(Request $request): JsonResponse
    {
        $request->validate([
            'medication_id' => 'required|exists:medications,id',
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'batch_number' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $options = [
                'user_id' => $user->id,
                'pharmacy_id' => $user->pharmacy_id ?? null,
                'reference_type' => 'manual_adjustment',
                'expiry_date' => $request->expiry_date,
                'batch_number' => $request->batch_number,
                'supplier' => $request->supplier,
                'notes' => $request->notes,
            ];

            $transaction = InventoryTransaction::createStockIn(
                $request->medication_id,
                $request->quantity,
                $request->unit_cost,
                $options
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock added successfully',
                'data' => $transaction->load(['medication', 'pharmacy', 'user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add stock: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Adjust stock quantity.
     */
    public function adjustStock(Request $request): JsonResponse
    {
        $request->validate([
            'medication_id' => 'required|exists:medications,id',
            'new_quantity' => 'required|integer|min:0',
            'notes' => 'required|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $options = [
                'user_id' => $user->id,
                'pharmacy_id' => $user->pharmacy_id ?? null,
                'reference_type' => 'manual_adjustment',
                'notes' => $request->notes,
            ];

            $transaction = InventoryTransaction::createAdjustment(
                $request->medication_id,
                $request->new_quantity,
                $options
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock adjusted successfully',
                'data' => $transaction->load(['medication', 'pharmacy', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to adjust stock: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get inventory reports.
     */
    public function reports(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $fromDate = $request->get('from_date', now()->subDays(30)->toDateString());
            $toDate = $request->get('to_date', now()->toDateString());

            $query = InventoryTransaction::query();

            // Filter by pharmacy if user is a pharmacist
            if ($user->role === 'pharmacist' && $user->pharmacy_id) {
                $query->forPharmacy($user->pharmacy_id);
            }

            $transactions = $query->byDateRange($fromDate, $toDate)->get();

            $reports = [
                'period' => [
                    'from' => $fromDate,
                    'to' => $toDate
                ],
                'summary' => [
                    'total_transactions' => $transactions->count(),
                    'stock_in' => $transactions->where('type', 'in')->sum('quantity_change'),
                    'stock_out' => abs($transactions->where('type', 'out')->sum('quantity_change')),
                    'adjustments' => $transactions->where('type', 'adjustment')->count(),
                    'total_cost' => $transactions->sum('total_cost'),
                ],
                'by_type' => $transactions->groupBy('type')->map(function($transactions) {
                    return [
                        'count' => $transactions->count(),
                        'total_quantity' => $transactions->sum('quantity_change'),
                        'total_cost' => $transactions->sum('total_cost')
                    ];
                }),
                'by_medication' => $transactions->groupBy('medication_id')->map(function($transactions) {
                    $medication = $transactions->first()->medication;
                    return [
                        'medication_name' => $medication->name,
                        'transactions_count' => $transactions->count(),
                        'net_quantity_change' => $transactions->sum('quantity_change'),
                        'total_cost' => $transactions->sum('total_cost')
                    ];
                })->values()
            ];

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate inventory reports: ' . $e->getMessage()
            ], 500);
        }
    }
}
