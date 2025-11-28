<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\AdminRegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Spatie\Permission\Models\Role;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login user and create API token.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is not active. Please contact support.'
            ], 403);
        }

        // Revoke all tokens...
        $user->tokens()->delete();

        // Create new token with static name
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user->load(['citizen', 'employee'])),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
    /**
     * Register a new citizen user.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'citizen',
                'status' => 'active',
            ]);

            // Create citizen profile
            $user->citizen()->create([
                'national_id' => $request->national_id,
                'address' => $request->address,
                'contact' => $request->contact,
                'date_of_birth' => $request->date_of_birth,
            ]);

            // Assign 'citizen' role if Spatie Permission is installed
            if (class_exists('Spatie\Permission\Models\Role')) {
                $user->assignRole('citizen');
            }

            // Generate API token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'user' => new UserResource($user->load('citizen')),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        });
    }

    /**
     * Register a new admin user.
     *
     * @param AdminRegisterRequest $request
     * @return JsonResponse
     */
    public function adminRegister(AdminRegisterRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->status ?? 'active',
            ]);

            // Assign role
            $user->assignRole($request->role);

            // Create profile based on role
            if ($request->role === 'citizen') {
                $user->citizen()->create([
                    'national_id' => $request->national_id,
                    'address' => $request->address,
                    'contact' => $request->contact,
                    'date_of_birth' => $request->date_of_birth,
                ]);
            } else {
                $user->employee()->create([
                    'department' => $request->department,
                    'position' => $request->position,
                    'hire_date' => $request->hire_date,  
                    'salary' => $request->salary
                ]);
            }

            // Generate API token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'User registered successfully',
                'user' => new UserResource($user->load(['citizen', 'employee'])),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        });
    }



}