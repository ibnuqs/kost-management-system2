<?php
// ===================================================================
// File: app/Http/Middleware/ValidateTokenAbilities.php
// ===================================================================

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class ValidateTokenAbilities
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$abilities)
    {
        if (EnsureFrontendRequestsAreStateful::fromFrontend($request)) {
            return $next($request);
        }

        $token = $request->user()->currentAccessToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);
        }

        // Check if token has required abilities
        foreach ($abilities as $ability) {
            if (!$token->can($ability)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token does not have required permissions'
                ], 403);
            }
        }

        return $next($request);
    }
}