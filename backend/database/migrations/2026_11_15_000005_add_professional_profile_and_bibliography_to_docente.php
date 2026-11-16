<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('docente', function (Blueprint $table): void {
            $table->text('descripcion_profesional')->nullable();
            $table->string('bibliografia_url', 2048)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('docente', function (Blueprint $table): void {
            $table->dropColumn(['descripcion_profesional', 'bibliografia_url']);
        });
    }
};
