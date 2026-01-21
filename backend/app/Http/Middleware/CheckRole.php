<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Check if user has the required role
        if (!$request->user()->hasRole($role)) {
            return response()->json([
                'message' => 'Unauthorized. Insufficient permissions.'
            ], 403);
        }

        return $next($request);
    }
}
