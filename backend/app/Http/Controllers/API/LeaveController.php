<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LeaveController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['error' => 'Employee not found for the authenticated user.'], 404);
        }

          $validator = Validator::make($request->all(), [
            'type' => 'required|in:annual,sick,unpaid,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        
        $validated = $validator->validated();

        try {
            $leave = Leave::create([
                'employee_id' => $employee->id,
                'type'        => $validated['type'],
                'start_date'  => $validated['start_date'],
                'end_date'    => $validated['end_date'],
                'reason'      => $validated['reason'] ?? null,
                'status'      => 'pending',
            ]);

            return response()->json([
                'message' => 'Leave request submitted successfully.',
                'data'    => $leave,
            ], 201);
        } catch (\Exception $e) {
             Log::error('Leave creation failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to submit leave request.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Server error.',
            ], 500);
        }
    }

    public function myLeaves(): JsonResponse
    {
        $user = auth()->user();
        $employee = $user->employee;

        // Authorization: only employees
        if (!$employee) {
            return response()->json([
                'message' => 'Only employees can view their leave requests.'
            ], 403);
        }

        $leaves = Leave::where('employee_id', $employee->id)
            ->orderBy('start_date', 'desc')
            ->paginate(1);

        return response()->json([
            'message' => 'Leave requests retrieved successfully.',
            'data' => $leaves
        ], 200);
    }

    // HR/Admin views all leave requests with filtering
    public function index(Request $request): JsonResponse
    {
        
        $user = $request->user();
      

         // Base query
        $query = Leave::with(['employee.user']);

        // Authorization: only HR/Admin
        
        if ($user->hasAnyRole(['admin', 'hr_manager'])) {
            // allowed to query all records
        }else {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

       

        // Filter by status (pending, approved, rejected)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by employee_id
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by date range
        if ($request->filled('from')) {
            $query->whereDate('start_date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('end_date', '<=', $request->to);
        }
        
        // Order by status (pending first), then by created_at (newest first)
        $query->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
              ->orderBy('created_at', 'desc');
        
        $leaves = $query->paginate(5);
        
       
        return response()->json([
            'message' => 'Leave requests retrieved successfully.',
            'data' => $leaves
        ], 200);
    }

    public function updateStatus(Request $request, Leave $leave): JsonResponse
    {
    
       $user = $request->user();
        // Authorization rules
        $allowed = $user->role === 'admin'
            || ($user->role === 'hr_manager'
                && optional($user->employee)->department === 'hr');

        if (!$allowed) {
            return response()->json([
                'message' => 'Only hr_manager officers in hr department or admins can view payments.'
            ], 403);
        }

        // Validate input
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        // Prevent re-approval
        if ($leave->status !== 'pending') {
            return response()->json([
                'message' => 'This leave request has already been processed.'
            ], 409);
        }

        try {
            $leave->update([
                'status' => $request->status,
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            return response()->json([
                'message' => "Leave request {$request->status} successfully.",
                'data' => $leave
            ], 200);

        } catch (\Exception $e) {
            Log::error('Leave approval failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to update leave status.',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error.'
            ], 500);
        }
    }
}
