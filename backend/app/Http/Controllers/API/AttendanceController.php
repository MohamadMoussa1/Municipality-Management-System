<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Employee;
use App\Http\API\EmployeeController;

class AttendanceController extends Controller
{

    // Employee check-in
   public function checkIn(Request $request)
    {
        $user = $request->user();

        // check if if is employee
        if (!$user->employee) {
            return response()->json(['message' => 'Not an employee.'], 403);
        }
        $employee = $user->employee;

        $today=today()->toDateString();

        // Check if already clocked in today
       $attendance = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if ($attendance) {
            return response()->json(['message' => 'Already checked in today.'], 400);
        }

        try {
            $attendance = Attendance::create([
                'employee_id' => $employee->id,
                'date' => today()->toDateString(),
                'check_in' => now(),
                'hours_worked' => 0,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') { 
                return response()->json(['message' => 'Already checked in today.'], 400);
            }
            throw $e; 
        }

        return response()->json([
            'message' => 'Check-in successful.',
            'attendance' => $attendance
        ], 201);
    }

    // Employee check-out
    public function checkOut(Request $request)
    {
        $user = $request->user();

        // 1. Validate employee exists
        if (!$user->employee) {
            return response()->json(['message' => 'Not an employee.'], 403);
        }
        $employee = $user->employee;
        $today = today()->toDateString();

        // 2. Retrieve today's attendance record
        $attendance = Attendance::where('employee_id', $employee->id) ->whereDate('date', today())->first();

        if (!$attendance) {
            return response()->json(['message' => 'No check-in found for today.'], 404);
        }

        // 3. Validate check-out conditions
        if (!$attendance->check_in) {
            return response()->json(['message' => 'Cannot check out without check-in.'], 400);
        }

        // 4. Validate not already checked out
        if ($attendance->check_out) {
            return response()->json(['message' => 'Already checked out.'], 400);
        }

        // 5.Calculate hours worked (decimal hours rounded to 2 places)
        $checkIn = $attendance->check_in;
        $checkOut = now();
        $hoursWorked = 0;
        if ($checkIn) {
            $hoursWorked = round(($checkOut->getTimestamp() - $checkIn->getTimestamp()) / 3600, 2);
        }

         // 6. Update row
        $attendance->update([
            'check_out' => $checkOut,
            'hours_worked' => $hoursWorked
        ]);

        return response()->json([
            'message' => 'Check-out successful.',
            'attendance' => $attendance
        ], 200);

    }

    // Get attendance records for authenticated employee or admin or HR manager
    // - Admins and hr_manager can list and filter all records
    // - Regular employees can only see their own attendance records
    public function index(Request $request)
    {
        $user = $request->user();

        // Base query
        $query = Attendance::with(['employee.user'])
            ->orderBy('date', 'desc');

        if ($user->hasAnyRole(['admin', 'hr_manager'])) {
            // allowed to query all records
        } elseif ($user->employee) {
            // scope to current employee
            $query->where('employee_id', $user->employee->id);
        } else {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        // Filter by employee_id (admins/hr can filter by others)
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by exact date
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('date', '<=', $request->to_date);
        }

        // Filter employees by department
        if ($request->has('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        // Show only records where employee did not check out
        if ($request->missing_checkout == "1") {
            $query->whereNull('check_out');
        }

        // Get final results
        $attendance = $query->get();

        return response()->json([
            'message' => 'Attendance list retrieved successfully.',
            'data' => $attendance
        ]);

    }

    // Get specific attendance record 
    public function show(Request $request, Attendance $attendance)
    {
        
        $attendance->load('employee.user');

       
        $user = $request->user();
        $authorized = false;

        if ($user->role === 'admin') {
            $authorized = true;
        }
        if ($user->employee) {
            $employee = $user->employee;

            if ($attendance->employee_id === $employee->id) {
                $authorized = true;
            }
            // check it later
            if ($employee->department === 'hr' || $user->role === 'hr_manager') {
                $authorized = true;
            }
        }

        // If not authorized
        if (! $authorized) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'message' => 'Attendance retrieved successfully.',
            'attendance' => $attendance
        ], 200);
    }

    // update attendance record - admin or HR manager only
    public function update(Request $request, Attendance $attendance)
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
        $validated = $request->validate([
            'check_in'  => 'nullable|date',
            'check_out' => 'nullable|date',
        ]);

        
        $checkIn = $validated['check_in'] ?? $attendance->check_in;
        $checkOut = $validated['check_out'] ?? $attendance->check_out;

        if ($checkIn && $checkOut && strtotime($checkIn) > strtotime($checkOut)) {
            return response()->json([
                'message' => 'Check-in time must be before check-out time.'
            ], 400);
        }
        $hoursWorked = 0;
        if ($checkIn && $checkOut) {
            $hoursWorked = round((strtotime($checkOut) - strtotime($checkIn)) / 3600, 2);
        }

        $attendance->update([
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'hours_worked' => $hoursWorked,
        ]);

          return response()->json([
            'message' => 'Attendance updated successfully.',
            'attendance' => $attendance->load('employee.user'),
        ], 200);

    }
        
}