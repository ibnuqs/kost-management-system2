<?php

// ===================================================================
// File: routes/auth.php - Auth Routes
// ===================================================================

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public authentication routes with rate limiting
Route::prefix('auth')->group(function () {

    // Registration & Login with strict rate limiting
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1') // 5 attempts per minute
        ->name('auth.register');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1') // 5 attempts per minute
        ->name('auth.login');

    // Password Reset with even stricter limits
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:3,1') // 3 attempts per minute
        ->name('auth.forgot-password');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:3,1') // 3 attempts per minute
        ->name('auth.reset-password');

    // Protected routes (require authentication)
    Route::middleware(['auth:sanctum', 'check.user.status'])->group(function () {

        // Profile Management
        Route::get('/profile', [AuthController::class, 'profile'])
            ->name('auth.profile');

        Route::put('/profile', [AuthController::class, 'updateProfile'])
            ->name('auth.update-profile');

        // Email Verification
        Route::post('/verify-email', [AuthController::class, 'verifyEmail'])
            ->name('auth.verify-email');

        // Session Management
        Route::get('/sessions', [AuthController::class, 'activeSessions'])
            ->name('auth.active-sessions');

        Route::delete('/sessions/{tokenId}', [AuthController::class, 'revokeSession'])
            ->name('auth.revoke-session');

        // Token Management
        Route::post('/refresh-token', [AuthController::class, 'refreshToken'])
            ->name('auth.refresh-token');

        // Logout
        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        Route::post('/logout-all', [AuthController::class, 'logoutAll'])
            ->name('auth.logout-all');
    });
});
