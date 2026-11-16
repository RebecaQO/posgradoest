# Actualización, copias de seguridad y Docker

Guía para actualizar el Portal Académico sin perder la base de datos ni las cuentas de usuario. Ejecuta los comandos de PowerShell desde la carpeta raíz del proyecto, donde están `compose.yaml` y `compose.local.yaml`.

## Requisitos

- Docker Desktop instalado y en ejecución.
- Un archivo `.env` en la raíz del proyecto con las variables que requiere `compose.yaml`: `APP_KEY`, `APP_URL`, `FRONTEND_URL`, `VITE_API_URL`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD`.
- Conserva el mismo `.env` al actualizar. `APP_KEY` y las credenciales de la base de datos no deben cambiar entre despliegues existentes.

Para desarrollo local, las URLs normalmente son `http://localhost:8080` para `APP_URL` y `VITE_API_URL`, `http://localhost:3000` para `FRONTEND_URL`, y `localhost:3000` en `SANCTUM_STATEFUL_DOMAINS`. Usa una contraseña segura para PostgreSQL. No compartas ni subas `.env`.

## Levantar el proyecto

Desde PowerShell en la raíz:

```powershell
docker compose -f compose.yaml -f compose.local.yaml up -d --build
docker compose -f compose.yaml -f compose.local.yaml ps
```

El portal queda en `http://localhost:3000`, la API en `http://localhost:8080` y la comprobación del backend en `http://localhost:8080/up`. La base de datos solo está disponible dentro de la red de Docker.

Para ver los registros de los servicios:

```powershell
docker compose -f compose.yaml -f compose.local.yaml logs -f app frontend db
```

## Actualizar la aplicación

Haz primero una copia de seguridad siguiendo la siguiente sección. Luego, si actualizas desde Git, trae los cambios de la rama que usa tu instalación. Finalmente, desde la raíz del proyecto ejecuta:

```powershell
docker compose -f compose.yaml -f compose.local.yaml up -d --build --remove-orphans
docker compose -f compose.yaml -f compose.local.yaml ps
docker compose -f compose.yaml -f compose.local.yaml logs --tail 100 app frontend db
```

Esto reconstruye las imágenes de API y frontend y las inicia. Al arrancar, el contenedor de Laravel ejecuta las migraciones configuradas en `compose.yaml`. La actualización no crea de nuevo las cuentas ni reemplaza los datos existentes.

Si el portal está desplegado en Dokploy u otro servidor, estos comandos deben ejecutarse en el servidor o mediante su flujo de despliegue. Reiniciar contenedores ya creados no reconstruye el frontend con archivos nuevos.

## Guardar la base de datos y los usuarios

Las cuentas, contraseñas cifradas, roles y demás registros están en PostgreSQL. Docker los conserva en el volumen `db_data`; los usuarios no se guardan en un archivo separado. Además del volumen, crea copias exportadas para poder recuperar los datos ante una pérdida del servidor.

En PowerShell 7, desde la raíz del proyecto:

```powershell
New-Item -ItemType Directory -Force respaldos | Out-Null
$respaldo = ".\respaldos\portal_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
docker compose -f compose.yaml -f compose.local.yaml exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > $respaldo
if ($LASTEXITCODE -ne 0) { throw "Falló la copia de la base de datos." }
Get-Item $respaldo
```

Guarda el `.sql` en otro disco o en un almacenamiento seguro. Los respaldos pueden contener información personal. La carpeta `respaldos/` está excluida de Git.

Las imágenes y documentos que se subieron a la aplicación se guardan aparte en `files/storage`. Haz también una copia de esa carpeta:

```powershell
$archivos = ".\respaldos\archivos_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Compress-Archive -Path .\files\storage -DestinationPath $archivos
```

Conserva también una copia protegida del `.env`. No la envíes por correo ni la incluyas en Git: contiene secretos necesarios para operar y recuperar el sistema.

## Restaurar una copia SQL

Levanta primero los servicios para que PostgreSQL esté disponible y reemplaza la ruta por el archivo que vas a recuperar:

```powershell
$respaldo = ".\respaldos\portal_20261115_120000.sql"
Get-Content -Raw $respaldo | docker compose -f compose.yaml -f compose.local.yaml exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
if ($LASTEXITCODE -ne 0) { throw "Falló la restauración de la base de datos." }
```

La restauración modifica los datos de la base de datos indicada en `.env`; detén el uso del portal mientras se restaura. Restaura también el ZIP de `files/storage` si necesitas recuperar archivos subidos.

## Detener y proteger los datos

Para detener los contenedores sin borrar la base de datos:

```powershell
docker compose -f compose.yaml -f compose.local.yaml down
```

**No uses `docker compose down -v`** si quieres conservar la base de datos: `-v` elimina el volumen `db_data` y con él los usuarios y registros almacenados. Eliminar los contenedores o reconstruir las imágenes con `up -d --build` no borra ese volumen.

## Cuentas de acceso

No hay una contraseña predeterminada documentada por el proyecto. Usa el acceso administrativo habilitado en tu instalación para crear cuentas individuales y asignar roles. Las contraseñas se guardan como hashes; no se pueden recuperar en texto legible. Si se pierde una contraseña, cámbiala desde la gestión de usuarios o el procedimiento administrativo disponible. Respaldar la base de datos conserva las cuentas y sus hashes.
