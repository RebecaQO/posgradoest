<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('edicion_programa', function (Blueprint $table): void {
            $table->text('banner')->nullable();
            $table->text('folleto')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('edicion_programa', function (Blueprint $table): void {
            $table->dropColumn(['banner', 'folleto']);
        });
    }
};
