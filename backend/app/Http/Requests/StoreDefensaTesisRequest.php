<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDefensaTesisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_edicion' => ['required', 'exists:edicion_programa,id_edicion'],
            'titulo_tesis' => ['required', 'string', 'max:255'],
            'nombre_defensa' => ['required', 'string', 'max:180'],
            'imagen_url' => ['nullable', 'url:http,https', 'max:2048'],
            'autor' => ['required', 'string', 'max:150'],
            'tutor' => ['nullable', 'string', 'max:150'],
            'modalidad' => ['nullable', 'string', 'max:120'],
            'fecha_defensa' => ['required', 'date'],
            'hora_defensa' => ['nullable'],
            'lugar' => ['nullable', 'string', 'max:150'],
            'resultado' => ['required', 'in:pendiente,aprobado,reprobado'],
            'observaciones' => ['nullable', 'string'],
            'publicado' => ['sometimes', 'boolean'],
        ];
    }
}
