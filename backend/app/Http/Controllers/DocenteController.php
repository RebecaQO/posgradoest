<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\EdicionPrograma;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DocenteController extends Controller
{
    // ========================================
    // LISTAR DOCENTES
    // ========================================

    public function listarDocentes()
    {
        $docentes = Docente::orderBy('apellido_doc')
            ->orderBy('nombre_doc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $docentes,
        ], 200);
    }

    public function listarDocentesPublicos()
    {
        $docentes = Docente::query()
            ->where('activo', true)
            ->orderBy('apellido_doc')
            ->orderBy('nombre_doc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $docentes,
        ], 200);
    }

    // ========================================
    // OBTENER DOCENTE
    // ========================================

    public function obtenerDocente(int $id)
    {
        $docente = Docente::with([
            'ediciones.programa',
        ])->find($id);

        if (! $docente) {
            return response()->json([
                'success' => false,
                'message' => 'Docente no encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $docente,
        ], 200);
    }

    // ========================================
    // LISTAR DOCENTES DE UNA EDICION
    // ========================================

    public function listarDocentesPorEdicion(int $id)
    {
        $edicion = EdicionPrograma::find($id);

        if (! $edicion) {
            return response()->json([
                'success' => false,
                'message' => 'Edicion no encontrada.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $edicion->docentes()
                ->orderBy('apellido_doc')
                ->orderBy('nombre_doc')
                ->get(),
        ], 200);
    }

    // ========================================
    // CREAR DOCENTE
    // ========================================

    public function crearDocente(Request $request)
    {
        $datos = $request->validate([
            'nombre' => [
                'sometimes', 'required', 'string', 'max:100',
            ],
            'apellido' => [
                'sometimes', 'required', 'string', 'max:100',
            ],
            'nombre_doc' => [
                'required_without:nombre',
                'string',
                'max:100',
            ],
            'apellido_doc' => [
                'required_without:apellido',
                'string',
                'max:100',
            ],
            'foto' => [
                'nullable',
                'string',
            ],
            'foto_url' => ['nullable', 'url:http,https', 'max:2048'],
            'titulo_academico' => ['nullable', 'string', 'max:150'],
            'descripcion_profesional' => ['nullable', 'string', 'max:2000'],
            'bibliografia_url' => ['nullable', 'url:http,https', 'max:2048'],
            'email' => ['nullable', 'email', 'max:254'],
            'telefono' => ['nullable', 'string', 'max:100'],
            'especialidad' => ['nullable', 'string', 'max:255'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'scholar' => ['nullable', 'url:http,https', 'max:2048'],
            'researchgate' => ['nullable', 'url:http,https', 'max:2048'],
            'linkedin' => ['nullable', 'url:http,https', 'max:2048'],
            'orcid' => ['nullable', 'url:http,https', 'max:2048'],
        ]);

        $datos['nombre_doc'] = $datos['nombre_doc'] ?? $datos['nombre'];
        $datos['apellido_doc'] = $datos['apellido_doc'] ?? $datos['apellido'];
        $datos['foto'] = $datos['foto_url'] ?? ($datos['foto'] ?? null);
        // Los docentes creados desde el panel deben aparecer también en la
        // consulta pública, que filtra por activo = true.
        $datos['activo'] = true;
        unset($datos['nombre'], $datos['apellido'], $datos['foto_url']);

        $docente = Docente::create($datos);

        return response()->json([
            'success' => true,
            'message' => 'Docente creado correctamente.',
            'data' => $docente,
        ], 201);
    }

    // ========================================
    // ACTUALIZAR DOCENTE
    // ========================================

    public function actualizarDocente(Request $request, int $id)
    {
        $docente = Docente::find($id);

        if (! $docente) {
            return response()->json([
                'success' => false,
                'message' => 'Docente no encontrado.',
            ], 404);
        }

        if (! $docente->activo) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede modificar un docente inactivo.',
            ], 422);
        }

        $datos = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:100'],
            'apellido' => ['sometimes', 'required', 'string', 'max:100'],
            'nombre_doc' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'apellido_doc' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'foto' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'foto_url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'titulo_academico' => ['sometimes', 'nullable', 'string', 'max:150'],
            'descripcion_profesional' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'bibliografia_url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'email' => ['sometimes', 'nullable', 'email', 'max:254'],
            'telefono' => ['sometimes', 'nullable', 'string', 'max:100'],
            'especialidad' => ['sometimes', 'nullable', 'string', 'max:255'],
            'categoria' => ['sometimes', 'nullable', 'string', 'max:100'],
            'scholar' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'researchgate' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'linkedin' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'orcid' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
        ]);

        if (isset($datos['nombre'])) {
            $datos['nombre_doc'] = $datos['nombre'];
        }
        if (isset($datos['apellido'])) {
            $datos['apellido_doc'] = $datos['apellido'];
        }
        if (array_key_exists('foto_url', $datos)) {
            $datos['foto'] = $datos['foto_url'];
        }
        unset($datos['nombre'], $datos['apellido'], $datos['foto_url']);

        $docente->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Docente actualizado correctamente.',
            'data' => $docente->fresh(),
        ], 200);
    }

    public function subirFoto(Request $request)
    {
        $request->validate([
            'archivo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $request->file('archivo')->store('docentes/fotos', 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'url' => url(Storage::disk('public')->url($path)),
            ],
        ], 201);
    }

    // ========================================
    // ASIGNAR DOCENTE A EDICION
    // ========================================

    public function asignarDocente(Request $request, int $id)
    {
        $edicion = EdicionPrograma::find($id);

        if (! $edicion) {
            return response()->json([
                'success' => false,
                'message' => 'Edicion no encontrada.',
            ], 404);
        }

        $datos = $request->validate([

            'id_doc' => [
                'required',
                'integer',
                Rule::exists('docente', 'id_doc')
                    ->where('activo', true),
            ],

        ]);

        if (
            $edicion->docentes()
                ->wherePivot('id_doc', $datos['id_doc'])
                ->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'El docente ya esta asignado a esta edicion.',
            ], 409);
        }

        try {
            $edicion->docentes()->attach($datos['id_doc']);
        } catch (QueryException $error) {
            if ($error->getCode() === '23505') {
                return response()->json([
                    'success' => false,
                    'message' => 'El docente ya esta asignado a esta edicion.',
                ], 409);
            }

            throw $error;
        }

        return response()->json([
            'success' => true,
            'message' => 'Docente asignado correctamente.',
            'data' => $edicion->load('docentes'),
        ], 201);
    }

    // ========================================
    // QUITAR DOCENTE DE EDICION
    // ========================================

    public function quitarDocente(int $id, int $idDoc)
    {
        $edicion = EdicionPrograma::find($id);

        if (! $edicion) {
            return response()->json([
                'success' => false,
                'message' => 'Edicion no encontrada.',
            ], 404);
        }

        if (! $edicion->docentes()
            ->wherePivot('id_doc', $idDoc)
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'El docente no esta asignado a esta edicion.',
            ], 404);
        }

        $edicion->docentes()->detach($idDoc);

        return response()->json([
            'success' => true,
            'message' => 'Docente retirado de la edicion.',
        ], 200);
    }

    // ========================================
    // ELIMINAR DOCENTE
    // ========================================

    public function eliminarDocente(int $id)
    {
        $docente = Docente::find($id);

        if (! $docente) {
            return response()->json([
                'success' => false,
                'message' => 'Docente no encontrado.',
            ], 404);
        }

        if ($docente->ediciones()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un docente asignado a ediciones.',
            ], 409);
        }

        try {
            $docente->delete();
        } catch (QueryException $error) {
            if ($error->getCode() === '23503') {
                return response()->json([
                    'success' => false,
                    'message' => 'El docente tiene registros relacionados.',
                ], 409);
            }

            throw $error;
        }

        return response()->json([
            'success' => true,
            'message' => 'Docente eliminado correctamente.',
        ], 200);
    }

    // ========================================
    // DESACTIVAR DOCENTE
    // ========================================

    public function desactivarDocente(int $id)
    {
        $docente = Docente::find($id);

        if (! $docente) {
            return response()->json([
                'success' => false,
                'message' => 'Docente no encontrado.',
            ], 404);
        }

        if (! $docente->activo) {
            return response()->json([
                'success' => false,
                'message' => 'El docente ya está inactivo.',
            ], 409);
        }

        $docente->activo = false;
        $docente->save();

        return response()->json([
            'success' => true,
            'message' => 'Docente desactivado correctamente.',
            'data' => $docente,
        ], 200);
    }

    // ========================================
    // REACTIVAR DOCENTE
    // ========================================

    public function reactivarDocente(int $id)
    {
        $docente = Docente::find($id);

        if (! $docente) {
            return response()->json([
                'success' => false,
                'message' => 'Docente no encontrado.',
            ], 404);
        }

        if ($docente->activo) {
            return response()->json([
                'success' => false,
                'message' => 'El docente ya está activo.',
            ], 409);
        }

        $docente->activo = true;
        $docente->save();

        return response()->json([
            'success' => true,
            'message' => 'Docente reactivado correctamente.',
            'data' => $docente,
        ], 200);
    }
}
