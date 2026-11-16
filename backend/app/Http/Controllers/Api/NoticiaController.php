<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Noticia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NoticiaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Noticia::query()
                ->where('publicada', true)
                ->orderByDesc('fecha')
                ->orderByDesc('id_noticia')
                ->get(),
        ]);
    }

    public function administrar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Noticia::query()
                ->orderByDesc('fecha')
                ->orderByDesc('id_noticia')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->rules());
        $datos['estado'] = empty($datos['estado']) ? 'Publicado' : $datos['estado'];
        $noticia = Noticia::create($datos);

        return response()->json([
            'success' => true,
            'data' => $noticia,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $noticia = Noticia::find($id);
        if (! $noticia) {
            return response()->json(['message' => 'Noticia no encontrada.'], 404);
        }

        $datos = $request->validate($this->rules(true));
        if (array_key_exists('estado', $datos) && ! $datos['estado']) {
            $datos['estado'] = 'Publicado';
        }
        $noticia->update($datos);

        return response()->json([
            'success' => true,
            'data' => $noticia->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $noticia = Noticia::find($id);
        if (! $noticia) {
            return response()->json(['message' => 'Noticia no encontrada.'], 404);
        }

        $noticia->delete();

        return response()->json(['success' => true]);
    }

    private function rules(bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes' : 'required';

        return [
            'titulo' => [$sometimes, 'string', 'max:255'],
            'categoria' => [$sometimes, 'string', 'max:120'],
            'tipo' => [$sometimes, Rule::in(['noticia', 'publicacion', 'evento'])],
            'fecha' => [$sometimes, 'date'],
            'descripcion' => [$sometimes, 'string'],
            'enlace' => ['nullable', 'url:http,https', 'max:2048'],
            'estado' => ['nullable', 'string', 'max:100'],
            'imagen_url' => ['nullable', 'url:http,https', 'max:2048'],
            'publicada' => ['sometimes', 'boolean'],
        ];
    }
}
