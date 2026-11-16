<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): array {
            $identifier = mb_strtolower(trim((string) ($request->input('nombre') ?: $request->input('email', ''))));
            $identifierKey = hash('sha256', $identifier);

            $tooManyAttempts = static function (Request $request, array $headers) {
                $retryAfter = max(1, (int) ($headers['Retry-After'] ?? 60));

                return response()->json([
                    'success' => false,
                    'message' => "Demasiados intentos. Espera {$retryAfter} segundos antes de volver a intentarlo.",
                    'retry_after' => $retryAfter,
                ], 429, $headers);
            };

            return [
                Limit::perMinute(30)
                    ->by('login-ip:'.$request->ip())
                    ->response($tooManyAttempts),
                Limit::perMinute(5)
                    ->by('login-account:'.$identifierKey)
                    ->after(static fn (Response $response): bool => $response->getStatusCode() === 401)
                    ->response($tooManyAttempts),
            ];
        });
    }
}
