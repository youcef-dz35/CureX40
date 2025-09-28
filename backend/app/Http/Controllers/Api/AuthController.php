<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            "first_name" => ["required", "string", "max:100"],
            "last_name" => ["required", "string", "max:100"],
            "email" => [
                "required",
                "string",
                "email",
                "max:255",
                "unique:users,email",
            ],
            "password" => [
                "required",
                "confirmed",
                Password::min(8)->letters()->numbers(),
            ],
        ]);

        $user = User::create([
            "name" => $validated["first_name"] . " " . $validated["last_name"],
            "first_name" => $validated["first_name"],
            "last_name" => $validated["last_name"],
            "email" => $validated["email"],
            "password" => Hash::make($validated["password"]),
            "is_active" => true,
        ]);

        // Default role as patient
        if (method_exists($user, "assignRole")) {
            $user->assignRole("patient");
        }

        $token = $user->createToken("api")->plainTextToken;

        // Get user with role information
        $userWithRole = $user->load('roles');
        $userData = $userWithRole->toArray();
        $userData['role'] = $userWithRole->roles->first()?->name ?? 'patient';

        return response()->json(
            [
                "success" => true,
                "status" => 201,
                "message" => "User registered successfully",
                "data" => [
                    "user" => $userData,
                    "token" => $token,
                    "token_type" => "Bearer",
                    "expires_in" => config("sanctum.expiration") * 60 ?? null,
                ],
            ],
            201,
        );
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            "email" => ["required", "email"],
            "password" => ["required", "string"],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 422,
                    "message" => "Invalid credentials",
                    "errors" => [
                        "email" => ["The provided credentials are incorrect."],
                    ],
                ],
                422,
            );
        }

        /** @var User $user */
        $user = User::where("email", $credentials["email"])->firstOrFail();

        // Check if user is active
        if (!$user->is_active) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 422,
                    "message" => "Account is inactive",
                    "errors" => [
                        "account" => [
                            "Your account has been deactivated. Please contact support.",
                        ],
                    ],
                ],
                422,
            );
        }

        $token = $user->createToken("api")->plainTextToken;

        // Update last login timestamp
        if (method_exists($user, "updateLastLogin")) {
            $user->updateLastLogin();
        } else {
            $user->update(["last_login_at" => now()]);
        }

        // Get user with role information
        $userWithRole = $user->load('roles');
        $userData = $userWithRole->toArray();
        $userData['role'] = $userWithRole->roles->first()?->name ?? 'patient'; // Default to patient if no role

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Login successful",
            "data" => [
                "user" => $userData,
                "token" => $token,
                "token_type" => "Bearer",
                "expires_in" => config("sanctum.expiration") * 60 ?? null,
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Logged out successfully",
            "data" => null,
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $userWithRole = $user->load('roles');
        $userData = $userWithRole->toArray();
        $userData['role'] = $userWithRole->roles->first()?->name ?? 'patient'; // Default to patient if no role

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "User retrieved successfully",
            "data" => $userData,
        ]);
    }

    /**
     * Refresh token (optional implementation)
     */
    public function refresh(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 401,
                    "message" => "Unauthenticated",
                    "errors" => [
                        "token" => ["Token is invalid or expired"],
                    ],
                ],
                401,
            );
        }

        // Revoke current token
        $user->currentAccessToken()?->delete();

        // Create new token
        $token = $user->createToken("api")->plainTextToken;

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Token refreshed successfully",
            "data" => [
                "user" => $user,
                "token" => $token,
                "token_type" => "Bearer",
                "expires_in" => config("sanctum.expiration") * 60 ?? null,
            ],
        ]);
    }

    /**
     * Forgot password (send reset link)
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            "email" => ["required", "email", "exists:users,email"],
        ]);

        // TODO: Implement password reset logic
        // For now, just return a success message

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Password reset link sent to your email",
            "data" => null,
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            "email" => ["required", "email", "exists:users,email"],
            "token" => ["required", "string"],
            "password" => [
                "required",
                "confirmed",
                Password::min(8)->letters()->numbers(),
            ],
        ]);

        // TODO: Implement password reset verification and update logic
        // For now, just return a success message

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Password reset successfully",
            "data" => null,
        ]);
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            "current_password" => ["required", "string"],
            "password" => [
                "required",
                "confirmed",
                Password::min(8)->letters()->numbers(),
            ],
        ]);

        /** @var User $user */
        $user = $request->user();

        // Check current password
        if (!Hash::check($validated["current_password"], $user->password)) {
            return response()->json(
                [
                    "success" => false,
                    "status" => 422,
                    "message" => "Current password is incorrect",
                    "errors" => [
                        "current_password" => [
                            "The current password is incorrect.",
                        ],
                    ],
                ],
                422,
            );
        }

        // Update password
        $user->update([
            "password" => Hash::make($validated["password"]),
        ]);

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Password changed successfully",
            "data" => null,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            "first_name" => ["sometimes", "string", "max:100"],
            "last_name" => ["sometimes", "string", "max:100"],
            "phone" => ["nullable", "string", "max:20"],
            "date_of_birth" => ["nullable", "date"],
            "gender" => ["nullable", "string", "in:male,female,other"],
            // Add other profile fields as needed
        ]);

        $user->update($validated);

        return response()->json([
            "success" => true,
            "status" => 200,
            "message" => "Profile updated successfully",
            "data" => $user->fresh(),
        ]);
    }
}
