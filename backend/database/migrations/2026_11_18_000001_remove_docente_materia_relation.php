<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('docente_materia');
    }

    public function down(): void
    {
        if (Schema::hasTable('docente_materia')) {
            return;
        }

        Schema::create('docente_materia', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_mat');
            $table->unsignedBigInteger('id_doc');
            $table->primary(['id_mat', 'id_doc']);
            $table->foreign('id_mat')->references('id_mat')->on('materia')->cascadeOnDelete();
            $table->foreign('id_doc')->references('id_doc')->on('docente')->cascadeOnDelete();
        });
    }
};
