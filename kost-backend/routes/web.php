<?php

// routes/web.php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Default welcome route
Route::get('/', function () {
    return response()->json([
        'message' => 'Kost Management System Backend',
        'api_url' => url('/api'),
        'health_check' => url('/api/health'),
        'documentation' => 'Available on request',
        'version' => '1.0.0',
    ]);
});

// Sanctum CSRF cookie route (for frontend authentication)
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');

// Add login route to prevent RouteNotFoundException
Route::get('/login', function () {
    return response()->json([
        'message' => 'Please use API login endpoint',
        'login_url' => url('/api/auth/login'),
        'error' => 'This is an API-only application',
    ], 401);
})->name('login');

// Receipt verification page (for QR code)
Route::get('/receipt/verify/{receiptNumber}', [App\Http\Controllers\Api\ReceiptVerificationController::class, 'showVerification']);
