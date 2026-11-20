<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            'contacto_etiqueta' => 'SEDES DE LA CARRERA',
            'contacto_titulo' => 'Ubicación de Sedes',
            'contacto_descripcion' => 'Encuentra las sedes de la Carrera de Estadística en la ciudad de La Paz.',
        ];

        foreach ($defaults as $column => $value) {
            if (!Schema::hasColumn('institucion', $column)) {
                Schema::table('institucion', function (Blueprint $table) use ($column) {
                    $table->string($column, $column === 'contacto_descripcion' ? 1000 : 255)->nullable();
                });
            }
        }

        $institution = DB::table('institucion')->where('id', 1)->first();
        if ($institution) {
            $missing = [];
            foreach ($defaults as $column => $value) {
                if (empty($institution->{$column})) $missing[$column] = $value;
            }
            if ($missing) DB::table('institucion')->where('id', 1)->update($missing);
        }
    }

    public function down(): void
    {
        // Preserve editable copy if a rollback is required.
    }
};
