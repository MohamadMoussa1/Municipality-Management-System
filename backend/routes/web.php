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

// Frontend URL (override in .env with FRONTEND_URL if needed)
$frontend = env('FRONTEND_URL', 'http://127.0.0.1:5173');

Route::get('/payment-success/{id}', function ($id) use ($frontend) {
    return redirect($frontend . '/citizen/payments?payment=success&id=' . $id);
});

Route::get('/payment-cancel/{id}', function ($id) use ($frontend) {
    $payment = Payment::findOrFail($id);

    if ($payment->status !== 'failed') {
        $payment->update([
            'status' => 'failed',
        ]);
    }
    return redirect($frontend . '/citizen/payments?payment=cancel&id=' . $id);

});


require __DIR__.'/settings.php';
