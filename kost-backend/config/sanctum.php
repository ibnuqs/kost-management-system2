<?php

// config/sanctum.php - FIXED VERSION

use Laravel\Sanctum\Sanctum;

return [
    // ✅ FIXED: Kosongkan untuk pure token mode
    'stateful' => [],

    'guard' => ['web'],

    // ✅ FIXED: Set expiration untuk keamanan
    'expiration' => 60 * 24 * 7, // 7 hari

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
