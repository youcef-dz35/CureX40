<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Placeholder response until Order model and resources are implemented
        return response()->json([
            'data' => [],
            'message' => 'Orders listing not yet implemented',
        ]);
    }

    public function store(Request $request)
    {
        // Placeholder create validation and response
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.medication_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        return response()->json([
            'message' => 'Order creation not yet implemented',
            'payload' => $validated,
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json([
            'id' => $id,
            'message' => 'Order details not yet implemented',
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        return response()->json([
            'id' => $id,
            'message' => 'Order status update not yet implemented',
            'status' => $validated['status'] ?? null,
        ]);
    }
}


