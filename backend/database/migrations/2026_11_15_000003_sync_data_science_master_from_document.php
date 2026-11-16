<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programa_postgrado', function (Blueprint $table): void {
            $table->json('informacion_documentada')->nullable();
        });

        Schema::table('edicion_programa', function (Blueprint $table): void {
            $table->date('fecha_inicio')->nullable()->change();
            $table->date('fecha_fin')->nullable()->change();
            $table->string('duracion', 100)->nullable()->change();
            $table->string('horario', 150)->nullable()->change();
            $table->text('descripcion')->nullable()->change();
            $table->text('modalidad_titulacion')->nullable()->change();
            $table->text('requisitos')->nullable()->change();
            $table->text('convocatoria')->nullable()->change();
            $table->text('formulario')->nullable()->change();
        });

        $programa = DB::table('programa_postgrado')
            ->where('activo', true)
            ->where('tipo_programa', 'like', '%Maestr%')
            ->orderBy('id_programa')
            ->get()
            ->first(function (object $registro): bool {
                $nombre = strtr(mb_strtolower($registro->nombre_programa), [
                    'á' => 'a',
                    'é' => 'e',
                    'í' => 'i',
                    'ó' => 'o',
                    'ú' => 'u',
                ]);

                return in_array($nombre, [
                    'maestria en ciencia de datos',
                    'maestria en ciencia y analisis de datos',
                ], true);
            });

        if (! $programa) {
            return;
        }

        $informacion = [
            'mision' => 'Formar profesionales idóneos de reconocida calidad humana y excelencia científica, con conciencia crítica y capacidad de crear, adaptar y enriquecer la ciencia y tecnología universal para el desarrollo sostenible, impulsando el progreso y la integración nacional, la interacción social y la investigación científica; recuperar los saberes ancestrales; participar en los procesos sociales defendiendo los recursos y los derechos humanos; difundir y acrecentar el patrimonio cultural; y contribuir a la defensa de la soberanía del país y al compromiso con la liberación nacional y social.',
            'versions' => [
                [
                    'name' => 'I versión',
                    'period' => '2023–2024',
                    'status' => 'Concluida académicamente',
                    'enrolled' => 31,
                    'completed' => 22,
                    'completionRate' => 70.97,
                    'graduates' => 0,
                    'withdrawals' => 3,
                    'failed' => 6,
                ],
                [
                    'name' => 'II versión',
                    'period' => '2025–2026',
                    'status' => 'En curso',
                    'enrolled' => 34,
                    'completed' => null,
                    'graduates' => null,
                    'withdrawals' => 1,
                    'failed' => 8,
                    'expectedEnd' => 'Diciembre de 2026',
                    'activeParticipants' => null,
                    'remainingByArithmetic' => 25,
                ],
            ],
            'totals' => [
                'enrolled' => 65,
                'withdrawals' => 4,
                'failed' => 14,
            ],
            'completionNote' => 'La conclusión académica del programa no equivale a la obtención del título de maestría.',
            'pendingValidation' => 'La cantidad activa de participantes de la II versión requiere validación administrativa. La diferencia aritmética es 25; no se ha precisado si los reprobados continúan vinculados al programa.',
            'activeCalls' => 0,
            'nextCallStatus' => 'En elaboración y revisión',
            'historicalPeriods' => ['2023–2024', '2025–2026'],
            'historicalCallsProvided' => false,
            'promotionalMaterialsProvided' => false,
            'admissionRequirementsProvided' => false,
            'enrollmentDatesProvided' => false,
            'costsProvided' => false,
            'officialResolutionsProvided' => false,
            'facultyListVersion' => null,
        ];

        DB::table('programa_postgrado')->where('id_programa', $programa->id_programa)->update([
            'nombre_programa' => 'Maestría en Ciencia y Análisis de Datos',
            'descripcion' => $informacion['mision'],
            'area_conocimiento' => 'Ciencia y Análisis de Datos',
            'informacion_documentada' => json_encode($informacion, JSON_UNESCAPED_UNICODE),
        ]);

        $edicion = DB::table('edicion_programa')
            ->where('id_programa', $programa->id_programa)
            ->orderByDesc('id_edicion')
            ->first();

        if (! $edicion) {
            return;
        }

        $mallaId = $edicion->id_malla;
        if (! $mallaId) {
            return;
        }

        DB::table('edicion_programa')->where('id_edicion', $edicion->id_edicion)->update([
            'nombre_edicion' => 'II versión 2025–2026',
            'descripcion' => 'La II versión está en curso y tiene finalización prevista para diciembre de 2026. Registra 34 inscritos, 1 abandono y 8 reprobados; la cantidad activa requiere validación administrativa.',
            'estado' => 'En Curso',
        ]);

        $edicionHistorica = DB::table('edicion_programa')
            ->where('id_programa', $programa->id_programa)
            ->where('nombre_edicion', 'I versión 2023–2024')
            ->first();

        $datosEdicionHistorica = [
            'nombre_edicion' => 'I versión 2023–2024',
            'descripcion' => 'Versión concluida académicamente: 31 inscritos, 22 participantes que concluyeron (70,97 %), 3 abandonos, 6 reprobados y ningún titulado registrado.',
            'estado' => 'Concluida',
            'id_malla' => $mallaId,
            'id_programa' => $programa->id_programa,
        ];

        if ($edicionHistorica) {
            DB::table('edicion_programa')
                ->where('id_edicion', $edicionHistorica->id_edicion)
                ->update(array_intersect_key($datosEdicionHistorica, array_flip([
                    'nombre_edicion', 'descripcion', 'estado',
                ])));
        } else {
            DB::table('edicion_programa')->insert($datosEdicionHistorica);
        }

        DB::table('malla_curricular')->where('id_malla', $mallaId)->update([
            'nombre_malla' => 'Cuadro académico proporcionado',
        ]);
        $modulo = DB::table('modulo')
            ->where('id_malla', $mallaId)
            ->where('nombre_mod', 'Asignaturas y docentes informados')
            ->first();

        $moduloId = $modulo?->id_mod ?? DB::table('modulo')->insertGetId([
            'nombre_mod' => 'Asignaturas y docentes informados',
            'id_malla' => $mallaId,
            'activo' => true,
        ], 'id_mod');

        $asignaturas = [
            ['Ciencia de Datos I – Introducción', 'M.Sc. Yomar Andoini Machaca Beltran'],
            ['Programación Estadística', 'Dr. Rogelio Mamani'],
            ['Visualización de Datos e Información', 'M.Sc. Alvaro Chirino'],
            ['Ciencia de Datos II – Big Data', 'M.Sc. Bladimir Morales'],
            ['Base de Datos', 'Dr. Rogelio Mamani'],
            ['Análisis Multivariante', 'M.Sc. Bladimir Morales'],
            ['Ciencia de Datos III – Data Mining', 'Dr. Ramiro Aguilar'],
            ['Modelos Lineales y No Lineales', 'Dr. Rolando Gonzales Martínez'],
            ['Inteligencia Artificial', 'M.Sc. Luis Calle'],
            ['Taller de Tesis I', 'M.Sc. Iván Aliaga'],
            ['Ciencia de Datos IV – Machine and Deep Learning', 'Dr. Rolando Gonzales Martínez'],
            ['Series de Tiempo', 'Dra. Mariela González'],
            ['Taller de Tesis II', 'M.Sc. Ivan Aliaga'],
        ];

        foreach ($asignaturas as [$nombre, $docente]) {
            $materia = DB::table('materia')->where('nombre_mat', $nombre)->first();
            $materiaId = $materia?->id_mat ?? DB::table('materia')->insertGetId([
                'nombre_mat' => $nombre,
                'descripcion' => "Docente: {$docente}",
                'activo' => true,
            ], 'id_mat');

            DB::table('materia_maestria')->insertOrIgnore(['id_mat' => $materiaId]);
            DB::table('compone')->insertOrIgnore([
                'id_mod' => $moduloId,
                'id_mat' => $materiaId,
                'creditos' => 0,
                'carga_horaria' => 0,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('programa_postgrado', function (Blueprint $table): void {
            $table->dropColumn('informacion_documentada');
        });
    }
};
