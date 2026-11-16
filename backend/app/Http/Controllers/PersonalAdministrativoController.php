<?php

namespace App\Http\Controllers;

use App\Models\PersonalAdministrativo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonalAdministrativoController extends Controller
{
    public function publico(): JsonResponse
    {
        $personal = PersonalAdministrativo::query()
            ->where('activo', true)
            ->orderByDesc('es_director')
            ->orderBy('orden')
            ->orderBy('id_personal')
            ->get();

        return response()->json(['success' => true, 'data' => $personal]);
    }

    public function administrar(): JsonResponse
    {
        $personal = PersonalAdministrativo::query()
            ->orderByDesc('es_director')
            ->orderBy('orden')
            ->orderBy('id_personal')
            ->get();

        return response()->json(['success' => true, 'data' => $personal]);
    }

    public function crear(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());
        $persona = DB::transaction(function () use ($datos): PersonalAdministrativo {
            if ($datos['es_director'] ?? false) {
                PersonalAdministrativo::query()->update(['es_director' => false]);
            }

            return PersonalAdministrativo::create($datos);
        });

        return response()->json([
            'success' => true,
            'message' => 'Personal administrativo registrado correctamente.',
            'data' => $persona,
        ], 201);
    }

    public function actualizar(Request $request, int $id): JsonResponse
    {
        $persona = PersonalAdministrativo::find($id);
        if (!$persona) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado.'], 404);
        }

        $datos = $request->validate($this->reglas(true));
        DB::transaction(function () use ($datos, $persona): void {
            if ($datos['es_director'] ?? false) {
                PersonalAdministrativo::query()
                    ->where('id_personal', '!=', $persona->id_personal)
                    ->update(['es_director' => false]);
            }

            $persona->update($datos);
        });

        return response()->json([
            'success' => true,
            'message' => 'Personal administrativo actualizado correctamente.',
            'data' => $persona->fresh(),
        ]);
    }

    public function desactivar(int $id): JsonResponse
    {
        return $this->cambiarEstado($id, false);
    }

    public function reactivar(int $id): JsonResponse
    {
        return $this->cambiarEstado($id, true);
    }

    private function cambiarEstado(int $id, bool $activo): JsonResponse
    {
        $persona = PersonalAdministrativo::find($id);
        if (!$persona) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado.'], 404);
        }

        $persona->update(['activo' => $activo, 'es_director' => $activo && $persona->es_director]);

        return response()->json([
            'success' => true,
            'message' => $activo ? 'Registro reactivado.' : 'Registro desactivado.',
            'data' => $persona->fresh(),
        ]);
    }

    private function reglas(bool $actualizar = false): array
    {
        $presencia = $actualizar ? 'sometimes' : 'required';

        return [
            'nombre' => [$presencia, 'string', 'max:150'],
            'cargo' => [$presencia, 'string', 'max:150'],
            'grado' => ['nullable', 'string', 'max:200'],
            'oficina' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:40'],
            'biografia' => ['nullable', 'string'],
            'foto_url' => ['nullable', 'url:http,https', 'max:2048'],
            'es_director' => ['sometimes', 'boolean'],
            'orden' => ['sometimes', 'integer', 'min:0', 'max:65535'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
