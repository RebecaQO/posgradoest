<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programa_postgrado', function (Blueprint $table): void {
            $table->bigIncrements('id_programa');
            $table->string('nombre_programa', 150);
            $table->text('descripcion')->nullable();
            $table->string('tipo_programa', 30);
            $table->string('area_conocimiento', 150)->nullable();
            $table->string('mencion', 150)->nullable();
            $table->text('perfil_aspirante')->nullable();
            $table->text('perfil_egreso')->nullable();
            $table->string('enlace_pdf_programa', 2048)->nullable();
        });

        Schema::create('usuarios', function (Blueprint $table): void {
            $table->bigIncrements('id_usuario');
            $table->string('nombre', 255)->unique();
            $table->string('password');
            $table->string('rol', 30)->default('usuario');
            $table->timestamps();
        });

        Schema::create('maestria', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_programa')->primary();
            $table->string('tipo', 30)->nullable();
            $table->foreign('id_programa')->references('id_programa')->on('programa_postgrado')->cascadeOnDelete();
        });

        Schema::create('diplomado', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_programa')->primary();
            $table->foreign('id_programa')->references('id_programa')->on('programa_postgrado')->cascadeOnDelete();
        });

        Schema::create('malla_curricular', function (Blueprint $table): void {
            $table->bigIncrements('id_malla');
            $table->string('nombre_malla', 150);
            $table->unsignedBigInteger('id_programa');
            $table->foreign('id_programa')->references('id_programa')->on('programa_postgrado')->cascadeOnDelete();
        });

        Schema::create('modulo', function (Blueprint $table): void {
            $table->bigIncrements('id_mod');
            $table->string('nombre_mod', 150);
            $table->unsignedBigInteger('id_malla');
            $table->foreign('id_malla')->references('id_malla')->on('malla_curricular')->cascadeOnDelete();
        });

        Schema::create('materia', function (Blueprint $table): void {
            $table->bigIncrements('id_mat');
            $table->string('nombre_mat', 150);
            $table->text('descripcion')->nullable();
        });

        Schema::create('materia_maestria', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_mat')->primary();
            $table->foreign('id_mat')->references('id_mat')->on('materia')->cascadeOnDelete();
        });

        Schema::create('modulo_diplomado', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_mat')->primary();
            $table->foreign('id_mat')->references('id_mat')->on('materia')->cascadeOnDelete();
        });

        Schema::create('compone', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_mod');
            $table->unsignedBigInteger('id_mat');
            $table->unsignedInteger('creditos');
            $table->unsignedInteger('carga_horaria');
            $table->primary(['id_mod', 'id_mat']);
            $table->foreign('id_mod')->references('id_mod')->on('modulo')->cascadeOnDelete();
            $table->foreign('id_mat')->references('id_mat')->on('materia_maestria')->cascadeOnDelete();
        });

        Schema::create('integra', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_malla');
            $table->unsignedBigInteger('id_mat');
            $table->unsignedInteger('creditos');
            $table->unsignedInteger('carga_horaria');
            $table->primary(['id_malla', 'id_mat']);
            $table->foreign('id_malla')->references('id_malla')->on('malla_curricular')->cascadeOnDelete();
            $table->foreign('id_mat')->references('id_mat')->on('modulo_diplomado')->cascadeOnDelete();
        });

        Schema::create('docente', function (Blueprint $table): void {
            $table->bigIncrements('id_doc');
            $table->string('nombre_doc', 100);
            $table->string('apellido_doc', 100);
            $table->text('foto')->nullable();
        });

        Schema::create('edicion_programa', function (Blueprint $table): void {
            $table->bigIncrements('id_edicion');
            $table->string('nombre_edicion', 100);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('duracion', 100);
            $table->string('horario', 150);
            $table->text('descripcion');
            $table->text('modalidad_titulacion');
            $table->text('requisitos');
            $table->text('convocatoria');
            $table->text('formulario');
            $table->string('estado', 30)->default('En Proceso');
            $table->unsignedBigInteger('id_malla');
            $table->unsignedBigInteger('id_programa');
            $table->foreign('id_malla')->references('id_malla')->on('malla_curricular')->cascadeOnDelete();
            $table->foreign('id_programa')->references('id_programa')->on('programa_postgrado')->cascadeOnDelete();
        });

        Schema::create('enseña', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_edicion');
            $table->unsignedBigInteger('id_doc');
            $table->primary(['id_edicion', 'id_doc']);
            $table->foreign('id_edicion')->references('id_edicion')->on('edicion_programa')->cascadeOnDelete();
            $table->foreign('id_doc')->references('id_doc')->on('docente')->cascadeOnDelete();
        });

        Schema::create('defensa_tesis', function (Blueprint $table): void {
            $table->bigIncrements('id_defensa');
            $table->unsignedBigInteger('id_edicion');
            $table->date('fecha_defensa');
            $table->time('hora_defensa');
            $table->string('lugar_defensa', 150);
            $table->string('estado', 30)->default('Pendiente');
            $table->foreign('id_edicion')->references('id_edicion')->on('edicion_programa')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('defensa_tesis');
        Schema::dropIfExists('enseña');
        Schema::dropIfExists('edicion_programa');
        Schema::dropIfExists('docente');
        Schema::dropIfExists('integra');
        Schema::dropIfExists('compone');
        Schema::dropIfExists('modulo_diplomado');
        Schema::dropIfExists('materia_maestria');
        Schema::dropIfExists('materia');
        Schema::dropIfExists('modulo');
        Schema::dropIfExists('malla_curricular');
        Schema::dropIfExists('diplomado');
        Schema::dropIfExists('maestria');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('programa_postgrado');
    }
};
