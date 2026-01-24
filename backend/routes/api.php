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
use App\Http\Controllers\API\AdminDashboardController;
use App\Http\Controllers\API\HRDashboardController;
use App\Http\Middleware\EnsureTokenIsValid;
use App\Http\Controllers\API\CitizenDashboardController;

// Protected routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // Citizen routes
    Route::prefix('citizens')->group(function () {
        // Get current authenticated citizen's info
        Route::get('/me', [CitizenController::class, 'me']);       
        Route::get('/dashboard', [CitizenDashboardController::class, 'dashboard']);
        Route::middleware(['role:admin|finance_officer'])->group(function () {
        // Get all citizens (admin only)
            Route::get('/', [CitizenController::class, 'index']);
            
            // Get specific citizen info  (admin)
            Route::get('/{identifier}', [CitizenController::class, 'show']);
            
           
           
        });
    });
    
    // Employee routes
    Route::prefix('employees')->group(function () {
        // Get current authenticated employee's info
        Route::get('/me', [EmployeeController::class, 'me']);       
        // Get tasks assigned to the authenticated employee
        Route::get('/me/tasks', [EmployeeController::class, 'myTasks']);    
        // Get count of todo tasks for the authenticated employee
        Route::get('/me/tasks/todo-count', [EmployeeController::class, 'countTodoTasks']);        
        // Get latest 3 todo tasks for the authenticated employee
        Route::get('/me/tasks/latest-todo', [EmployeeController::class, 'getLatestTodoTasks']);       
        Route::middleware(['role:admin|hr_manager|urban_planner'])->group(function () {
            // Get all employees (admin only)
            Route::get('/', [EmployeeController::class, 'index']);          
            // Get specific employee info (admin)
            Route::get('/{identifier}', [EmployeeController::class, 'show']);
        });     
    });
    
    
    //dashboardsData routes
    Route::middleware(['role:admin|hr_manager'])->group(function () {
        Route::get('/hr/dashboard/stats', [HRDashboardController::class, 'dashboardStats']);
        Route::get('/hr/dashboard/pending-leave-requests', [HRDashboardController::class, 'pendingLeaveRequests']);
        Route::get('/upcoming-count', [EventController::class, 'getUpcomingEventsCount']);
        Route::get('/hr/dashboard/total-tasks', [HRDashboardController::class, 'countTodoTasks']);
        Route::get('/humanResource/stat', [HRDashboardController::class, 'humanResStat']);
    });
    //admin dashboard stat route
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/dashboard/permits-requests/monthly-counts', [AdminDashboardController::class, 'monthlyPermitsAndRequestsCounts']);
        Route::get('/admin/dashboard/totals', [AdminDashboardController::class, 'totals']);
    });
});

// Citizen request routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
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
    // Permit routes
    Route::prefix('permits')->group(function () {
        // Citizen routes
        Route::middleware(['role:citizen'])->group(function () {        
            // Get authenticated citizen's permits
            Route::get('/my-permits', [PermitController::class, 'myPermits']);                        
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
        });
    });
});


// Payment routes

// Stripe webhook endpoint
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleStripeWebhook']);

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // citizen payments
    Route::get('/payments/my-payments', [PaymentController::class, 'myPayments']);
    // List all payments (admin / finance)
    Route::get('/payments', [PaymentController::class, 'index']);  
    // Get sum of pending payments (admin/clerk only)
    Route::get('/payments/pending-total', [PaymentController::class, 'getPendingPaymentsSum']);
    // Get payment summary (admin / finance)
    Route::get('/payments/summary', [PaymentController::class, 'getPaymentSummary']);
    // View specific payment (must be last)
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
});

// Project routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // Project listing and creation (admin and urban_planner only)
    Route::middleware(['role:admin|urban_planner'])->group(function () {
        // Get all projects (admin and urban_planner)
        Route::get('/projects', [ProjectController::class, 'index']);
        // Project stats (admin and urban_planner)
        Route::get('/projects/stats', [ProjectController::class, 'getProjectStats']);
        // Get a specific project (admin and urban_planner)
        Route::get('/projects/{project}', [ProjectController::class, 'show']); 
    });  
});

// Attendace routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // get attendance records
    Route::get('/attendance', [AttendanceController::class, 'index']);
    // get specific attendance record
    Route::get('/attendance/{attendance}', [AttendanceController::class, 'show']);
});

//Evenets Routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
   // Event routes
    Route::prefix('events')->group(function () {
        //get number all upcoming events
        Route::get('/upcoming-count', [EventController::class, 'getUpcomingEventsCount']);
        // Public routes (for all authenticated users)
        Route::get('/', [EventController::class, 'index']);
        Route::get('/{event}', [EventController::class, 'show']);
    });
});
//notification routes
Route::middleware(EnsureTokenIsValid::class)->group(function () {
    Route::prefix('notifications')->group(function () {
    // Get all notifications
    Route::get('/', [NotificationController::class, 'index']);
    // Get unread notifications
    Route::get('/unread', [NotificationController::class, 'unread']);
    });
});

Route::get('/test-email', function () {
    \Mail::raw('Testing Gmail SMTP in Laravel', function ($message) {
        $message->to('moussamohamad389@gmail.com')->subject('SMTP Test');
    });

    return 'Email sent!';
});

// Leave routes
Route::middleware(EnsureTokenIsValid::class)->group(function () {
     // Employee views own leave requests
    Route::get('/leaves/my', [LeaveController::class, 'myLeaves']);
    // HR/Admin views all leave requests [filter]
    Route::get('/leaves', [LeaveController::class, 'index']);  
});


// Payroll
Route::middleware([EnsureTokenIsValid::class])->group(function () {  
    // List payroll records
    Route::get('/payrolls', [PayrollController::class, 'index']);
    // View payroll for employee
    Route::get('/payrolls/{payroll}', [PayrollController::class, 'show']);
});
