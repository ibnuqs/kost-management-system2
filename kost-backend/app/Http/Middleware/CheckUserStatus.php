<?php

// ===================================================================
// File: app/Http/Middleware/CheckUserStatus.php
// ===================================================================

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user = Auth::user();

        if ($user->status !== 'active') {
            // Revoke all tokens for inactive users
            $user->tokens()->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'Account has been deactivated. Please contact administrator.',
                'error_code' => 'ACCOUNT_INACTIVE'
            ], 403);
        }

        return $next($request);
    }
}