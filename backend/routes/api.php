<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CitizenController;
use App\Http\Controllers\API\EmployeeController;
use App\Http\Controllers\API\citizenRequestController;

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
        
        Route::middleware(['role:admin'])->group(function () {
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
        
        // Admin-only employee routes
        Route::middleware(['role:admin'])->group(function () {
            // Get all employees (admin only)
            Route::get('/', [EmployeeController::class, 'index']);
            
            // Get specific employee info (admin)
            Route::get('/{identifier}', [EmployeeController::class, 'show']);
            
            // Update employee info (admin)
            Route::put('/{employee}', [EmployeeController::class, 'updateByAdmin']);
        });
    });
    
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


