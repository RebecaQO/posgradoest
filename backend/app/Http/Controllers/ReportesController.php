<?php

namespace App\Http\Controllers;

use App\Models\DefensaTesis;
use App\Models\Docente;
use App\Models\EdicionPrograma;
use App\Models\ProgramaPostgrado;

class ReportesController extends Controller
{
    public function metricas()
    {
        $programas = ProgramaPostgrado::query()
            ->orderBy('nombre_programa')
            ->get();

        $ediciones = EdicionPrograma::query()
            ->with([
                'programa',
                'malla.modulos.materias.materia',
                'malla.materiasDiplomado.materia',
                'docentes',
            ])
            ->withCount('defensas')
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id_edicion')
            ->get();

        $docentes = Docente::query()
            ->orderBy('apellido_doc')
            ->orderBy('nombre_doc')
            ->get();

        $defensas = DefensaTesis::query()
            ->with('edicion.programa')
            ->orderByDesc('fecha_defensa')
            ->orderByDesc('hora_defensa')
            ->get();

        return response()->json([
            'success' => true,
            'data' => compact('programas', 'ediciones', 'docentes', 'defensas'),
        ]);
    }
}
