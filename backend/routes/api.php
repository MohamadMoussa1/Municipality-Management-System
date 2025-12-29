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
use App\Http\Controllers\API\EventController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\StripeWebhookController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\API\PayrollController;

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
        
        Route::middleware(['role:admin|finance_officer'])->group(function () {
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
        
        // Get count of todo tasks for the authenticated employee
        Route::get('/me/tasks/todo-count', [EmployeeController::class, 'countTodoTasks']);
        
        // Get latest 3 todo tasks for the authenticated employee
        Route::get('/me/tasks/latest-todo', [EmployeeController::class, 'getLatestTodoTasks']);
        
        // Update task status for assigned tasks
        Route::put('/tasks/{task}/status', [EmployeeController::class, 'updateTaskStatus']);
        
        // Admin-only employee routes
        Route::middleware(['role:admin|hr_manager|urban_planner'])->group(function () {
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

    // Get count of active and pending requests
    Route::get('/requests/counts', [citizenRequestController::class, 'getCompletedandPendingRequests']);
    
    // Get latest 3 requests
    Route::get('/requests/latest', [citizenRequestController::class, 'getLatestRequests']);
    
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
            
            // Get counts of approved and pending permits
            
            
        });
        

        Route::middleware(['role:admin|clerk|citizen'])->group(function () {
            Route::get('/permit-counts', [PermitController::class, 'getApprovedAndPendingCounts']);
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

// Stripe webhook endpoint
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleStripeWebhook']);

Route::middleware(['auth:sanctum'])->group(function () {

    // citizen payments
    Route::get('/payments/my-payments', [PaymentController::class, 'myPayments']);

    // Create payment
    Route::post('/payments', [PaymentController::class, 'store']);

    // Bulk payment creation
    Route::post('/payments/bulk', [BulkPaymentController::class, 'store']);

    // List all payments (admin / finance)
    Route::get('/payments', [PaymentController::class, 'index']);
    
    // Get sum of pending payments (admin/clerk only)
    Route::get('/payments/pending-total', [PaymentController::class, 'getPendingPaymentsSum']);

        // Get payment summary (admin / finance)
    Route::get('/payments/summary', [PaymentController::class, 'getPaymentSummary']);
  
    // Update payment
    Route::put('/payments/{payment}', [PaymentController::class, 'updateStatus']);

    // View specific payment (must be last)
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // delete payment
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

    // we still need payment process integration here
    Route::post('/payments/{payment}/pay', [PaymentController::class, 'beginStripePayment']);
    
  
});

// Project routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Project listing and creation (admin and urban_planner only)
    Route::middleware(['role:admin|urban_planner'])->group(function () {
        // Get all projects (admin and urban_planner)
        Route::get('/projects', [ProjectController::class, 'index']);
        // Project stats (admin and urban_planner)
        Route::get('/projects/stats', [ProjectController::class, 'getProjectStats']);
        // Create a new project (admin and urban_planner)
        Route::post('/projects', [ProjectController::class, 'store']);
        // Get a specific project (admin and urban_planner)
        Route::get('/projects/{project}', [ProjectController::class, 'show']);
        // Assign a task to an employee for a specific project (admin and urban_planner)
        Route::post('/projects/{project}/tasks', [ProjectController::class, 'assignTask']);
        // Update the status of a project (admin and urban_planner)
        Route::put('/projects/{project}/status', [ProjectController::class, 'updateStatus']);
    });
    
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

Route::middleware(['auth:sanctum'])->group(function () {
   // Event routes
    Route::prefix('events')->group(function () {
        // Admin-only routes
        Route::middleware(['role:admin'])->group(function () {
            Route::post('/', [EventController::class, 'store']);
            Route::put('/{event}', [EventController::class, 'update']);
            Route::delete('/{event}', [EventController::class, 'destroy']);
        });
        //get number all upcoming events
        Route::get('/upcoming-count', [EventController::class, 'getUpcomingEventsCount']);
        // Public routes (for all authenticated users)
        Route::get('/', [EventController::class, 'index']);
        Route::get('/{event}', [EventController::class, 'show']);
    });
});
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('notifications')->group(function () {
    // Get all notifications
    Route::get('/', [NotificationController::class, 'index']);

    // Get unread notifications
    Route::get('/unread', [NotificationController::class, 'unread']);

    // Mark one notification as read
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);

    // Mark all notifications as read
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);

    // Delete one notification
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
});

Route::get('/test-email', function () {
    \Mail::raw('Testing Gmail SMTP in Laravel', function ($message) {
        $message->to('moussamohamad389@gmail.com')->subject('SMTP Test');
    });

    return 'Email sent!';
});

// Leave routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/leaves', [LeaveController::class, 'store']);
     // Employee views own leave requests
    Route::get('/leaves/my', [LeaveController::class, 'myLeaves']);

    // HR/Admin views all leave requests [filter]
    Route::get('/leaves', [LeaveController::class, 'index']);

    // Approve or reject leave
    Route::put('/leaves/{leave}/status', [LeaveController::class, 'updateStatus']);
});


// Payroll
Route::middleware(['auth:sanctum'])->group(function () {

    // Generate payroll for month
    Route::post('/payrolls/generate', [PayrollController::class, 'generate']);

    // List payroll records
    Route::get('/payrolls', [PayrollController::class, 'index']);

    // View payroll for employee
    Route::get('/payrolls/{payroll}', [PayrollController::class, 'show']);

    // Add bonus or deduction
    Route::post('/payrolls/{payroll}/adjustments', [PayrollController::class, 'addAdjustment']);
});