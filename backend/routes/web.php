<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\API\CitizenRequestController;
use App\Http\Middleware\EnsureTokenIsValid;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CitizenController;
use App\Http\Controllers\API\EmployeeController;
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
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Frontend URL (override in .env with FRONTEND_URL if needed)
$frontend = env('FRONTEND_URL', 'http://127.0.0.1:3000');

Route::get('/payment-success/{id}', function ($id) use ($frontend) {
    return redirect($frontend . '/citizen/payments?payment=success&id=' . $id);
});


// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/api/citizens/my-requests', [CitizenRequestController::class, 'myRequests']);
// });

Route::get('/payment-cancel/{id}', function ($id) use ($frontend) {
    $payment = Payment::findOrFail($id);
    if ($payment->status !== 'failed') {
        $payment->update(['status' => 'failed']);
    }
    return redirect($frontend . '/citizen/payments?payment=failed&id=' . $id);
});
Route::post('/cs/test-csrf', function () {
    return response()->json(['ok' => true]);
});




Route::middleware([EnsureTokenIsValid::class])->group(function () {
    //auth logout
    Route::post('/cs/auth/logout', [AuthController::class, 'logout']);
    // Citizen routes
     Route::prefix('/cs/citizens')->group(function () {
         // Update authenticated user's profile
         Route::put('/me/update', [CitizenController::class, 'updateProfile']);

          Route::middleware(['role:admin|finance_officer'])->group(function () {
             // Update citizen info  (admin)
             Route::put('/{citizen}', [CitizenController::class, 'updateByAdmin']);
            });
         });
      // Employee routes
     Route::prefix('/cs/employees')->group(function () {

         // Update authenticated employee's profile
        Route::put('/me/update', [EmployeeController::class, 'updateProfile']);

         // Update task status for assigned tasks
        Route::put('/tasks/{task}/status', [EmployeeController::class, 'updateTaskStatus']);
         // Admin-only employee routes
        Route::middleware(['role:admin|hr_manager|urban_planner'])->group(function () {
            // Update employee info (admin)
            Route::put('/{employee}', [EmployeeController::class, 'updateByAdmin']);
        });
     });
     // Admin-only routes
    Route::middleware(['role:admin|hr_manager'])->group(function () {
        Route::post('/cs/admin/register', [AuthController::class, 'adminRegister']);
    });  
});
// Citizen request routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
      //authenticated citizen send a request
      Route::post('/cs/citizen/requests', [citizenRequestController::class, 'store']);
      // Update request status by employee
      Route::put('/cs/requests/{id}/status', [citizenRequestController::class, 'updateStatus']);
    
      // Delete a request (admin/clerk only)
      Route::delete('/cs/requests/{id}', [citizenRequestController::class, 'destroy']);
      Route::prefix('/cs/permits')->group(function () {
            // Create a new permit
             Route::post('/', [PermitController::class, 'store']);
            // Admin and Clerk routes
            Route::middleware(['role:admin|clerk'])->group(function () {
                // Update permit status
                Route::put('/{permit}/status', [PermitController::class, 'updateStatus']);
            
                // Delete a permit (admin only - enforced by policy)
                Route::delete('/{permit}', [PermitController::class, 'destroy']);
            });
      });
});

// Project routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // Project listing and creation (admin and urban_planner only)
    Route::middleware(['role:admin|urban_planner'])->group(function () {
        // Create a new project (admin and urban_planner)
        Route::post('/cs/projects', [ProjectController::class, 'store']);
        // Assign a task to an employee for a specific project (admin and urban_planner)
        Route::post('/cs/projects/{project}/tasks', [ProjectController::class, 'assignTask']);
        // Update the status of a project (admin and urban_planner)
        Route::put('/cs/projects/{project}/status', [ProjectController::class, 'updateStatus']);
    });
});

// Attendace routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // check-in
    Route::post('/cs/attendance/check-in', [AttendanceController::class, 'checkIn']);
    // check-out
    Route::post('/cs/attendance/check-out', [AttendanceController::class, 'checkOut']);
    // update attendance record
    Route::put('/cs/attendance/{attendance}', [AttendanceController::class, 'update']);
});
 //Evenets Routes
Route::middleware([EnsureTokenIsValid::class])->group(function () {
   // Event routes
    Route::prefix('/cs/events')->group(function () {
        // Admin-only routes
        Route::middleware(['role:admin'])->group(function () {
            Route::post('/', [EventController::class, 'store']);
            Route::put('/{event}', [EventController::class, 'update']);
            Route::delete('/{event}', [EventController::class, 'destroy']);
        });
    });
});
//notification routes
Route::middleware(EnsureTokenIsValid::class)->group(function () {
    Route::prefix('/cs/notifications')->group(function () {
    // Mark one notification as read
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);

    // Mark all notifications as read
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);

    // Delete one notification
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
});

// Leave routes
Route::middleware(EnsureTokenIsValid::class)->group(function () {
    Route::post('/cs/leaves', [LeaveController::class, 'store']);
    // Approve or reject leave
    Route::put('cs/leaves/{leave}/status', [LeaveController::class, 'updateStatus']);
});


// Payroll
Route::middleware([EnsureTokenIsValid::class])->group(function () {

    // Generate payroll for month
    Route::post('/cs/payrolls/generate', [PayrollController::class, 'generate']);
    // Add bonus or deduction
    Route::post('cs/payrolls/{payroll}/adjustments', [PayrollController::class, 'addAdjustment']);
});
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleStripeWebhook']);

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    // Create payment
    Route::post('/cs/payments', [PaymentController::class, 'store']);
    // Bulk payment creation
    Route::post('/cs/payments/bulk', [BulkPaymentController::class, 'store']);
    // Update payment
    Route::put('/cs/payments/{payment}', [PaymentController::class, 'updateStatus']);
    // delete payment
    Route::delete('/cs/payments/{payment}', [PaymentController::class, 'destroy']);
    // we still need payment process integration here
    Route::post('/cs/payments/{payment}/pay', [PaymentController::class, 'beginStripePayment']); 
});
require __DIR__.'/settings.php';
