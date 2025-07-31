<?php

// ===================================================================
// File: app/Http/Middleware/RoleMiddleware.php
// ===================================================================

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (! Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user = Auth::user();

        // Check if user status is active
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive',
            ], 403);
        }

        // Check if user has required role
        if (! in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}
