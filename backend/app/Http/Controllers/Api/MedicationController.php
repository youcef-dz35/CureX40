<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MedicationController extends Controller
{
    /**
     * Get paginated list of medications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Medication::query();

            // Apply active filter by default
            $query->where("is_active", true);

            // Apply filters
            if ($category = $request->query("category")) {
                $query->where("category", $category);
            }

            if ($form = $request->query("form")) {
                $query->where("form", $form);
            }

            if ($request->has("available") && $request->boolean("available")) {
                $query->where("is_available", true)->where("stock", ">", 0);
            }

            if ($search = $request->query("search")) {
                $searchTerms = explode(' ', trim($search));
                $query->where(function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        if (strlen($term) > 0) {
                            $q->where(function ($subQuery) use ($term) {
                                $subQuery->whereRaw("LOWER(name) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(generic_name) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(brand) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(description) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(category) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(dosage) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(form) LIKE LOWER(?)", ["%{$term}%"]);
                            });
                        }
                    }
                });
            }

            if ($request->has("prescription_required")) {
                $query->where(
                    "requires_prescription",
                    $request->boolean("prescription_required"),
                );
            }

            if ($pharmacyId = $request->query("pharmacy_id")) {
                // TODO: Implement pharmacy-specific filtering when pharmacy_medications table exists
            }

            // Price range filters
            if ($minPrice = $request->query("min_price")) {
                $query->where("price", ">=", $minPrice);
            }

            if ($maxPrice = $request->query("max_price")) {
                $query->where("price", "<=", $maxPrice);
            }

            // Sorting
            $sortBy = $request->query("sort_by", "name");
            $sortOrder = $request->query("sort_order", "asc");

            $allowedSortFields = ["name", "price", "created_at", "stock"];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy(
                    $sortBy,
                    $sortOrder === "desc" ? "desc" : "asc",
                );
            }

            // Pagination
            $perPage = min((int) $request->query("per_page", 20), 100); // Max 100 items per page
            $medications = $query->paginate($perPage);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Medications retrieved successfully",
                "data" => $medications->items(),
                "meta" => [
                    "current_page" => $medications->currentPage(),
                    "from" => $medications->firstItem(),
                    "last_page" => $medications->lastPage(),
                    "per_page" => $medications->perPage(),
                    "to" => $medications->lastItem(),
                    "total" => $medications->total(),
                ],
                "links" => [
                    "first" => $medications->url(1),
                    "last" => $medications->url($medications->lastPage()),
                    "prev" => $medications->previousPageUrl(),
                    "next" => $medications->nextPageUrl(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve medications",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Get single medication by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $medication = Medication::where("is_active", true)->findOrFail($id);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Medication retrieved successfully",
                "data" => $medication,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 404,
                    "message" => "Medication not found",
                    "error" =>
                        "The requested medication does not exist or is not available",
                ],
                404,
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve medication",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Create new medication
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                "name" => ["required", "string", "max:255"],
                "generic_name" => ["nullable", "string", "max:255"],
                "brand_name" => ["nullable", "string", "max:255"],
                "brand" => ["nullable", "string", "max:255"], // For backward compatibility
                "description" => ["nullable", "string"],
                "strength" => ["nullable", "string", "max:100"],
                "dosage_instructions" => ["nullable", "string"],
                "price" => ["required", "numeric", "min:0"],
                "currency" => ["nullable", "string", "size:3"],
                "stock" => ["required", "integer", "min:0"],
                "min_stock" => ["nullable", "integer", "min:0"],
                "max_stock" => ["nullable", "integer", "min:0"],
                "requires_prescription" => ["boolean"],
                "prescription_required" => ["boolean"], // Alternative naming
                "category" => ["nullable", "string", "max:100"],
                "form" => ["nullable", "string", "max:100"],
                "therapeutic_class" => ["nullable", "string", "max:100"],
                "drug_class" => ["nullable", "string", "max:100"],
                "manufacturer" => ["nullable", "string", "max:255"],
                "ndc_number" => ["nullable", "string", "max:50"],
                "barcode" => ["nullable", "string", "max:100"],
                "active_ingredients" => ["nullable", "array"],
                "inactive_ingredients" => ["nullable", "array"],
                "contraindications" => ["nullable", "array"],
                "side_effects" => ["nullable", "array"],
                "warnings" => ["nullable", "array"],
                "storage_instructions" => ["nullable", "string"],
                "route_of_administration" => ["nullable", "string", "max:100"],
                "controlled_substance" => ["boolean"],
                "schedule" => ["nullable", "string", "max:10"],
                "pregnancy_category" => ["nullable", "string", "max:10"],
                "expiration_date" => ["nullable", "date"],
                "lot_number" => ["nullable", "string", "max:100"],
                "images" => ["nullable", "array"],
                "images.*" => ["string", "url"],
                "age_restrictions" => ["nullable", "array"],
                "age_restrictions.min_age" => ["nullable", "integer", "min:0"],
                "age_restrictions.max_age" => ["nullable", "integer", "min:0"],
                "dosage_forms_available" => ["nullable", "array"],
                "package_sizes" => ["nullable", "array"],
            ]);

            // Handle alternative field names
            $validated["requires_prescription"] =
                $validated["requires_prescription"] ??
                ($validated["prescription_required"] ?? false);
            $validated["brand_name"] =
                $validated["brand_name"] ?? ($validated["brand"] ?? null);
            unset($validated["prescription_required"], $validated["brand"]);

            // Set defaults
            $validated["is_active"] = true;
            $validated["is_available"] = ($validated["stock"] ?? 0) > 0;
            $validated["currency"] = $validated["currency"] ?? "USD";
            $validated["created_by"] = $request->user()?->id;

            // Convert arrays to JSON if needed
            $arrayFields = [
                "active_ingredients",
                "inactive_ingredients",
                "contraindications",
                "side_effects",
                "warnings",
                "images",
                "age_restrictions",
                "dosage_forms_available",
                "package_sizes",
            ];
            foreach ($arrayFields as $field) {
                if (isset($validated[$field]) && is_array($validated[$field])) {
                    $validated[$field] = json_encode($validated[$field]);
                }
            }

            $medication = Medication::create($validated);

            return response()->json(
                [
                    "success" => true,
                    "status" => 201,
                    "message" => "Medication created successfully",
                    "data" => $medication->fresh(),
                ],
                201,
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
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
                    "message" => "Failed to create medication",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Update existing medication
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $medication = Medication::findOrFail($id);

            $validated = $request->validate([
                "name" => ["sometimes", "string", "max:255"],
                "generic_name" => ["nullable", "string", "max:255"],
                "brand_name" => ["nullable", "string", "max:255"],
                "brand" => ["nullable", "string", "max:255"], // For backward compatibility
                "description" => ["nullable", "string"],
                "strength" => ["nullable", "string", "max:100"],
                "dosage_instructions" => ["nullable", "string"],
                "price" => ["sometimes", "numeric", "min:0"],
                "currency" => ["nullable", "string", "size:3"],
                "stock" => ["sometimes", "integer", "min:0"],
                "min_stock" => ["nullable", "integer", "min:0"],
                "max_stock" => ["nullable", "integer", "min:0"],
                "requires_prescription" => ["boolean"],
                "prescription_required" => ["boolean"], // Alternative naming
                "category" => ["nullable", "string", "max:100"],
                "form" => ["nullable", "string", "max:100"],
                "therapeutic_class" => ["nullable", "string", "max:100"],
                "drug_class" => ["nullable", "string", "max:100"],
                "manufacturer" => ["nullable", "string", "max:255"],
                "ndc_number" => ["nullable", "string", "max:50"],
                "barcode" => ["nullable", "string", "max:100"],
                "active_ingredients" => ["nullable", "array"],
                "inactive_ingredients" => ["nullable", "array"],
                "contraindications" => ["nullable", "array"],
                "side_effects" => ["nullable", "array"],
                "warnings" => ["nullable", "array"],
                "storage_instructions" => ["nullable", "string"],
                "route_of_administration" => ["nullable", "string", "max:100"],
                "controlled_substance" => ["boolean"],
                "schedule" => ["nullable", "string", "max:10"],
                "pregnancy_category" => ["nullable", "string", "max:10"],
                "expiration_date" => ["nullable", "date"],
                "lot_number" => ["nullable", "string", "max:100"],
                "images" => ["nullable", "array"],
                "images.*" => ["string", "url"],
                "age_restrictions" => ["nullable", "array"],
                "dosage_forms_available" => ["nullable", "array"],
                "package_sizes" => ["nullable", "array"],
                "is_active" => ["boolean"],
                "is_available" => ["boolean"],
            ]);

            // Handle alternative field names
            if (isset($validated["prescription_required"])) {
                $validated["requires_prescription"] =
                    $validated["prescription_required"];
                unset($validated["prescription_required"]);
            }
            if (isset($validated["brand"])) {
                $validated["brand_name"] = $validated["brand"];
                unset($validated["brand"]);
            }

            // Update availability based on stock if stock is being updated
            if (isset($validated["stock"])) {
                $validated["is_available"] = $validated["stock"] > 0;
            }

            $validated["updated_by"] = $request->user()?->id;

            // Convert arrays to JSON if needed
            $arrayFields = [
                "active_ingredients",
                "inactive_ingredients",
                "contraindications",
                "side_effects",
                "warnings",
                "images",
                "age_restrictions",
                "dosage_forms_available",
                "package_sizes",
            ];
            foreach ($arrayFields as $field) {
                if (isset($validated[$field]) && is_array($validated[$field])) {
                    $validated[$field] = json_encode($validated[$field]);
                }
            }

            $medication->update($validated);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Medication updated successfully",
                "data" => $medication->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 404,
                    "message" => "Medication not found",
                    "error" => "The requested medication does not exist",
                ],
                404,
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
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
                    "message" => "Failed to update medication",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Delete/deactivate medication
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $medication = Medication::findOrFail($id);

            // Soft delete by setting is_active to false instead of actual deletion
            $medication->update([
                "is_active" => false,
                "is_available" => false,
                "updated_by" => request()->user()?->id,
            ]);

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Medication deactivated successfully",
                "data" => null,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 404,
                    "message" => "Medication not found",
                    "error" => "The requested medication does not exist",
                ],
                404,
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to delete medication",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Search medications
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->validate([
                "search" => ["required", "string", "min:2"],
                "category" => ["nullable", "string"],
                "form" => ["nullable", "string"],
                "prescription_required" => ["nullable", "boolean"],
                "limit" => ["nullable", "integer", "min:1", "max:50"],
            ]);

            $searchQuery = Medication::query()
                ->where("is_active", true)
                ->where(function ($q) use ($query) {
                    $search = $query["search"];
                    $q->where("name", "like", "%{$search}%")
                        ->orWhere("generic_name", "like", "%{$search}%")
                        ->orWhere("brand", "like", "%{$search}%")
                        ->orWhere("active_ingredients", "like", "%{$search}%");
                });

            if (isset($query["category"])) {
                $searchQuery->where("category", $query["category"]);
            }

            if (isset($query["form"])) {
                $searchQuery->where("form", $query["form"]);
            }

            if (isset($query["prescription_required"])) {
                $searchQuery->where(
                    "requires_prescription",
                    $query["prescription_required"],
                );
            }

            $limit = $query["limit"] ?? 20;
            $results = $searchQuery->limit($limit)->get();

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Search completed successfully",
                "data" => $results,
                "meta" => [
                    "query" => $query["search"],
                    "total_results" => $results->count(),
                    "limit" => $limit,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
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
                    "message" => "Search failed",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }

    /**
     * Get medication by barcode
     */
    public function getByBarcode(string $barcode): JsonResponse
    {
        try {
            $medication = Medication::where("barcode", $barcode)
                ->where("is_active", true)
                ->first();

            if (!$medication) {
                return response()->json(
                    [
                        "success" => false,
                        "status" => 404,
                        "message" => "Medication not found",
                        "error" =>
                            "No medication found with the provided barcode",
                    ],
                    404,
                );
            }

            return response()->json([
                "success" => true,
                "status" => 200,
                "message" => "Medication found successfully",
                "data" => $medication,
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 500,
                    "message" => "Failed to retrieve medication",
                    "error" => config("app.debug")
                        ? $e->getMessage()
                        : "Internal server error",
                ],
                500,
            );
        }
    }
}
