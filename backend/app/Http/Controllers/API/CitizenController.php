<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ProfileResources\CitizenResource;

class CitizenController extends Controller
{
    /**
     * Display a listing of all citizens (admin only).
     */
    public function index()
    {
        $user = Auth::user();
        
        // Only allow admin to list all citizens
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can view all citizens.'
            ], 403);
        }

       $citizens = Citizen::with('user')->get();
        return CitizenResource::collection($citizens);
    

        return response()->json(['data' => $citizens]);
    }

    /**
     * Display the authenticated citizen's information.
     */
    /**
 * Display the specified citizen's information.
 */
    public function show(string $identifier)
    {
        $user = Auth::user();
        
        // Find citizen by ID, name, or email
        $query = Citizen::with('user');
        
        if (is_numeric($identifier)) {
            $query->where('id', $identifier);
        } else {
            $query->whereHas('user', function($q) use ($identifier) {
                $q->where('email', $identifier)
                ->orWhere('name', 'like', '%' . $identifier . '%');
            });
        }
        
        $citizen = $query->firstOrFail();

        // Check if the user is authorized to view this citizen
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. You can only view your own information.'
            ], 403);
        }

        return new CitizenResource($citizen);
    
    }

    /**
     * Display the currently authenticated citizen's information.
     */
    public function me()
    {
        $citizen = Citizen::with('user')
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return new CitizenResource($citizen);
   
    }

    /**
     * Update the specified citizen's information.
     */
    public function updateByAdmin(Request $request, string $id)
    {
        $user = Auth::user();
        $citizen = Citizen::findOrFail($id);

        // Check if the user is authorized to update this citizen
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. You can only update your own information.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $citizen->user_id,
            'national_id' => 'sometimes|string|max:255|unique:citizens,national_id,' . $id,
            'address' => 'sometimes|string|max:500',
            'contact' => 'sometimes|string|max:20',
            'date_of_birth' => 'sometimes|date|before:today',
            'status' => 'sometimes|string|in:active,inactive,suspended'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user information if provided
        if ($request->has('name') || $request->has('email') || $request->has('status')) {
            $userData = $request->only(['name', 'email', 'status']);
            
            User::where('id', $citizen->user_id)->update($userData);
            
            // Dispatch notification only if status changed
            if ($request->has('status')) {
                $citizen->user->notify(new \App\Notifications\UserStatusUpdated($citizen->user));
            }
        }

        // Update citizen information
        $citizenData = $request->only(['national_id', 'address', 'contact', 'date_of_birth']);
        $citizen->update($citizenData);

        // Refresh the model to get updated data
        $citizen->refresh();
        $citizen->load('user');

        return CitizenResource::withMessage(new CitizenResource($citizen), 'Citizen information updated successfully');
  
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $citizen = Citizen::where('user_id', $user->id)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'national_id' => 'sometimes|string|max:255|unique:citizens,national_id,' . $citizen->id,
            'address' => 'sometimes|string|max:500',
            'contact' => 'sometimes|string|max:20',
            'date_of_birth' => 'sometimes|date|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user information if provided
        if ($request->has('name') || $request->has('email')) {
            $user->update($request->only(['name', 'email']));
        }

        // Update citizen information
        $citizen->update($request->only(['national_id', 'address', 'contact', 'date_of_birth']));

        // Refresh the model to get updated data
        $citizen->refresh()->load('user');

        return CitizenResource::withMessage(new CitizenResource($citizen), 'Profile updated successfully');
    }
}
