<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArchivoController extends Controller
{
    public function subirBannerDefensa(Request $request): JsonResponse
    {
        $request->validate([
            'archivo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $request->file('archivo')->store('defensas/banners', 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'url' => url(Storage::disk('public')->url($path)),
            ],
        ], 201);
    }

    public function subirArchivoEdicion(Request $request, string $tipo)
    {
        abort_unless(in_array($tipo, ['banner', 'folleto'], true), 404);

        $reglasArchivo = $tipo === 'banner'
            ? ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']
            : ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:20480'];

        $request->validate(['archivo' => $reglasArchivo]);

        $path = $request->file('archivo')->store("ediciones/{$tipo}s", 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'url' => url(Storage::disk('public')->url($path)),
            ],
        ], 201);
    }
}
