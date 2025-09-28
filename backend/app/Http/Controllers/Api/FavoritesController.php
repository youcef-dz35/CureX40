<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FavoritesController extends Controller
{
    /**
     * Get user's favorite medications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $query = $user->favoriteMedications()
                ->with('medication')
                ->orderBy('created_at', 'desc');

            // Filter by category
            if ($request->has('category') && !empty($request->category)) {
                $query->whereHas('medication', function ($q) use ($request) {
                    $q->where('category', $request->category);
                });
            }

            // Search by medication name or brand
            if ($request->has('search') && !empty($request->search)) {
                $searchTerms = explode(' ', trim($request->search));
                $query->whereHas('medication', function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        if (strlen($term) > 0) {
                            $q->where(function ($subQuery) use ($term) {
                                $subQuery->whereRaw("LOWER(name) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(brand) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(generic_name) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(dosage) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(form) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(category) LIKE LOWER(?)", ["%{$term}%"])
                                    ->orWhereRaw("LOWER(description) LIKE LOWER(?)", ["%{$term}%"]);
                            });
                        }
                    }
                });
            }

            // Sort options
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'name':
                    $query->join('medications', 'favorites.medication_id', '=', 'medications.id')
                          ->orderBy('medications.name', $sortOrder);
                    break;
                case 'price':
                    $query->join('medications', 'favorites.medication_id', '=', 'medications.id')
                          ->orderBy('medications.price', $sortOrder);
                    break;
                case 'times_ordered':
                    $query->orderBy('times_ordered', $sortOrder);
                    break;
                default:
                    $query->orderBy('created_at', $sortOrder);
            }

            $perPage = min($request->get('per_page', 20), 50);
            $favorites = $query->paginate($perPage);

            // Transform the data
            $favoritesData = $favorites->getCollection()->map(function ($favorite) {
                $medication = $favorite->medication;
                return [
                    'id' => $favorite->id,
                    'medication_id' => $medication->id,
                    'name' => $medication->name,
                    'brand' => $medication->brand,
                    'strength' => $medication->strength,
                    'dosage_form' => $medication->dosage_form,
                    'price' => $medication->price,
                    'stock' => $medication->stock,
                    'category' => $medication->category,
                    'image_url' => $medication->image_url,
                    'added_at' => $favorite->created_at,
                    'last_ordered' => $favorite->last_ordered,
                    'times_ordered' => $favorite->times_ordered,
                ];
            });

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Favorites retrieved successfully',
                'data' => $favoritesData,
                'meta' => [
                    'current_page' => $favorites->currentPage(),
                    'last_page' => $favorites->lastPage(),
                    'per_page' => $favorites->perPage(),
                    'total' => $favorites->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to retrieve favorites',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Add medication to favorites
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'medication_id' => ['required', 'integer', 'exists:medications,id'],
            ]);

            $user = Auth::user();
            $medication = Medication::find($validated['medication_id']);

            // Check if already in favorites
            if ($user->favoriteMedications()->where('medication_id', $medication->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'status' => 409,
                    'message' => 'Medication is already in favorites',
                ], 409);
            }

            // Add to favorites
            $favorite = $user->favoriteMedications()->create([
                'medication_id' => $medication->id,
            ]);

            $favorite->load('medication');

            return response()->json([
                'success' => true,
                'status' => 201,
                'message' => 'Medication added to favorites',
                'data' => [
                    'id' => $favorite->id,
                    'medication_id' => $medication->id,
                    'name' => $medication->name,
                    'brand' => $medication->brand,
                    'strength' => $medication->strength,
                    'dosage_form' => $medication->dosage_form,
                    'price' => $medication->price,
                    'stock' => $medication->stock,
                    'category' => $medication->category,
                    'image_url' => $medication->image_url,
                    'added_at' => $favorite->created_at,
                    'times_ordered' => 0,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'status' => 422,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to add to favorites',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove medication from favorites
     */
    public function destroy(string $medicationId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $favorite = $user->favoriteMedications()
                ->where('medication_id', $medicationId)
                ->first();

            if (!$favorite) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Medication not found in favorites',
                ], 404);
            }

            $favorite->delete();

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Medication removed from favorites',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to remove from favorites',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Check if medication is in favorites
     */
    public function check(string $medicationId): JsonResponse
    {
        try {
            $user = Auth::user();
            $isFavorite = $user->favoriteMedications()
                ->where('medication_id', $medicationId)
                ->exists();

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Favorite status retrieved',
                'data' => [
                    'is_favorite' => $isFavorite,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to check favorite status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get favorites summary
     */
    public function summary(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $totalFavorites = $user->favoriteMedications()->count();
            $inStock = $user->favoriteMedications()
                ->whereHas('medication', function ($q) {
                    $q->where('stock', '>', 0);
                })
                ->count();
            $previouslyOrdered = $user->favoriteMedications()
                ->where('times_ordered', '>', 0)
                ->count();
            
            $categories = $user->favoriteMedications()
                ->join('medications', 'favorites.medication_id', '=', 'medications.id')
                ->distinct()
                ->pluck('medications.category')
                ->filter()
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Favorites summary retrieved',
                'data' => [
                    'total_favorites' => $totalFavorites,
                    'in_stock' => $inStock,
                    'previously_ordered' => $previouslyOrdered,
                    'categories' => $categories,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Failed to retrieve favorites summary',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
