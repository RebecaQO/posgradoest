<?php

namespace Tests\Unit;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UsuarioPasswordPolicyTest extends TestCase
{
    public function test_new_password_requires_length_and_character_classes(): void
    {
        $rules = (new StoreUsuarioRequest())->rules()['password'];

        $this->assertTrue(Validator::make(['password' => 'Universidad2026!'], ['password' => $rules])->passes());
        $this->assertFalse(Validator::make(['password' => 'password'], ['password' => $rules])->passes());
        $this->assertFalse(Validator::make(['password' => 'Universidad2026'], ['password' => $rules])->passes());
    }

    public function test_password_changes_use_the_same_policy(): void
    {
        $rules = (new UpdateUsuarioRequest())->rules()['password'];

        $this->assertTrue(Validator::make(['password' => null], ['password' => $rules])->passes());
        $this->assertTrue(Validator::make(['password' => 'NuevaClaveFuerte2026!'], ['password' => $rules])->passes());
        $this->assertFalse(Validator::make(['password' => 'clave123'], ['password' => $rules])->passes());
    }
}
