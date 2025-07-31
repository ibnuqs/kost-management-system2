<?php

// File: app/Http/Middleware/CheckRole.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($request->user()->role !== $role) {
            return response()->json([
                'message' => "Access denied. {$role} role required.",
                'user_role' => $request->user()->role,
                'required_role' => $role,
            ], 403);
        }

        return $next($request);
    }
}
