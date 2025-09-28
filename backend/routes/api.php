<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix("v1")->group(function () {
    // Health check route (public)
    Route::get("health", function () {
        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "API is healthy",
            "data" => [
                "service" => "CureX40 API",
                "version" => "v1",
                "timestamp" => now()->toISOString(),
                "uptime" => "OK",
            ],
        ]);
    });

    // Status endpoint (public)
    Route::get("status", function () {
        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "API status retrieved",
            "data" => [
                "service" => "CureX40 API",
                "version" => "v1",
                "status" => "operational",
                "timestamp" => now()->toISOString(),
                "environment" => app()->environment(),
                "uptime" => time() - LARAVEL_START,
            ],
        ]);
    });

    // Auth Routes
    Route::prefix("auth")->group(function () {
        // Public auth routes
        Route::post("register", [
            \App\Http\Controllers\Api\AuthController::class,
            "register",
        ]);
        Route::post("login", [
            \App\Http\Controllers\Api\AuthController::class,
            "login",
        ]);
        Route::post("forgot-password", [
            \App\Http\Controllers\Api\AuthController::class,
            "forgotPassword",
        ]);
        Route::post("reset-password", [
            \App\Http\Controllers\Api\AuthController::class,
            "resetPassword",
        ]);

        // Protected auth routes
        Route::middleware("auth:sanctum")->group(function () {
            Route::post("logout", [
                \App\Http\Controllers\Api\AuthController::class,
                "logout",
            ]);
            Route::get("user", [
                \App\Http\Controllers\Api\AuthController::class,
                "user",
            ]);
            Route::post("refresh", [
                \App\Http\Controllers\Api\AuthController::class,
                "refresh",
            ]);
            Route::put("profile", [
                \App\Http\Controllers\Api\AuthController::class,
                "updateProfile",
            ]);
            Route::put("password", [
                \App\Http\Controllers\Api\AuthController::class,
                "changePassword",
            ]);
        });
    });

    // Medications Routes
    Route::prefix("medications")->group(function () {
        // Public medication routes
        Route::get("/", [
            \App\Http\Controllers\Api\MedicationController::class,
            "index",
        ]);
        Route::get("search", [
            \App\Http\Controllers\Api\MedicationController::class,
            "search",
        ]);
        Route::get("barcode/{barcode}", [
            \App\Http\Controllers\Api\MedicationController::class,
            "getByBarcode",
        ]);
        Route::get("{id}", [
            \App\Http\Controllers\Api\MedicationController::class,
            "show",
        ]);

        // Protected medication routes (require authentication)
        Route::middleware("auth:sanctum")->group(function () {
            Route::post("/", [
                \App\Http\Controllers\Api\MedicationController::class,
                "store",
            ]);
            Route::put("{id}", [
                \App\Http\Controllers\Api\MedicationController::class,
                "update",
            ]);
            Route::delete("{id}", [
                \App\Http\Controllers\Api\MedicationController::class,
                "destroy",
            ]);

            // Medication interaction and alternatives endpoints
            Route::post("interactions", function (Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Drug interactions checked",
                    "data" => [], // TODO: Implement drug interaction checking
                ]);
            });

            Route::get("{id}/alternatives", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Alternative medications retrieved",
                    "data" => [], // TODO: Implement alternative medication suggestions
                ]);
            });

            // Stock and reservation endpoints
            Route::get("{id}/stock", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Medication stock retrieved",
                    "data" => [], // TODO: Implement stock checking across pharmacies
                ]);
            });

            Route::post("{id}/reserve", function ($id, Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Medication reserved successfully",
                    "data" => [
                        "reservation_id" => "RES-" . strtoupper(uniqid()),
                        "medication_id" => $id,
                        "quantity" => $request->input("quantity", 1),
                        "reserved_until" => now()->addHours(24)->toISOString(),
                    ],
                ]);
            });
        });
    });

    // Orders Routes (all require authentication)
    Route::middleware("auth:sanctum")
        ->prefix("orders")
        ->group(function () {
            Route::get("/", [
                \App\Http\Controllers\Api\OrderController::class,
                "index",
            ]);
            Route::post("/", [
                \App\Http\Controllers\Api\OrderController::class,
                "store",
            ]);
            Route::get("history", [
                \App\Http\Controllers\Api\OrderController::class,
                "history",
            ]);
            Route::get("{id}", [
                \App\Http\Controllers\Api\OrderController::class,
                "show",
            ]);
            Route::put("{id}/status", [
                \App\Http\Controllers\Api\OrderController::class,
                "updateStatus",
            ]);
            Route::delete("{id}", [
                \App\Http\Controllers\Api\OrderController::class,
                "cancel",
            ]);

            // Order items and tracking
            Route::get("{id}/items", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Order items retrieved",
                    "data" => [], // TODO: Implement order items retrieval
                ]);
            });

            Route::get("{id}/tracking", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Order tracking retrieved",
                    "data" => [
                        "order_id" => $id,
                        "status" => "processing",
                        "updates" => [], // TODO: Implement order tracking
                    ],
                ]);
            });

            // Payment and refund routes
            Route::post("{id}/payment", function ($id, Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Payment processed successfully",
                    "data" => [
                        "payment_id" => "PAY-" . strtoupper(uniqid()),
                        "order_id" => $id,
                        "status" => "succeeded",
                    ],
                ]);
            });

            Route::post("{id}/refund", function ($id, Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Refund requested successfully",
                    "data" => [
                        "refund_id" => "REF-" . strtoupper(uniqid()),
                        "order_id" => $id,
                        "status" => "pending",
                    ],
                ]);
            });
        });

    // Prescriptions Routes (all require authentication)
    Route::middleware("auth:sanctum")
        ->prefix("prescriptions")
        ->group(function () {
            Route::get("/", [
                \App\Http\Controllers\Api\PrescriptionController::class,
                "index",
            ]);
            Route::post("/", [
                \App\Http\Controllers\Api\PrescriptionController::class,
                "store",
            ]);
            Route::get("history", [
                \App\Http\Controllers\Api\PrescriptionController::class,
                "history",
            ]);
            Route::get("{id}", [
                \App\Http\Controllers\Api\PrescriptionController::class,
                "show",
            ]);
            Route::put("{id}", [
                \App\Http\Controllers\Api\PrescriptionController::class,
                "update",
            ]);

            // Prescription upload and verification
            Route::post("upload", function (Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Prescription uploaded successfully",
                    "data" => [
                        "prescription_id" => "PRX-" . strtoupper(uniqid()),
                        "status" => "pending_verification",
                    ],
                ]);
            });

            Route::post("{id}/verify", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Prescription verification completed",
                    "data" => [
                        "prescription_id" => $id,
                        "status" => "verified",
                        "verified_at" => now()->toISOString(),
                    ],
                ]);
            });

            Route::get("{id}/medications", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Prescription medications retrieved",
                    "data" => [], // TODO: Implement prescription medications retrieval
                ]);
            });

            Route::post("{id}/refill", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Prescription refill requested",
                    "data" => [
                        "refill_id" => "RFL-" . strtoupper(uniqid()),
                        "prescription_id" => $id,
                        "status" => "pending",
                    ],
                ]);
            });

            Route::post("{id}/transfer", function ($id, Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Prescription transfer initiated",
                    "data" => [
                        "transfer_id" => "TRF-" . strtoupper(uniqid()),
                        "prescription_id" => $id,
                        "new_pharmacy_id" => $request->input("new_pharmacy_id"),
                    ],
                ]);
            });

            // Validation endpoint
            Route::post("validate", function (Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Prescription validation completed",
                    "data" => [
                        "valid" => true,
                        "warnings" => [],
                        "errors" => [],
                    ],
                ]);
            });
        });

    // Pharmacies Routes
    Route::prefix("pharmacies")->group(function () {
        // Public pharmacy routes
        Route::get("/", function (Request $request) {
            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Pharmacies retrieved successfully",
                "data" => [],
                "meta" => [
                    "total" => 0,
                    "per_page" => $request->input("per_page", 20),
                    "current_page" => 1,
                ],
            ]);
        });

        Route::get("search", function (Request $request) {
            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Pharmacy search completed",
                "data" => [],
            ]);
        });

        Route::get("nearby", function (Request $request) {
            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Nearby pharmacies retrieved",
                "data" => [],
            ]);
        });

        Route::get("{id}", function ($id) {
            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Pharmacy retrieved successfully",
                "data" => [
                    "id" => $id,
                    "name" => "Sample Pharmacy",
                    "address" => "123 Main St",
                    "phone" => "+1234567890",
                ],
            ]);
        });

        // Protected pharmacy routes
        Route::middleware("auth:sanctum")->group(function () {
            Route::post("/", function (Request $request) {
                return response()->json(
                    [
                        "success" => true,
                        "status" => 201,
                        "message" => "Pharmacy registered successfully",
                        "data" => [
                            "id" => "PHARM-" . strtoupper(uniqid()),
                        ],
                    ],
                    201,
                );
            });

            Route::put("{id}", function ($id, Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Pharmacy updated successfully",
                    "data" => ["id" => $id],
                ]);
            });

            Route::delete("{id}", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Pharmacy deleted successfully",
                    "data" => null,
                ]);
            });
        });
    });

    // Notifications Routes (require authentication)
    Route::middleware("auth:sanctum")
        ->prefix("notifications")
        ->group(function () {
            Route::get("/", function (Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Notifications retrieved successfully",
                    "data" => [],
                    "meta" => [
                        "total" => 0,
                        "unread" => 0,
                    ],
                ]);
            });

            Route::get("unread-count", function () {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Unread count retrieved",
                    "data" => ["count" => 0],
                ]);
            });

            Route::put("{id}/read", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Notification marked as read",
                    "data" => null,
                ]);
            });

            Route::put("read-all", function () {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "All notifications marked as read",
                    "data" => null,
                ]);
            });

            Route::delete("{id}", function ($id) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Notification deleted successfully",
                    "data" => null,
                ]);
            });

            Route::get("settings", function () {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Notification settings retrieved",
                    "data" => [
                        "email_enabled" => true,
                        "push_enabled" => true,
                        "sms_enabled" => false,
                    ],
                ]);
            });

            Route::put("settings", function (Request $request) {
                return response()->json([
                    "success" => true,
                    "status" => 200,
                    "message" => "Notification settings updated",
                    "data" => $request->all(),
                ]);
            });
        });

    // Inventory Routes
    Route::prefix("inventory")->group(function () {
        Route::get("/transactions", [
            \App\Http\Controllers\Api\InventoryController::class,
            "transactions",
        ]);
        Route::get("/summary", [
            \App\Http\Controllers\Api\InventoryController::class,
            "summary",
        ]);
        Route::get("/low-stock", [
            \App\Http\Controllers\Api\InventoryController::class,
            "lowStock",
        ]);
        Route::post("/add-stock", [
            \App\Http\Controllers\Api\InventoryController::class,
            "addStock",
        ]);
        Route::post("/adjust-stock", [
            \App\Http\Controllers\Api\InventoryController::class,
            "adjustStock",
        ]);
        Route::get("/reports", [
            \App\Http\Controllers\Api\InventoryController::class,
            "reports",
        ]);
    });

    // Dashboard Routes
    Route::middleware("auth:sanctum")->prefix("dashboard")->group(function () {
        Route::get("/", [
            \App\Http\Controllers\Api\DashboardController::class,
            "index",
        ]);
        Route::get("/analytics", [
            \App\Http\Controllers\Api\DashboardController::class,
            "analytics",
        ]);
    });

    // Favorites Routes
    Route::middleware("auth:sanctum")->prefix("favorites")->group(function () {
        Route::get("/", [
            \App\Http\Controllers\Api\FavoritesController::class,
            "index",
        ]);
        Route::post("/", [
            \App\Http\Controllers\Api\FavoritesController::class,
            "store",
        ]);
        Route::delete("/{medicationId}", [
            \App\Http\Controllers\Api\FavoritesController::class,
            "destroy",
        ]);
        Route::get("/check/{medicationId}", [
            \App\Http\Controllers\Api\FavoritesController::class,
            "check",
        ]);
        Route::get("/summary", [
            \App\Http\Controllers\Api\FavoritesController::class,
            "summary",
        ]);
    });

    // Cart Routes
    Route::middleware("auth:sanctum")->prefix("cart")->group(function () {
        Route::get("/", [
            \App\Http\Controllers\Api\CartController::class,
            "index",
        ]);
        Route::post("/items", [
            \App\Http\Controllers\Api\CartController::class,
            "addItem",
        ]);
        Route::put("/items/{itemId}", [
            \App\Http\Controllers\Api\CartController::class,
            "updateItem",
        ]);
        Route::delete("/items/{itemId}", [
            \App\Http\Controllers\Api\CartController::class,
            "removeItem",
        ]);
        Route::delete("/", [
            \App\Http\Controllers\Api\CartController::class,
            "clear",
        ]);
        Route::get("/summary", [
            \App\Http\Controllers\Api\CartController::class,
            "summary",
        ]);
    });

    // Permission check endpoint
    Route::middleware("auth:sanctum")->post("auth/check-permission", function (
        Request $request,
    ) {
        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Permission checked",
            "data" => ["allowed" => true], // TODO: Implement proper permission checking
        ]);
    });

    // Rate limit status endpoint
    Route::get("rate-limit", function () {
        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Rate limit status retrieved",
            "data" => [
                "remaining" => 1000,
                "reset" => now()->addHour()->toISOString(),
                "limit" => 1000,
            ],
        ]);
    });

    // Catch-all route for undefined API endpoints
    Route::fallback(function () {
        return response()->json(
            [
                "success" => false,
                "status" => 404,
                "message" => "API endpoint not found",
                "error" => "The requested API endpoint does not exist",
            ],
            404,
        );
    });
});
