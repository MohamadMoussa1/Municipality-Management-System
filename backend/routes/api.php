<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CitizenController;
use App\Http\Controllers\API\EmployeeController;
use App\Http\Controllers\API\citizenRequestController;
use App\Http\Controllers\Api\PermitController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\BulkPaymentController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\AttendanceController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Citizen routes
    Route::prefix('citizens')->group(function () {
        // Get current authenticated citizen's info
        Route::get('/me', [CitizenController::class, 'me']);
        
        // Update authenticated user's profile
        Route::put('/me/update', [CitizenController::class, 'updateProfile']);
        
        Route::middleware(['role:admin|hr_manager'])->group(function () {
        // Get all citizens (admin only)
            Route::get('/', [CitizenController::class, 'index']);
            
            // Get specific citizen info  (admin)
            Route::get('/{identifier}', [CitizenController::class, 'show']);
            
            // Update citizen info  (admin)
            Route::put('/{citizen}', [CitizenController::class, 'updateByAdmin']);
        });
    });
    
    // Employee routes
    Route::prefix('employees')->group(function () {
        // Get current authenticated employee's info
        Route::get('/me', [EmployeeController::class, 'me']);
        
        // Update authenticated employee's profile
        Route::put('/me/update', [EmployeeController::class, 'updateProfile']);
        
        // Get tasks assigned to the authenticated employee
        Route::get('/me/tasks', [EmployeeController::class, 'myTasks']);
        
        // Update task status for assigned tasks
        Route::put('/tasks/{task}/status', [EmployeeController::class, 'updateTaskStatus']);
        
        // Admin-only employee routes
        Route::middleware(['role:admin|hr_manager'])->group(function () {
            // Get all employees (admin only)
            Route::get('/', [EmployeeController::class, 'index']);
            
            // Get specific employee info (admin)
            Route::get('/{identifier}', [EmployeeController::class, 'show']);
            
            // Update employee info (admin)
            Route::put('/{employee}', [EmployeeController::class, 'updateByAdmin']);
        });
    });
    
    // Admin-only routes
    Route::middleware(['role:admin|hr_manager'])->group(function () {
        Route::post('/admin/register', [AuthController::class, 'adminRegister']);
    });
});

// Citizen request routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/citizen/requests', [citizenRequestController::class, 'store']);
    // Get requests for the authenticated citizen
    Route::get('/requests/my-requests', [citizenRequestController::class, 'myRequests']);
    // Get all requests that employees can view
    Route::get('/requests/department', [citizenRequestController::class, 'departmentRequests']);
    
    // Get a specific request for the authenticated citizen
    Route::get('/requests/{id}', [citizenRequestController::class, 'show']);
    // Update request status by employee
    Route::put('/requests/{id}/status', [citizenRequestController::class, 'updateStatus']);
    
    // Delete a request (admin/clerk only)
    Route::delete('/requests/{id}', [citizenRequestController::class, 'destroy']);

    // Permit routes
    Route::prefix('permits')->group(function () {
        // Citizen routes
        Route::middleware(['role:citizen'])->group(function () {
            // Create a new permit
            Route::post('/', [PermitController::class, 'store']);
            // Get authenticated citizen's permits
            Route::get('/my-permits', [PermitController::class, 'myPermits']);
            
        });

        Route::middleware(['role:admin|clerk|citizen'])->group(function () {
            
            // Get a specific permit
            Route::get('/{permit}', [PermitController::class, 'show']);
            
        });
        // Admin and Clerk routes
        Route::middleware(['role:admin|clerk'])->group(function () {
            // Get all permits with filters
            Route::get('/', [PermitController::class, 'index']);
            
            // Update permit status
            Route::put('/{permit}/status', [PermitController::class, 'updateStatus']);
            
            // Delete a permit (admin only - enforced by policy)
            Route::delete('/{permit}', [PermitController::class, 'destroy']);
        });
    });
});


// Payment routes
Route::middleware(['auth:sanctum'])->group(function () {

    // citizen payments
    Route::get('/payments/my-payments', [PaymentController::class, 'myPayments']);

    // Create payment
    Route::post('/payments', [PaymentController::class, 'store']);

    // Bulk payment creation
    Route::post('/payments/bulk', [BulkPaymentController::class, 'store']);

    // List all payments (admin / finance)
    Route::get('/payments', [PaymentController::class, 'index']);

    // Update payment
    Route::put('/payments/{payment}', [PaymentController::class, 'updateStatus']);

    // View specific payment (must be last)
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // delete payment
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

    // we still need payment process integration here
});

// Project routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Project listing and creation (admin and urban_planner only)
    Route::middleware(['role:admin|urban_planner'])->group(function () {
        // Get all projects (admin and urban_planner)
        Route::get('/projects', [ProjectController::class, 'index']);
        // Create a new project (admin and urban_planner)
        Route::post('/projects', [ProjectController::class, 'store']);
        // Get a specific project (admin and urban_planner)
        Route::get('/projects/{project}', [ProjectController::class, 'show']);
        // Assign a task to an employee for a specific project (admin and urban_planner)
        Route::post('/projects/{project}/tasks', [ProjectController::class, 'assignTask']);
        // Update the status of a project (admin and urban_planner)
        Route::put('/projects/{project}/status', [ProjectController::class, 'updateStatus']);
    });
    
    // TODO: Add more project routes as needed
    // Example (uncomment when implemented):
    // Route::get('/projects/{project}', [ProjectController::class, 'show']);
    // Route::put('/projects/{project}', [ProjectController::class, 'update']);
    // Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
});

// Attendace routes
Route::middleware(['auth:sanctum'])->group(function () {
    // check-in
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    // check-out
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    // get attendance records
    Route::get('/attendance', [AttendanceController::class, 'index']);
    // get specific attendance record
    Route::get('/attendance/{attendance}', [AttendanceController::class, 'show']);
    // update attendance record
    Route::put('/attendance/{attendance}', [AttendanceController::class, 'update']);

});

