<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Payroll;
use App\Models\User;
use Illuminate\Support\Facades\DB;



class PayrollController extends Controller
{
    public function generate(Request $request): JsonResponse
{
    //Authenticate and authorize user
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

    $request->validate([
        'month' => 'required|date_format:Y-m'
    ]);

    $month = $request->month;

    // Prevent duplicate payroll generation
   if (Payroll::where('month', $month)->count() > 0) {
        return response()->json([
            'message' => 'Payroll already generated for this month.'
        ], 409);
    }

    DB::beginTransaction();

    try {
        $employees = User::whereHas('employee')->with('employee')->get();

        foreach ($employees as $employee) {

            $baseSalary = $employee->salary; // must exist in users table
            $deductions = 0;
            $bonuses = 0;

            // Example: deduct unpaid leaves
            $unpaidLeaves = $employee->leaves()
                ->where('status', 'approved')
                ->where('type', 'unpaid')
                ->whereMonth('start_date', substr($month, 5, 2))
                ->count();

            $deductions = $unpaidLeaves * 50; // example logic

            $netSalary = $baseSalary - $deductions + $bonuses;

            Payroll::create([
                'employee_id' => $employee->id,
                'month' => $month,
                'base_salary' => $baseSalary,
                'deductions' => $deductions,
                'bonuses' => $bonuses,
                'net_salary' => $netSalary,
                'generated_by' => $request->user()->id,
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

        return response()->json([
            'message' => 'Payroll generation failed.',
            'error' => config('app.debug') ? $e->getMessage() : 'Server error'
        ], 500);
    }
}
}
