<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Payroll;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Leave;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;




class PayrollController extends Controller
{
    // Generate payroll for all employees for a given month
        public function generate(Request $request): JsonResponse
    {
        $user = $request->user();

    $allowed = $user->role === 'admin'
        || ($user->role === 'hr_manager'
            && optional($user->employee)->department === 'hr');

    if (!$allowed) {
        return response()->json([
            'message' => 'Only HR managers or admins can generate payroll.'
        ], 403);
    }

    $request->validate([
        'month' => 'required|date_format:Y-m'
    ]);

    $month = $request->month;
    $monthNumber = intval(substr($month, 5, 2));

    // Prevent duplicates
    if (Payroll::where('month', $month)->exists()) {
        return response()->json([
            'message' => 'Payroll already generated for this month.'
        ], 409);
    }

    DB::beginTransaction();

    try {
        $employees = Employee::with(['attendances', 'leaves'])->get();

        foreach ($employees as $employee) {

            $workingDaysPerMonth = 22;
            $hoursPerDay = 8;

            $dailyRate = $employee->salary / $workingDaysPerMonth;
            $hourlyRate = $dailyRate / $hoursPerDay;

            // Attendance
            $workedHours = $employee->attendances()
                ->whereMonth('date', $monthNumber)
                ->sum('hours_worked');

            $attendancePay = $workedHours * $hourlyRate;

            // Unpaid leaves
            $unpaidLeaveDays = $employee->leaves()
                ->where('status', 'approved')
                ->where('type', 'unpaid')
                ->whereMonth('start_date', $monthNumber)
                ->count();

            $unpaidDeduction = $unpaidLeaveDays * $hoursPerDay * $hourlyRate;

            $netSalary = max($attendancePay - $unpaidDeduction, 0);

            Payroll::create([
                'employee_id' => $employee->id,
                'month' => $month,
                'base_salary' => $employee->salary,
                'deductions' => $unpaidDeduction,
                'bonuses' => 0,
                'net_salary' => $netSalary,
                'generated_by' => $user->id,
                'generated_at' => now(),
            ]);
        }

        DB::commit();

        return response()->json([
            'message' => 'Payroll generated successfully.',
            'employees_processed' => $employees->count()
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();

        Log::error('Payroll generation failed: ' . $e->getMessage());

        return response()->json([
            'message' => 'Payroll generation failed.',
            'error' => config('app.debug') ? $e->getMessage() : 'Server error'
        ], 500);
    }
}


// list payroll records with optional filters
   public function index(Request $request): JsonResponse
{
    $user = $request->user();
    $employeeId = optional($user->employee)->id;
// Optional filters
    $request->validate([
        'month' => 'nullable|date_format:Y-m',
        'employee_id' => 'nullable|exists:employees,id',
    ]);

    $query = Payroll::with([
        'employee.user'
    ])->orderBy('generated_at', 'desc');

    $isAdmin = $user->role === 'admin';
    $isHrManager = $user->role === 'hr_manager'
        && optional($user->employee)->department === 'hr';
    $isOwnerEmployee = !is_null($employeeId);

    if (!($isAdmin || $isHrManager || $isOwnerEmployee)) {
        return response()->json([
            'message' => 'Unauthorized.'
        ], 403);
    }

    if (!($isAdmin || $isHrManager)) {
        if ($request->filled('employee_id') && intval($request->employee_id) !== intval($employeeId)) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $query->where('employee_id', $employeeId);
    }

    if ($request->filled('month')) {
        $query->where('month', $request->month);
    }

    if ($request->filled('employee_id')) {
        if ($isAdmin || $isHrManager) {
            $query->where('employee_id', $request->employee_id);
        }
    }

    $payrolls = $query->paginate(10);

    return response()->json([
        'message' => 'Payroll records retrieved successfully.',
        'data' => $payrolls
    ]);
}


// display a specific payroll - admin, hr manager, and the payroll owner
public function show(Request $request, Payroll $payroll): JsonResponse
{
    $user = $request->user();

    // Authorization rules
    $allowed =
        $user->role === 'admin'
        || (
            $user->role === 'hr_manager'
            && optional($user->employee)->department === 'hr'
        )
        || (
            $user->role === 'employee'
            && optional($user->employee)->id === $payroll->employee_id
        );

    if (!$allowed) {
        return response()->json([
            'message' => 'Only HR managers, admins, or the payroll owner can view this payroll.'
        ], 403);
    }

    // Load payroll with employee + user
    $payroll = Payroll::with('employee.user')->find($payroll->id);

    if (!$payroll) {
        return response()->json([
            'message' => 'Payroll not found.'
        ], 404);
    }

    return response()->json([
        'message' => 'Payroll retrieved successfully.',
        'data'    => $payroll
    ], 200);
}

// add bonuses or deductions to a payroll record
public function addAdjustment(Request $request, Payroll $payroll): JsonResponse
{
    $user = $request->user();

    // Authorization
    $allowed =
        $user->role === 'admin'
        || (
            $user->role === 'hr_manager'
            && optional($user->employee)->department === 'hr'
        );

    if (!$allowed) {
        return response()->json([
            'message' => 'Only HR managers or admins can adjust payroll.'
        ], 403);
    }

    // Validation
    $validated = $request->validate([
        'type'   => 'required|in:bonus,deduction',
        'amount' => 'required|numeric|min:1',
        'note'   => 'nullable|string|max:255',
    ]);

    DB::beginTransaction();

    try {
        if ($validated['type'] === 'bonus') {
            $payroll->bonuses += $validated['amount'];
        } else {
            $payroll->deductions += $validated['amount'];
        }

        // Recalculate net salary
        $payroll->net_salary =
            $payroll->base_salary
            + $payroll->bonuses
            - $payroll->deductions;

        $payroll->save();

        DB::commit();

        return response()->json([
            'message' => 'Payroll adjustment applied successfully.',
            'data'    => $payroll
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Failed to apply adjustment.',
            'error'   => config('app.debug') ? $e->getMessage() : 'Server error'
        ], 500);
    }
}
}
