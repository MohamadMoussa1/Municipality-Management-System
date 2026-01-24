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
     * Count the number of 'todo' tasks for the authenticated employee
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function countTodoTasks(Request $request)
    {
        $user = $request->user();
        
        // Ensure the user is an employee
        if ($user->role == 'citizen') {
            return response()->json([
                'message' => 'Unauthorized. Only employees can view their tasks.'
            ], 403);
        }

        $todoCount = Task::where('assignee_id', $user->employee->id)
            ->where('status', 'todo')
            ->count();

        return response()->json([
            'todo_tasks_count' => $todoCount
        ], 200);
    }

    /**
     * Get the latest 3 todo tasks for the authenticated employee
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLatestTodoTasks(Request $request)
    {
        $user = $request->user();
        
        if ($user->role == 'citizen') {
            return response()->json([
                'message' => 'Unauthorized. Only employees can view their tasks.'
            ], 403);
        }

        $tasks = Task::where('assignee_id', $user->employee->id)
            ->where('status', 'todo')
            ->latest('created_at')
            ->take(3)
            ->get();

        return response()->json([
            'tasks' => $tasks,
            'count' => $tasks->count()
        ], 200);
    }


    /**
     * Display a listing of all employees (admin only).
     */
    public function index()
    {
        $user = Auth::user();
        
        // Only allow admin or hr_manager to list all employees
        if (!$user->hasAnyRole(['admin', 'hr_manager','urban_planner'])) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators can view all employees.'
            ], 403);
        }

        $employees = Employee::with('user')->paginate(3);
        return response()->json($employees);
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
        if (!$user->hasAnyRole(['admin', 'hr_manager','urban_planner'])) {
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
            ->paginate(1);

        return response()->json([
               'data'=>$tasks
            ], 200);
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

        return response()->json([
            'message' => 'Task status updated successfully.',
            'task' => new TaskResource($task)
        ], 200);
    }

    /**
     * Update the specified employee's information (admin or hr_manager only).
     */
    public function updateByAdmin(Request $request, string $id)
    {
        $user = Auth::user();
        $employee = Employee::findOrFail($id);

        // Check if the user is authorized to update this employee
        if (!$user->hasAnyRole(['admin', 'hr_manager'])) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators or hr_manager can update employee information.'
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

            // Dispatch notification only if status changed
            if ($request->has('status')) {
                $employee->user->notify(new \App\Notifications\UserStatusUpdated($employee->user));
            }
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
