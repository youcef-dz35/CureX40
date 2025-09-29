<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HealthRecordController extends Controller
{
    /**
     * Get all health records for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $records = HealthRecord::forUser($user->id)
            ->orderBy('record_date', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Create a new health record.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:prescription,lab_result,imaging,consultation,vaccination,other',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'provider_name' => 'nullable|string|max:255',
            'record_date' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $data = $request->only(['type', 'title', 'description', 'provider_name', 'record_date']);
        $data['user_id'] = $user->id;
        $data['provider_id'] = $user->id; // Default to current user as provider

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('health_records', $fileName, 'private');
            
            $data['file_path'] = $filePath;
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_type'] = $file->getClientOriginalExtension();
        }

        $record = HealthRecord::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Health record created successfully',
            'data' => $record
        ], 201);
    }

    /**
     * Get a specific health record.
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        $record = HealthRecord::forUser($user->id)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $record
        ]);
    }

    /**
     * Update a health record.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $record = HealthRecord::forUser($user->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:prescription,lab_result,imaging,consultation,vaccination,other',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'provider_name' => 'nullable|string|max:255',
            'record_date' => 'sometimes|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['type', 'title', 'description', 'provider_name', 'record_date']);

        // Handle file upload if present
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($record->file_path && Storage::disk('private')->exists($record->file_path)) {
                Storage::disk('private')->delete($record->file_path);
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('health_records', $fileName, 'private');
            
            $data['file_path'] = $filePath;
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_type'] = $file->getClientOriginalExtension();
        }

        $record->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Health record updated successfully',
            'data' => $record
        ]);
    }

    /**
     * Delete a health record.
     */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        $record = HealthRecord::forUser($user->id)->findOrFail($id);

        // Delete associated file if exists
        if ($record->file_path && Storage::disk('private')->exists($record->file_path)) {
            Storage::disk('private')->delete($record->file_path);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Health record deleted successfully'
        ]);
    }

    /**
     * Download a health record file.
     */
    public function download($id): JsonResponse
    {
        $user = Auth::user();
        $record = HealthRecord::forUser($user->id)->findOrFail($id);

        if (!$record->file_path || !Storage::disk('private')->exists($record->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        return Storage::disk('private')->download($record->file_path, $record->file_name);
    }
}