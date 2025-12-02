<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ProfileResources\EmployeeResource;
use App\Http\Resources\TaskResource;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Models\Task;
use Illuminate\Http\Response;

class EmployeeController extends Controller
{
    /**
     * Display a listing of all employees (admin only).
     */
    public function index()
    {
        $user = Auth::user();
        
        // Only allow admin to list all employees
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can view all employees.'
            ], 403);
        }

        $employees = Employee::with('user')->get();
        return EmployeeResource::collection($employees);
    }

    /**
     * Display the specified employee's information.
     */
    public function show(string $identifier)
    {
        $user = Auth::user();
        
        // Find employee by user ID, name, or email
        $query = Employee::with('user');
        
        if (is_numeric($identifier)) {
            $query->where('id', $identifier);
        } else {
            $query->whereHas('user', function($q) use ($identifier) {
                $q->where('email', $identifier)
                  ->orWhere('name', 'like', '%' . $identifier . '%');
            });
        }
        
        $employee = $query->firstOrFail();

        // Check if the user is authorized to view this employee
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. You can only view your own information.'
            ], 403);
        }

        return new EmployeeResource($employee);
    }

    /**
     * Display the currently authenticated employee's information.
     */
    public function me()
    {
        $employee = Employee::with('user')
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return new EmployeeResource($employee);
    }

    /**
     * Get tasks assigned to the currently authenticated employee
     */
    public function myTasks()
    {
        $employee = Employee::where('user_id', Auth::id())->firstOrFail();
        $tasks = $employee->tasks()
            ->with(['project', 'assignee.user']) // Eager load relationships
            ->orderBy('created_at', 'desc')
            ->get();

        return TaskResource::collection($tasks);
    }

    /**
     * Update the status of a task assigned to the authenticated employee.
     */
    public function updateTaskStatus(UpdateTaskStatusRequest $request, Task $task)
    {
        // Verify the task is assigned to the authenticated employee
        if ($task->assignee_id !== Auth::user()->employee->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only update tasks assigned to you.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Update the task status
        $task->update([
            'status' => $request->status
        ]);

        // Reload the task with relationships
        $task->load(['project', 'assignee.user']);

        return new TaskResource($task);
    }

    /**
     * Update the specified employee's information (admin only).
     */
    public function updateByAdmin(Request $request, string $id)
    {
        $user = Auth::user();
        $employee = Employee::findOrFail($id);

        // Check if the user is authorized to update this employee
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can update employee information.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $employee->user_id,
            'role' => 'sometimes|in:finance_officer,urban_planner,hr_manager,clerk',
            'position' => 'sometimes|string|max:255',
            'department' => 'sometimes|in:finance,it,hr,planning,public_services',
            'hire_date' => 'sometimes|date|before_or_equal:today',
            'salary' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,suspended'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user information if provided
        if ($request->has('name') || $request->has('email') || $request->has('status') || $request->has('role') ) {
            $userData = $request->only(['name', 'email', 'status','role']);
            User::where('id', $employee->user_id)->update($userData);
        }

        // Update employee information
        $employeeData = $request->only(['position', 'department', 'hire_date', 'salary']);
        $employee->update($employeeData);

        // Refresh the model to get updated data
        $employee->refresh();
        $employee->load('user');

        return EmployeeResource::withMessage(new EmployeeResource($employee), 'Employee information updated successfully');
    }

    /**
     * Update the authenticated employee's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user information if provided
        if ($request->has('name') || $request->has('email')) {
            $userData = $request->only(['name', 'email']);
            $user->update($userData);
        }


        // Refresh the model to get updated data
        $employee->refresh();
        $employee->load('user');

        return EmployeeResource::withMessage(new EmployeeResource($employee), 'Profile updated successfully');
    }
}
