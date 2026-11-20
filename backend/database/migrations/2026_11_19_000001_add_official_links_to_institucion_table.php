<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $columns = [
            'revista_varianza_url' => 'https://ieta.umsa.bo/sobre-la-revista-varianza',
            'estadistica_url' => 'https://estadistica.umsa.bo/',
            'sociest_url' => 'https://www.sociest.org/?m=1',
            'facebook_url' => 'https://www.facebook.com/share/1AHBshwTmJ/',
            'instagram_url' => 'https://www.instagram.com/estadisticaumsa?lqvp=c3ppYjFjaWo3amF0',
        ];

        foreach ($columns as $column => $url) {
            if (!Schema::hasColumn('institucion', $column)) {
                Schema::table('institucion', function (Blueprint $table) use ($column) {
                    $table->string($column, 500)->nullable();
                });
            }
        }

        $institution = DB::table('institucion')->where('id', 1)->first();
        if ($institution) {
            $missing = [];
            foreach ($columns as $column => $url) {
                if (empty($institution->{$column})) $missing[$column] = $url;
            }
            if ($missing) DB::table('institucion')->where('id', 1)->update($missing);
        }
    }

    public function down(): void
    {
        // Keep these optional institution settings during rollback so existing values are never lost.
    }
};
