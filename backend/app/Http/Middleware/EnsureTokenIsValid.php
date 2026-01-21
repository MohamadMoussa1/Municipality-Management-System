<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;

class EnsureTokenIsValid
{
    public function handle(Request $request, Closure $next): Response
    {   
        $token = $request->cookie('auth_token');

        if (!$token) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized Access'
            ], 401);
        }

        $decodedToken = urldecode($token);
         $accessToken = $this->getValidToken($decodedToken);

        if (!$accessToken) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized. Invalid token'
            ], 401);
        }

      
        Auth::login($accessToken->tokenable);

        return $next($request);
    }

    private function getValidToken(string $token): ?PersonalAccessToken
    {
        try {
            if (str_contains($token, '|')) {
                $tokenParts = explode('|', $token, 2);
                $token = $tokenParts[1] ?? '';
            }

            $accessToken = PersonalAccessToken::findToken($token);

            if (!$accessToken) return null;

            if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
                return null;
            }

            return $accessToken;
        } catch (\Exception $e) {
            return null;
        }
    }
}