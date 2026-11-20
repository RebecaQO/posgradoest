<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInstitucionRequest;
use App\Http\Resources\InstitucionResource;
use App\Models\Institucion;
use Illuminate\Http\JsonResponse;

class InstitucionController extends Controller
{
    public function show(): InstitucionResource
    {
        $institucion = Institucion::firstOrCreate(
            ['id' => 1],
            [
                'nombre_carrera' => 'Carrera de Estadística - Universidad Mayor de San Andrés',
                'direccion' => 'Campus Universitario Cota Cota, Calle 27, Edificio FCPN - Carrera de Estadística, La Paz - Bolivia',
                'email' => 'estapost@fcpn.edu.bo',
                'telefono' => '+591 (2) 279-2999',
                'whatsapp' => '+591 75855943',
                'horarios_atencion' => 'Lunes a Viernes 08:30 - 18:30',
                'director' => 'Dirección de la Carrera de Estadística y Posgrado',
                'campus_virtual_url' => 'https://maestria.estadistica.fcpn.edu.bo',
                'revista_varianza_url' => 'https://ieta.umsa.bo/sobre-la-revista-varianza',
                'estadistica_url' => 'https://estadistica.umsa.bo/',
                'sociest_url' => 'https://www.sociest.org/?m=1',
                'facebook_url' => 'https://www.facebook.com/share/1AHBshwTmJ/',
                'instagram_url' => 'https://www.instagram.com/estadisticaumsa?lqvp=c3ppYjFjaWo3amF0',
                'contacto_etiqueta' => 'SEDES DE LA CARRERA',
                'contacto_titulo' => 'Ubicación de Sedes',
                'contacto_descripcion' => 'Encuentra las sedes de la Carrera de Estadística en la ciudad de La Paz.',
                'descripcion_ieta' => 'Instituto de Estadística Teórica y Aplicada (IETA): Centro de investigación cuantitativa avanzada y consultoría estadística aplicada para el desarrollo nacional.',
                'descripcion_club' => 'Club Científico de Estadística: Comunidad estudiantil y académica de investigación formativa, semilleros y proyectos de ciencia de datos.',
            ]
        );

        return new InstitucionResource($institucion);
    }

    public function update(UpdateInstitucionRequest $request): InstitucionResource|JsonResponse
    {
        $institucion = Institucion::firstOrCreate(['id' => 1]);
        $institucion->update($request->validated());

        return new InstitucionResource($institucion);
    }
}
