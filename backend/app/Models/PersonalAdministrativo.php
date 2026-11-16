<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalAdministrativo extends Model
{
    protected $table = 'personal_administrativo';

    protected $primaryKey = 'id_personal';

    protected $fillable = [
        'nombre',
        'cargo',
        'grado',
        'oficina',
        'email',
        'telefono',
        'biografia',
        'foto_url',
        'es_director',
        'orden',
        'activo',
    ];

    protected $casts = [
        'id_personal' => 'integer',
        'es_director' => 'boolean',
        'orden' => 'integer',
        'activo' => 'boolean',
    ];
}
