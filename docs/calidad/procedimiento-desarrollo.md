# Procedimiento de desarrollo y cambios

## Flujo

1. Crear una rama `codex/<tema>` desde la revisión actual y registrar IDs de hallazgos/requisitos.
2. Inspeccionar contratos API, esquema, permisos, privacidad y navegación antes de editar.
3. Implementar en cambios revisables; para esquemas, usar migraciones aditivas y reversibles cuando no impliquen pérdida de datos.
4. Añadir pruebas de comportamiento y documentar la evidencia. No usar datos personales reales en fixtures.
5. Ejecutar `npm test`, `npm run build`, `php artisan test` y revisión de cambios antes de solicitar integración.
6. Abrir Pull Request; exigir un revisor distinto del autor, checks CI aprobados y matriz de trazabilidad actualizada.
7. No hacer merge con checks fallidos. Las reglas de branch protection se configuran en GitHub y deben habilitarse por un administrador del repositorio.

## Revisión y control documental

- Revisar autorización, exposición de datos, validación, errores, migraciones, accesibilidad, enlaces externos y responsive.
- Relacionar cada cambio con un issue/hallazgo y mantener historial Git.
- Registrar dependencias agregadas, licencia, propósito y auditoría de vulnerabilidades.
- Mantener documentación de despliegue sincronizada con Docker Compose, variables de entorno y migrations.

## Pruebas y aceptación

- Unitarias: reglas puras, helpers y componentes aislados.
- Integración: endpoints Laravel, autenticación, autorización, validación y persistencia.
- E2E: flujos críticos en un entorno desechable con datos sintéticos.
- UAT: usuarios institucionales registran resultado, versión probada, incidencias y aceptación antes del despliegue.

## Despliegue, incidentes y mejora continua

- Promover staging → aprobación institucional → respaldo verificado → despliegue → smoke checks → observación.
- No ejecutar migraciones destructivas en producción; definir recuperación y ventana de mantenimiento.
- Registrar incidentes, impacto, contención, causa raíz y acción correctiva en plantilla de incidencias.
- Revisar métricas, vulnerabilidades y retroalimentación al menos en cada ciclo de publicación.
- Para datos personales, seguir el procedimiento institucional de incidentes y no incluir PII en logs.

Este documento es una plantilla operativa inicial; responsables, tiempos de respuesta y aprobadores deben ser formalizados por la Carrera/UMSA.
