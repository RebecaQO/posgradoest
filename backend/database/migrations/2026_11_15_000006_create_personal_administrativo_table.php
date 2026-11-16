<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_administrativo', function (Blueprint $table): void {
            $table->bigIncrements('id_personal');
            $table->string('nombre', 150);
            $table->string('cargo', 150);
            $table->string('grado', 200)->nullable();
            $table->string('oficina', 255)->nullable();
            $table->text('biografia')->nullable();
            $table->string('foto_url', 2048)->nullable();
            $table->boolean('es_director')->default(false);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        DB::table('personal_administrativo')->insert([
            [
                'nombre' => 'Dr. Marcelo Ramos Quispe',
                'cargo' => 'Director de la Carrera de Estadística',
                'grado' => 'Ph.D. en Ciencias Estadísticas & Modelación Estocástica',
                'oficina' => 'Dirección de Carrera · Edificio FCPN, Campus Cota Cota',
                'biografia' => 'Máxima autoridad de la Carrera de Estadística y Posgrado, responsable de la dirección académica, estratégica e investigación de cuarto nivel.',
                'foto_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'es_director' => true,
                'orden' => 1,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Lic. Gabriela Miranda Rios',
                'cargo' => 'Responsable de Secretaría y Admisiones',
                'grado' => 'Lic. en Administración y Gestión Universitaria',
                'oficina' => 'Secretaría de Posgrado · Campus Cota Cota',
                'biografia' => 'Atención al postulante, recepción de requisitos de admisión, matriculación y trámites de homologación de diplomas y títulos de posgrado.',
                'foto_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
                'es_director' => false,
                'orden' => 2,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Ing. David Fernández Choque',
                'cargo' => 'Administrador de Plataforma y Sistemas',
                'grado' => 'Ing. de Sistemas & Infraestructura Cloud',
                'oficina' => 'Soporte Tecnológico · Laboratorio Central',
                'biografia' => 'Administración del campus virtual, clúster de cómputo para R/Python y soporte técnico permanente a docentes y maestrantes.',
                'foto_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                'es_director' => false,
                'orden' => 3,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_administrativo');
    }
};
