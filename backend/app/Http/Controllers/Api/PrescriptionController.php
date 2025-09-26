<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => [],
            'message' => 'Prescriptions listing not yet implemented',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:png,jpg,jpeg,pdf'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        return response()->json([
            'message' => 'Prescription upload not yet implemented',
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json([
            'id' => $id,
            'message' => 'Prescription details not yet implemented',
        ]);
    }
}


