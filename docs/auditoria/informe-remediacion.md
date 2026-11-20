# Informe de remediación y reevaluación técnica

**Referencia:** auditoría recibida para commit `8b7248a`, rama `VERSION_ACTUALIZADA`.
**Trabajo:** rama aislada `codex/iso-audit-remediation`.
**Alcance:** correcciones al código y artefactos automatizables de los hallazgos SEC-01, NET-01, SEC-02, DAT-01, UX-01, PERF-01 y QA-01, más política de contraseñas y teclado para diálogos.

## Comparación

| Área | Auditoría inicial | Estado en la remediación |
| --- | --- | --- |
| Admisiones | La pantalla presentaba enlaces ficticios a Google Forms/Drive y datos de ejemplo en una gestión local | Según la aclaración institucional, no existe un proceso de postulación en este sitio. La pantalla quedó como promoción de programas, con información existente, PDF si está configurado y consulta por WhatsApp institucional; no recopila datos personales |
| Mallas/ediciones | Los módulos/materias no aparecían después de crear mallas nuevas | El detalle de malla y programa ahora incluye las relaciones de módulos y materias para maestrías/diplomados y para ediciones |
| Privacidad | Riesgo de PII de ejemplo en navegador; no había aviso | Se retiraron los datos de ejemplo y su almacenamiento; se elimina una sola vez la antigua clave local al abrir la aplicación. La vista promocional no registra datos de postulantes |
| Contactos | Enlaces WhatsApp repetidos y valores de prueba | Número servido desde API institucional; valor de prueba editable desde panel |
| Pie de página | Enlaces institucionales no aparecían y no eran editables | Se corrigió el parseo de la respuesta API; destinos IETA, Carrera, SOCIEST, Facebook e Instagram se gestionan desde el panel. Contraste mejorado y los destinos vacíos no se muestran |
| HTTP | Nginx frontal sin CSP/cabeceras | Se verificaron las cabeceras en la respuesta de Nginx local; CSP usa el API origin configurado al construir. Validación del proxy público sigue pendiente |
| Rendimiento | Bundle principal medido en ~632 kB | JS inicial 312.64 kB sin gzip, 93.41 kB gzip; módulos secundarios se descargan al navegar |
| QA | Sin CI ni tests frontend operativos | Vitest 5.1.1 (4 tests), Playwright E2E con axe sobre promoción y catálogo (2 tests); PHPUnit y workflow CI pendientes de runner con dependencias de desarrollo |
| Teclado | Modales sin focus trap | Gestión de foco y test automatizado para ciclo, Escape y restauración |

## Evidencia ejecutada

- `npm run build`: compilación de producción exitosa; JS de entrada 312.64 KB (93.41 KB gzip).
- `npm run test:e2e`: 2 pruebas Chromium + axe pasan para promoción y catálogo; verifica que no hay captura de datos, accesibilidad seria/crítica y que los cinco enlaces del pie están visibles con sus destinos correctos.
- `npm test`: 4/4 pruebas frontend pasan. `npm ci` en Docker informó 0 vulnerabilidades; la consulta manual `npm audit` no llegó a registry.npmjs.org por DNS en el entorno local.
- `git diff --check`: sin errores; solo advertencia de conversión LF/CRLF en archivo previamente modificado.
- Docker local: API saludable, frontend sirve la página; se reiniciaron frontend y API, migración aplicada sin reiniciar ni borrar PostgreSQL. La respuesta API confirmó los cinco destinos y se conservaron sus valores previos.
- Navegación externa: se pudo resolver IETA, Carrera y dominio SOCIEST; Meta no permitió fetch automatizado de los URLs de Facebook/Instagram, aunque ambos destinos se entregan exactamente por API.
- Búsqueda estática: los nombres, CI y contraseña inicial denunciados ya no aparecen en frontend.
- `php artisan test` no está disponible en la imagen de producción, creada con `composer install --no-dev`; la suite backend sigue pendiente en CI con dependencias de desarrollo.

## Riesgos residuales y pendientes

1. No es dictamen de certificación ni evaluación formal de conformidad ISO.
2. Si en el futuro se incorpora una postulación o captura de datos personales, deberá aprobarse y publicarse el aviso institucional de privacidad y definirse el proceso antes de activarla.
3. El número WhatsApp actual se indicó como de prueba y debe editarse posteriormente en el panel.
4. Probar CSP/headers contra el proxy real en staging antes de promover a producción.
5. No se implementó recepción, documentos ni retención de postulaciones porque el sitio no cuenta con ese proceso.
6. axe-core pasó en promoción y catálogo; no se midieron Lighthouse, lector de pantalla ni Core Web Vitals p75.
7. El workflow CI todavía no corrió en GitHub; la suite PHPUnit requiere runner con dependencias de desarrollo instaladas.

No se modificó la rama principal ni se desplegó en producción. La migración solo se aplicó en el contenedor local aislado para verificar compatibilidad y conservar los datos existentes.
