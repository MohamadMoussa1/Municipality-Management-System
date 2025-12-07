<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\citizenRequest\StoreRequestRequest;
use App\Models\CitizenRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Http\Resources\CitizenRequest\CitizenRequestResource;

class citizenRequestController extends Controller
{
    public function store(StoreRequestRequest $request)
    {
        // The request validation is handled by StoreRequestRequest

        // Logic to store the citizen request goes here
        $user = $request->user();

        if ($user->role !== 'citizen') {
            return response()->json([
                'message' => 'Only citizens can submit requests.'
            ], 403);

        // Assuming a CitizenRequest model exists
        }
        if (!$user->citizen) {
        return response()->json([
            'message' => 'Citizen profile not found for this user.'
        ], 400);
    }
        $newRequest = CitizenRequest::create([
            'citizen_id' => $user->citizen->id,
            'type' => $request->type,
            'status' => 'pending',
            'submission_date' => now(),
        ]);

        return response()->json([
            'message' => 'Citizen request submitted successfully.',
            'request' => $newRequest,
        ], 201);
    }

    // Get requests for the authenticated citizen
    public function myRequests(Request $request)
    {  
        $user = $request->user();

        if ($user->role !== 'citizen') {
            return response()->json([
                'message' => 'Only citizens can view their requests.'
            ], 403);
        }

        $requests = CitizenRequest::where('citizen_id', $user->citizen->id)->orderBy('submission_date', 'desc')->get();;

        return response()->json([
            'message' => 'My requests fetched successfully.',
            'requests' => CitizenRequestResource::collection($requests)
        ], 200);
    }

    // 
    public function departmentRequests(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $requests = CitizenRequest::orderBy('submission_date', 'desc')->get();

            return response()->json([
                'role' => 'admin',
                'message' => 'All requests fetched successfully.',
                'requests' => $requests
            ], 200);
        }
        // 1. Check if user is an employee
        $employee = $user->employee;
        if ($user->role !== 'clerk') {
            return response()->json([
                'message' => 'Only clerk can view department requests.'
            ], 403);
        }
        if ($employee->department !== 'public_services') {
            return response()->json([
                'message' => 'No requests assigned to your department.'
            ], 200);
        }
        // 2. Fetch requests assigned to the employee's department

        $requests = CitizenRequest::all();
        return response()->json($requests, 200);
    }

    // Update request status by employee
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        // 1. Check if user is an employee
        if ($user->role !== 'clerk' && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Only clerk and admin can update request status.'
            ], 403);  
            
        }
        $citizenRequest = CitizenRequest::find($id);
        if (!$citizenRequest) {
            return response()->json([
                'message' => 'Citizen request not found.'
            ], 404);
        }

        // update status
        $citizenRequest->status = $request->status;
        if($request->status === 'completed'){
            $citizenRequest->completion_date = now();
        }
        $citizenRequest->save();

        // Send notification to citizen
        $citizenRequest->citizen->user->notify(new \App\Notifications\CitizenRequestStatusUpdated($citizenRequest));
        
        return response()->json([
            'message' => 'Request status updated successfully.',
            'request' => $citizenRequest
        ], 200);

    }

    // Get a specific request for the authenticated citizen
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $citizenRequest = CitizenRequest::find($id);

        // 1. Check if request exists
        if (!$citizenRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        // 2. Allow access for admin and clerk
        if (in_array($user->role, ['admin', 'clerk'])) {
            return response()->json([
                'request' => $citizenRequest
            ]);
        }

        // 3. For citizens, ensure the request belongs to them
        if ($user->role === 'citizen') {
            if (!$user->citizen || $citizenRequest->citizen_id !== $user->citizen->id) {
                return response()->json(['message' => 'Unauthorized access.'], 403);
            }
            return response()->json([
                'request' => $citizenRequest
            ]);
        }

        // 4. If none of the above, deny access
        return response()->json(['message' => 'Unauthorized access.'], 403);
    }   

    
    /**
     * Remove the specified request (Admin and Clerk only)
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
{
    $user = $request->user();
    $citizenRequest = CitizenRequest::find($id);

    // Check if request exists
    if (!$citizenRequest) {
        return response()->json([
            'message' => 'Request not found.'
        ], 404);
    }

    // Allow admin and clerk to delete any request
    // Allow citizens to delete only their own requests
    if (!in_array($user->role, ['admin', 'clerk']) && 
        ($user->role !== 'citizen' || !$user->citizen || $citizenRequest->citizen_id !== $user->citizen->id)) {
        return response()->json([
            'message' => 'Unauthorized.'
        ], 403);
    }

    try {
        $citizenRequest->delete();
        
        return response()->json([
            'message' => 'Request deleted successfully.'
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to delete request.',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
