<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HRDashboardController extends Controller
{
    public function dashboardStats(Request $request): JsonResponse
    {
        if (!$request->user() || !in_array($request->user()->role, ['hr_manager', 'admin'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $totalEmployees = Employee::count();
        
        $allDepartments = ['finance', 'it', 'hr', 'planning', 'public_services'];
        
        $employeesByDepartment = Employee::query()
            ->selectRaw('department, COUNT(*) as employee_count')
            ->groupBy('department')
            ->orderBy('employee_count', 'desc')
            ->get()
            ->keyBy('department');

        $result = [];
        foreach ($allDepartments as $department) {
            $result[] = [
                'department' => $department,
                'employee_count' => $employeesByDepartment->has($department) 
                    ? $employeesByDepartment[$department]->employee_count 
                    : 0
            ];
        }

        return response()->json([
            'total_employees' => $totalEmployees,
            'employees_by_department' => $result,
        ], 200);
    }
    public function humanResStat(Request $request): JsonResponse
    {
        if (!$request->user() || !in_array($request->user()->role, [ 'admin'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $totalEmployees = Employee::count();
        $pendingLeaveRequests = Leave::where('status', 'pending')->count();
        $totalApprovedLeaveRequests = Leave::where('status', 'approved')->count();
        $totalLeaveRequests = Leave::count();

        return response()->json([
            'total_employees' => $totalEmployees,
            'total_leave_request'=>$totalLeaveRequests,
            'total_approved_leave_requests'=>$totalApprovedLeaveRequests,
            'pending_leave_requests'=>$pendingLeaveRequests
        ], 200);
    }

    public function pendingLeaveRequests(Request $request): JsonResponse
    {
        if (!$request->user() || !in_array($request->user()->role, ['hr_manager', 'admin'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $pendingLeaveRequests = Leave::where('status', 'pending')->count();

        return response()->json([
            'pending_leave_requests' => $pendingLeaveRequests,
        ], 200);
    }
    //total tasks
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
}
