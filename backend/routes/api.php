<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CitizenController;
use App\Http\Controllers\API\EmployeeController;

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