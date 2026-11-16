<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('docente', function (Blueprint $table): void {
            $table->string('titulo_academico', 150)->nullable();
        });

        Schema::create('docente_materia', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_mat');
            $table->unsignedBigInteger('id_doc');
            $table->primary(['id_mat', 'id_doc']);
            $table->foreign('id_mat')->references('id_mat')->on('materia')->cascadeOnDelete();
            $table->foreign('id_doc')->references('id_doc')->on('docente')->cascadeOnDelete();
        });

        $programa = DB::table('programa_postgrado')
            ->where('nombre_programa', 'Maestría en Ciencia y Análisis de Datos')
            ->first();

        if (! $programa) {
            return;
        }

        $normalize = static function (string $nombre): string {
            $nombre = preg_replace('/^(m\.?\s?sc\.?|dr\.?|dra\.?|ph\.?d\.?)\s*/i', '', trim($nombre));
            $nombre = strtr(mb_strtolower($nombre), [
                'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
            ]);

            return trim(preg_replace('/\s+/', ' ', $nombre));
        };

        $materias = DB::table('materia as mat')
            ->join('materia_maestria as mm', 'mm.id_mat', '=', 'mat.id_mat')
            ->join('compone as c', 'c.id_mat', '=', 'mm.id_mat')
            ->join('modulo as mod', 'mod.id_mod', '=', 'c.id_mod')
            ->join('malla_curricular as m', 'm.id_malla', '=', 'mod.id_malla')
            ->where('m.id_programa', $programa->id_programa)
            ->where('mat.descripcion', 'like', 'Docente:%')
            ->select('mat.id_mat', 'mat.descripcion')
            ->get();

        $docentesExistentes = DB::table('docente')->get(['id_doc', 'nombre_doc', 'apellido_doc', 'titulo_academico']);

        foreach ($materias as $materia) {
            $referencia = trim(preg_replace('/^Docente:\s*/i', '', $materia->descripcion));
            if ($referencia === '') {
                continue;
            }

            preg_match('/^(M\.?\s?Sc\.?|Dr\.?|Dra\.?|Ph\.?D\.?)\s+(.+)$/i', $referencia, $coincidencia);
            $titulo = $coincidencia[1] ?? null;
            $nombreCompleto = trim($coincidencia[2] ?? $referencia);
            $partes = preg_split('/\s+/', $nombreCompleto);
            $apellido = count($partes) > 1 ? array_pop($partes) : '';
            $nombre = implode(' ', $partes);
            if ($nombre === '' || $apellido === '') {
                continue;
            }

            $docente = $docentesExistentes->first(fn (object $actual): bool =>
                $normalize(trim("{$actual->nombre_doc} {$actual->apellido_doc}")) === $normalize($nombreCompleto)
            );

            if (! $docente) {
                $idDocente = DB::table('docente')->insertGetId([
                    'nombre_doc' => $nombre,
                    'apellido_doc' => $apellido,
                    'foto' => null,
                    'titulo_academico' => $titulo,
                ], 'id_doc');
                $docente = (object) [
                    'id_doc' => $idDocente,
                    'nombre_doc' => $nombre,
                    'apellido_doc' => $apellido,
                    'titulo_academico' => $titulo,
                ];
                $docentesExistentes->push($docente);
            } elseif ($titulo && ! $docente->titulo_academico) {
                DB::table('docente')->where('id_doc', $docente->id_doc)->update(['titulo_academico' => $titulo]);
            }

            DB::table('docente_materia')->insertOrIgnore([
                'id_mat' => $materia->id_mat,
                'id_doc' => $docente->id_doc,
            ]);

            DB::table('materia')->where('id_mat', $materia->id_mat)->update(['descripcion' => null]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('docente_materia')) {
            $asignaciones = DB::table('docente_materia')
                ->join('materia', 'materia.id_mat', '=', 'docente_materia.id_mat')
                ->join('docente', 'docente.id_doc', '=', 'docente_materia.id_doc')
                ->get(['materia.id_mat', 'docente.nombre_doc', 'docente.apellido_doc', 'docente.titulo_academico']);

            foreach ($asignaciones as $asignacion) {
                $nombre = trim(implode(' ', array_filter([
                    $asignacion->titulo_academico,
                    $asignacion->nombre_doc,
                    $asignacion->apellido_doc,
                ])));
                DB::table('materia')->where('id_mat', $asignacion->id_mat)->update(['descripcion' => "Docente: {$nombre}"]);
            }
        }

        Schema::dropIfExists('docente_materia');
        Schema::table('docente', function (Blueprint $table): void {
            $table->dropColumn('titulo_academico');
        });
    }
};
