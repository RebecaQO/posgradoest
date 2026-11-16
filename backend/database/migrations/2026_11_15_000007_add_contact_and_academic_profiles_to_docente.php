<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('docente', function (Blueprint $table): void {
            $table->string('email', 254)->nullable();
            $table->string('telefono', 100)->nullable();
            $table->string('especialidad', 255)->nullable();
            $table->string('categoria', 100)->nullable();
            $table->text('scholar')->nullable();
            $table->text('researchgate')->nullable();
            $table->text('linkedin')->nullable();
            $table->text('orcid')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('docente', function (Blueprint $table): void {
            $table->dropColumn([
                'email', 'telefono', 'especialidad', 'categoria',
                'scholar', 'researchgate', 'linkedin', 'orcid',
            ]);
        });
    }
};
