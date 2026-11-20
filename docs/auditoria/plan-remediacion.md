# Plan de remediación de auditoría

**Estado:** trabajo técnico preparado en `codex/iso-audit-remediation`. No equivale a certificación ISO ni se ha desplegado en producción.

| Hallazgo | Corrección incorporada | Verificación / pendiente |
| --- | --- | --- |
| SEC-01: datos personales de ejemplo en navegador | Se eliminaron expedientes y credenciales ficticias, su contexto de almacenamiento y consulta; al arrancar se borra la clave antigua `posgrado_umsa_applicants`. No se creó una base de datos de postulantes porque el sitio no gestiona admisiones. | El borrado local ocurre al abrir la nueva aplicación en cada navegador que conserve el caché anterior. |
| NET-01: enlaces mock de postulación | La pantalla fue convertida en página de promoción académica; los botones ficticios de formularios y archivos Drive se eliminaron. Se muestran los programas publicados, PDF informativo solo si está configurado, y WhatsApp institucional editable. | Verificar que cada PDF en el panel administrativo sea oficial antes de publicarlo. |
| Mallas/ediciones | Se corrigió la respuesta de detalle para incluir módulos y materias de maestría y materias directas de diplomado también al consultar la malla asociada a una edición. | La prueba del panel recorre la creación de malla, módulo y materia; falta verificación de API con PostgreSQL en staging. |
| SEC-02: cabeceras HTTP | CSP, `X-Frame-Options`, `nosniff`, Referrer-Policy y Permissions-Policy en Nginx. CSP permite el origen API configurado al construir. | Probar cabeceras y CSP contra el dominio desplegado; HSTS debe terminar en el proxy TLS. |
| UX-01: WhatsApp de prueba/duplicado | Los enlaces usan información institucional dinámica y se ocultan si falta un número válido. El valor actual `+591 75855943` es de prueba y editable desde el panel; no se presenta como número oficial. | La institución lo cambiará posteriormente por el dato confirmado. |
| Enlaces del pie | Enlaces a Varianza, Carrera, SOCIEST, Facebook e Instagram cargan desde la respuesta institucional y se editan en el panel. Se ajustó la lectura de la respuesta `data` y contraste; la migración respeta columnas y destinos que ya existan. | Los cinco valores guardados fueron confirmados en PostgreSQL y la API los entrega. E2E confirma su visibilidad y href exactos; Meta limita la comprobación HTTP automatizada de Facebook e Instagram. |
| Rendimiento | Se dividieron por ruta el panel y las vistas públicas. JS inicial 312.64 KB sin gzip (93.41 KB gzip). | Lighthouse y optimización de imágenes grandes siguen pendientes. |
| Accesibilidad | Los diálogos tienen nombre/rol, foco inicial, ciclo Tab, Escape y retorno del foco. | Revisar diálogos con lector de pantalla y teclado manualmente. |
| QA / CI | Vitest, Testing Library, Playwright + axe para la página promocional y catálogo, regresión de mallas; Vitest actualizado a 5.1.1; workflow CI añadido. | Vitest 4/4, E2E 2/2 y build pasan. npm ci en Docker informó 0 vulnerabilidades; npm audit local no pudo contactar registry.npmjs.org. PHPUnit no está en la imagen `--no-dev`; queda ejecutar pruebas backend y CI. |
| Contraseñas administrativas | Alta y cambio exigen 12 caracteres, mayúsculas, minúsculas, números y símbolos. | PHPUnit está añadido; falta ejecutarlo en CI. |

## Alcance del sitio

La página `#admision` es informativa y promocional; no inicia postulaciones, no solicita información personal y no acepta documentos. Si la institución implementa un proceso de admisión en el futuro, debe definir y aprobar previamente los requisitos, avisos de privacidad, responsables y reglas de retención.

## Despliegue

El frontend requiere `VITE_API_URL` al construir la imagen para emitir CSP con el origen API correcto. En el entorno local, Compose publica el frontend en `http://localhost:3000` y la API en `http://localhost:8080`, ligados a loopback. Ambos respondieron HTTP 200 y la API entregó los cinco enlaces; PostgreSQL quedó intacto y saludable. El Nginx del contenedor escucha HTTP; HSTS debe configurarse en el terminador TLS cuando el dominio se sirva por HTTPS. No se desplegó en producción.
