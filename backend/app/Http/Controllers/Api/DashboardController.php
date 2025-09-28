<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Prescription;
use App\Models\Medication;
use App\Models\InventoryTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard data for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $userWithRole = $user->load('roles');
            $role = $userWithRole->roles->first()?->name ?? 'patient';

            switch ($role) {
                case 'patient':
                    return $this->getPatientDashboard($user);
                case 'pharmacist':
                case 'admin':
                    return $this->getPharmacistDashboard($user);
                case 'government_official':
                    return $this->getGovernmentDashboard($user);
                case 'insurance_provider':
                    return $this->getInsuranceDashboard($user);
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid user role'
                    ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient dashboard data.
     */
    private function getPatientDashboard($user): JsonResponse
    {
        $stats = [
            'total_orders' => Order::forUser($user->id)->count(),
            'pending_orders' => Order::forUser($user->id)->byStatus('pending')->count(),
            'delivered_orders' => Order::forUser($user->id)->byStatus('delivered')->count(),
            'total_prescriptions' => Prescription::forUser($user->id)->count(),
            'active_prescriptions' => Prescription::forUser($user->id)->active()->count(),
            'total_spent' => Order::forUser($user->id)->where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        $recent_orders = Order::forUser($user->id)
            ->with(['orderItems.medication'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recent_prescriptions = Prescription::forUser($user->id)
            ->with(['doctor', 'pharmacy'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $low_stock_medications = Medication::where('stock', '<=', 10)
            ->where('is_active', true)
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_orders' => $recent_orders,
                'recent_prescriptions' => $recent_prescriptions,
                'low_stock_medications' => $low_stock_medications,
                'quick_actions' => [
                    'create_order' => true,
                    'upload_prescription' => true,
                    'view_medications' => true,
                    'contact_pharmacist' => true,
                ]
            ]
        ]);
    }

    /**
     * Get pharmacist dashboard data.
     */
    private function getPharmacistDashboard($user): JsonResponse
    {
        $pharmacyId = $user->pharmacy_id;
        
        $stats = [
            'total_orders' => Order::forPharmacy($pharmacyId)->count(),
            'pending_orders' => Order::forPharmacy($pharmacyId)->byStatus('pending')->count(),
            'processing_orders' => Order::forPharmacy($pharmacyId)->byStatus('processing')->count(),
            'ready_orders' => Order::forPharmacy($pharmacyId)->byStatus('ready')->count(),
            'total_prescriptions' => Prescription::forPharmacy($pharmacyId)->count(),
            'pending_prescriptions' => Prescription::forPharmacy($pharmacyId)->byStatus('pending')->count(),
            'verified_prescriptions' => Prescription::forPharmacy($pharmacyId)->byStatus('verified')->count(),
            'total_revenue' => Order::forPharmacy($pharmacyId)->where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        $recent_orders = Order::forPharmacy($pharmacyId)
            ->with(['user', 'orderItems.medication'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recent_prescriptions = Prescription::forPharmacy($pharmacyId)
            ->with(['user', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $low_stock_medications = Medication::where('stock', '<=', 10)
            ->where('is_active', true)
            ->limit(10)
            ->get();

        $inventory_summary = $this->getInventorySummary($pharmacyId);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_orders' => $recent_orders,
                'recent_prescriptions' => $recent_prescriptions,
                'low_stock_medications' => $low_stock_medications,
                'inventory_summary' => $inventory_summary,
                'quick_actions' => [
                    'process_orders' => true,
                    'verify_prescriptions' => true,
                    'manage_inventory' => true,
                    'view_analytics' => true,
                ]
            ]
        ]);
    }

    /**
     * Get government dashboard data.
     */
    private function getGovernmentDashboard($user): JsonResponse
    {
        $stats = [
            'total_pharmacies' => \App\Models\Pharmacy::count(),
            'total_medications' => Medication::count(),
            'total_orders' => Order::count(),
            'total_prescriptions' => Prescription::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_revenue' => Order::where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        $pharmacy_stats = \App\Models\Pharmacy::withCount(['orders', 'prescriptions'])
            ->orderBy('orders_count', 'desc')
            ->limit(10)
            ->get();

        $medication_stats = Medication::withCount(['orders'])
            ->orderBy('orders_count', 'desc')
            ->limit(10)
            ->get();

        $recent_activities = $this->getRecentActivities();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'pharmacy_stats' => $pharmacy_stats,
                'medication_stats' => $medication_stats,
                'recent_activities' => $recent_activities,
                'quick_actions' => [
                    'view_pharmacies' => true,
                    'view_medications' => true,
                    'view_orders' => true,
                    'view_prescriptions' => true,
                ]
            ]
        ]);
    }

    /**
     * Get insurance dashboard data.
     */
    private function getInsuranceDashboard($user): JsonResponse
    {
        $stats = [
            'total_claims' => 0, // TODO: Implement claims system
            'pending_claims' => 0,
            'approved_claims' => 0,
            'rejected_claims' => 0,
            'total_payout' => 0,
            'average_claim_amount' => 0,
        ];

        $recent_claims = []; // TODO: Implement claims data

        $claim_statistics = [
            'by_status' => [
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
            ],
            'by_month' => [],
            'by_category' => [],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_claims' => $recent_claims,
                'claim_statistics' => $claim_statistics,
                'quick_actions' => [
                    'view_claims' => true,
                    'process_claims' => true,
                    'view_statistics' => true,
                    'manage_policies' => true,
                ]
            ]
        ]);
    }

    /**
     * Get inventory summary for pharmacy.
     */
    private function getInventorySummary($pharmacyId): array
    {
        $medications = Medication::whereHas('pharmacies', function($q) use ($pharmacyId) {
            $q->where('pharmacy_id', $pharmacyId);
        })->get();

        return [
            'total_medications' => $medications->count(),
            'low_stock_count' => $medications->where('stock', '<=', 10)->count(),
            'out_of_stock_count' => $medications->where('stock', 0)->count(),
            'total_stock_value' => $medications->sum(function($med) {
                return $med->stock * $med->price;
            }),
            'categories' => $medications->groupBy('category')->map(function($meds) {
                return [
                    'count' => $meds->count(),
                    'total_stock' => $meds->sum('stock'),
                    'total_value' => $meds->sum(function($med) {
                        return $med->stock * $med->price;
                    })
                ];
            })
        ];
    }

    /**
     * Get recent activities across the system.
     */
    private function getRecentActivities(): array
    {
        $activities = [];

        // Recent orders
        $recent_orders = Order::with(['user', 'pharmacy'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recent_orders as $order) {
            $activities[] = [
                'type' => 'order',
                'message' => "New order #{$order->order_number} from {$order->user->name}",
                'timestamp' => $order->created_at,
                'status' => $order->status,
            ];
        }

        // Recent prescriptions
        $recent_prescriptions = Prescription::with(['user', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recent_prescriptions as $prescription) {
            $doctorName = $prescription->doctor ? $prescription->doctor->name : 'Unknown Doctor';
            $activities[] = [
                'type' => 'prescription',
                'message' => "New prescription #{$prescription->prescription_number} from Dr. {$doctorName}",
                'timestamp' => $prescription->created_at,
                'status' => $prescription->status,
            ];
        }

        // Sort by timestamp and limit
        usort($activities, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get analytics data for charts and graphs.
     */
    public function analytics(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $period = $request->get('period', '30'); // days
            $fromDate = now()->subDays($period);
            $toDate = now();

            $analytics = [
                'orders' => $this->getOrderAnalytics($fromDate, $toDate, $user),
                'prescriptions' => $this->getPrescriptionAnalytics($fromDate, $toDate, $user),
                'revenue' => $this->getRevenueAnalytics($fromDate, $toDate, $user),
                'inventory' => $this->getInventoryAnalytics($fromDate, $toDate, $user),
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve analytics data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order analytics.
     */
    private function getOrderAnalytics($fromDate, $toDate, $user): array
    {
        $query = Order::query();
        
        if ($user->role === 'pharmacist' && $user->pharmacy_id) {
            $query->forPharmacy($user->pharmacy_id);
        } elseif ($user->role === 'patient') {
            $query->forUser($user->id);
        }

        $orders = $query->whereBetween('created_at', [$fromDate, $toDate])->get();

        return [
            'total' => $orders->count(),
            'by_status' => $orders->groupBy('status')->map->count(),
            'by_day' => $orders->groupBy(function($order) {
                return $order->created_at->format('Y-m-d');
            })->map->count(),
            'total_revenue' => $orders->sum('total_amount'),
        ];
    }

    /**
     * Get prescription analytics.
     */
    private function getPrescriptionAnalytics($fromDate, $toDate, $user): array
    {
        $query = Prescription::query();
        
        if ($user->role === 'pharmacist' && $user->pharmacy_id) {
            $query->forPharmacy($user->pharmacy_id);
        } elseif ($user->role === 'patient') {
            $query->forUser($user->id);
        }

        $prescriptions = $query->whereBetween('created_at', [$fromDate, $toDate])->get();

        return [
            'total' => $prescriptions->count(),
            'by_status' => $prescriptions->groupBy('status')->map->count(),
            'by_day' => $prescriptions->groupBy(function($prescription) {
                return $prescription->created_at->format('Y-m-d');
            })->map->count(),
        ];
    }

    /**
     * Get revenue analytics.
     */
    private function getRevenueAnalytics($fromDate, $toDate, $user): array
    {
        $query = Order::where('status', '!=', 'cancelled');
        
        if ($user->role === 'pharmacist' && $user->pharmacy_id) {
            $query->forPharmacy($user->pharmacy_id);
        } elseif ($user->role === 'patient') {
            $query->forUser($user->id);
        }

        $orders = $query->whereBetween('created_at', [$fromDate, $toDate])->get();

        return [
            'total_revenue' => $orders->sum('total_amount'),
            'by_day' => $orders->groupBy(function($order) {
                return $order->created_at->format('Y-m-d');
            })->map->sum('total_amount'),
            'average_order_value' => $orders->avg('total_amount'),
        ];
    }

    /**
     * Get inventory analytics.
     */
    private function getInventoryAnalytics($fromDate, $toDate, $user): array
    {
        $query = InventoryTransaction::query();
        
        if ($user->role === 'pharmacist' && $user->pharmacy_id) {
            $query->forPharmacy($user->pharmacy_id);
        }

        $transactions = $query->whereBetween('created_at', [$fromDate, $toDate])->get();

        return [
            'total_transactions' => $transactions->count(),
            'stock_in' => $transactions->where('type', 'in')->sum('quantity_change'),
            'stock_out' => abs($transactions->where('type', 'out')->sum('quantity_change')),
            'by_type' => $transactions->groupBy('type')->map->count(),
        ];
    }
}
