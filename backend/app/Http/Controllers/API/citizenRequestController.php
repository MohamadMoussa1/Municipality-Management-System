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

        // 1. Check if user is an employee
        if ($user->role !== 'clerk' && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Only clerk and admin can view department requests.'
            ], 403);
        }
        
        $employee = $user->employee;

        
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
    // 2. Ensure the request belongs to the logged-in citizen
        if ($citizenRequest->citizen_id !==  $user->citizen->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }
    // 3. Return full details
        return response()->json([
            'request' => $citizenRequest
        ]);
    }
}
