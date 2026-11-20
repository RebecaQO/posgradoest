<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('usuarios');

        Schema::create('usuarios', function (Blueprint $table): void {
            $table->id('id_usuario');
            $table->string('nombre')->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password');
            $table->string('rol');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table): void {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function test_valid_credentials_return_a_bearer_token(): void
    {
        $usuario = $this->crearUsuario();

        $response = $this->postJson('/api/auth/login', [
            'nombre' => $usuario->nombre,
            'password' => 'ClaveSegura2026!',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.id', $usuario->id_usuario)
            ->assertJsonPath('user.role', 'admin');

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $this->crearUsuario();

        $this->postJson('/api/auth/login', [
            'nombre' => 'admin',
            'password' => 'incorrecta',
        ])->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_inactive_users_cannot_authenticate(): void
    {
        $usuario = $this->crearUsuario(activo: false);

        $this->postJson('/api/auth/login', [
            'nombre' => $usuario->nombre,
            'password' => 'ClaveSegura2026!',
        ])->assertUnauthorized();
    }

    public function test_token_can_be_revoked_by_logout(): void
    {
        $usuario = $this->crearUsuario();
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    private function crearUsuario(bool $activo = true): Usuario
    {
        return Usuario::create([
            'nombre' => 'admin',
            'email' => 'admin@example.test',
            'password' => 'ClaveSegura2026!',
            'rol' => 'admin',
            'activo' => $activo,
        ]);
    }
}
