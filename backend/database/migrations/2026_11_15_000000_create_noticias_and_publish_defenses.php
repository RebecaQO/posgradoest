<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('noticias', function (Blueprint $table): void {
            $table->bigIncrements('id_noticia');
            $table->string('titulo', 255);
            $table->string('categoria', 120);
            $table->string('tipo', 30)->default('noticia');
            $table->date('fecha');
            $table->text('descripcion');
            $table->string('enlace', 2048)->nullable();
            $table->string('estado', 100)->default('Publicado');
            $table->text('imagen_url')->nullable();
            $table->boolean('publicada')->default(true);
            $table->timestamps();
        });

        Schema::table('defensa_tesis', function (Blueprint $table): void {
            $table->boolean('publicado')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('defensa_tesis', function (Blueprint $table): void {
            $table->dropColumn('publicado');
        });

        Schema::dropIfExists('noticias');
    }
};
