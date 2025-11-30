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
});

// Get requests for the authenticated citizen
Route::middleware('auth:sanctum')->get('/requests/my-requests', [CitizenRequestController::class, 'myRequests']);

// Get a specific request for the authenticated citizen
Route::middleware('auth:sanctum')->get('/requests/{id}',
    [CitizenRequestController::class, 'show']
);

// Get all requests that employees can view
Route::middleware('auth:sanctum')->get('/requests/department',
    [CitizenRequestController::class, 'departmentRequests']
);

// Update request status by employee
Route::middleware('auth:sanctum')->put('/requests/{id}/status',
    [CitizenRequestController::class, 'updateStatus']
);

