<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDefensaTesisRequest;
use App\Http\Resources\DefensaTesisResource;
use App\Models\DefensaTesis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class DefensaTesisController extends Controller
{
    public function publicas(): JsonResponse
    {
        $defensas = DefensaTesis::query()
            ->with(['edicion.programa'])
            ->where('publicado', true)
            ->orderByDesc('fecha_defensa')
            ->orderByDesc('hora_defensa')
            ->get()
            ->map(fn (DefensaTesis $defensa): array => [
                'id' => $defensa->id_defensa,
                'titulo_tesis' => $defensa->titulo_tesis,
                'nombre_defensa' => $defensa->nombre_defensa,
                'imagen_url' => $defensa->imagen_url ?? $defensa->edicion?->banner,
                'autor' => $defensa->autor,
                'tutor' => $defensa->tutor,
                'fecha_defensa' => $defensa->fecha_defensa?->format('Y-m-d'),
                'hora_defensa' => $defensa->hora_defensa,
                'lugar' => $defensa->lugar ?? $defensa->lugar_defensa,
                'modalidad' => $defensa->modalidad ?? $defensa->edicion?->modalidad_titulacion,
                'imagen' => $defensa->edicion?->banner,
                'edicion' => [
                    'nombre_edicion' => $defensa->edicion?->nombre_edicion,
                    'programa' => $defensa->edicion?->programa?->nombre_programa,
                ],
            ]);

        return response()->json(['success' => true, 'data' => $defensas]);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = DefensaTesis::with(['edicion.programa'])->orderBy('id_defensa', 'desc');

        if ($request->filled('id_edicion')) {
            $query->where('id_edicion', $request->id_edicion);
        }

        if ($request->filled('resultado')) {
            $query->where('resultado', $request->resultado);
        }

        $defensas = $query->paginate(20);

        return DefensaTesisResource::collection($defensas);
    }

    private function mapEstado(?string $resultado): string
    {
        $res = strtolower($resultado ?? '');
        if (in_array($res, ['aprobado', 'aprobada', 'concluida'])) {
            return 'Aprobada';
        }
        if (in_array($res, ['reprobado', 'reprobada', 'rechazado', 'rechazada'])) {
            return 'Rechazada';
        }

        return 'Pendiente';
    }

    public function store(StoreDefensaTesisRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $datos['publicado'] = $datos['publicado'] ?? true;
        if (isset($datos['lugar'])) {
            $datos['lugar_defensa'] = $datos['lugar'];
        }
        $datos['estado'] = $this->mapEstado($datos['resultado'] ?? 'pendiente');

        $defensa = DefensaTesis::create($datos);
        $defensa->load('edicion.programa');

        return (new DefensaTesisResource($defensa))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): DefensaTesisResource|JsonResponse
    {
        $defensa = DefensaTesis::with(['edicion.programa'])->find($id);
        if (! $defensa) {
            return response()->json(['message' => 'Defensa no encontrada'], 404);
        }

        return new DefensaTesisResource($defensa);
    }

    public function update(StoreDefensaTesisRequest $request, int $id): DefensaTesisResource|JsonResponse
    {
        $defensa = DefensaTesis::find($id);
        if (! $defensa) {
            return response()->json(['message' => 'Defensa no encontrada'], 404);
        }

        $datos = $request->validated();
        if (isset($datos['lugar'])) {
            $datos['lugar_defensa'] = $datos['lugar'];
        }
        if (isset($datos['resultado'])) {
            $datos['estado'] = $this->mapEstado($datos['resultado']);
        }

        $defensa->update($datos);
        $defensa->load('edicion.programa');

        return new DefensaTesisResource($defensa);
    }

    public function destroy(int $id): Response|JsonResponse
    {
        $defensa = DefensaTesis::find($id);
        if (! $defensa) {
            return response()->json(['message' => 'Defensa no encontrada'], 404);
        }

        $defensa->delete();

        return response()->noContent();
    }
}
