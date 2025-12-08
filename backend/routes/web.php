<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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

Route::get('/payment-success/{id}', function ($id) {
    return "Payment $id succeeded!";
});

Route::get('/payment-cancel/{id}', function ($id) {
    return "Payment $id was cancelled.";
});

require __DIR__.'/settings.php';
