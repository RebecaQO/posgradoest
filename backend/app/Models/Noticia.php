<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Noticia extends Model
{
    protected $table = 'noticias';

    protected $primaryKey = 'id_noticia';

    protected $fillable = [
        'titulo',
        'categoria',
        'tipo',
        'fecha',
        'descripcion',
        'enlace',
        'estado',
        'imagen_url',
        'publicada',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date:Y-m-d',
            'publicada' => 'boolean',
        ];
    }
}
