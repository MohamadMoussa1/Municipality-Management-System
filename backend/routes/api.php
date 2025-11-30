<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\citizenRequestController;


Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
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
});


