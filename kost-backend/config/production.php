<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Production Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration specific to production environment
    |
    */

    'optimize' => [
        'config_cache' => true,
        'route_cache' => true,
        'view_cache' => true,
        'event_cache' => true,
    ],

    'security' => [
        'force_https' => env('FORCE_HTTPS', true),
        'secure_cookies' => env('SECURE_COOKIES', true),
        'trusted_proxies' => env('TRUSTED_PROXIES', '*'),
    ],

    'performance' => [
        'opcache_enabled' => true,
        'session_driver' => 'redis',
        'cache_driver' => 'redis',
        'queue_driver' => 'redis',
    ],

    'monitoring' => [
        'error_reporting' => false,
        'log_level' => 'error',
        'debug_mode' => false,
    ],

    'rate_limiting' => [
        'api_rate' => env('THROTTLE_API_RATE', 60),
        'login_rate' => env('THROTTLE_LOGIN_RATE', 5),
    ],
];