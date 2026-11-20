<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:usuarios,email'],
            'password' => ['required', 'string', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
            'rol' => ['required', 'in:admin,usuario'],
            'activo' => ['boolean'],
        ];
    }
}
