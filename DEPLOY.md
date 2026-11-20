# Despliegue en Dokploy

El repositorio contiene una API Laravel en `backend/` y un frontend React independiente en `frontend/`. El `compose.yaml` de la raíz construye imágenes Docker separadas para la API y la interfaz, y ejecuta PostgreSQL.

## Variables de entorno

En Dokploy, configura estas variables para el proyecto Compose. Para desarrollo local, copia `.env.example` a `.env`, genera `APP_KEY` y establece `DB_PASSWORD`. La plantilla deja esos dos valores vacíos deliberadamente; Compose no inicia hasta que estén configurados.

- `APP_KEY`: clave Laravel segura, con prefijo `base64:`.
- `APP_URL`: URL pública del backend.
- `FRONTEND_URL`: URL pública del frontend.
- `VITE_API_URL`: URL pública del backend; queda incluida en el frontend durante la construcción.
- `SANCTUM_STATEFUL_DOMAINS`: dominio del frontend, sin `https://`.
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: credenciales de PostgreSQL. Usa una contraseña larga y única.

Puedes generar una clave Laravel sin instalar PHP en el equipo:

```bash
docker run --rm serversideup/php:8.5-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Copia el resultado en `APP_KEY`. No publiques el archivo `.env` ni subas credenciales reales al repositorio.

## Dokploy

1. Crea una aplicación Compose desde este repositorio y usa la raíz como directorio.
2. Define las variables anteriores en la sección de entorno de Dokploy.
3. Configura el dominio del servicio `frontend` en el puerto interno `80` y el dominio del servicio `app` en el puerto interno `8080`.
4. Verifica que exista la red externa `dokploy-network` en el servidor Dokploy.
5. Despliega. Compose construye `backend/Dockerfile`; al iniciar, la imagen ejecuta las migraciones Laravel.

`compose.yaml` no publica puertos al host: Traefik/Dokploy enruta el tráfico a los puertos internos declarados con `expose`. PostgreSQL queda aislado en `backend-network` y guarda sus datos en el volumen nombrado `db_data`. Los archivos públicos se montan desde `../files/storage`, fuera del checkout desplegable. En el override local, los datos se guardan en `./files/storage`.

## Frontend

El servicio `frontend` usa Nginx para servir la compilación React. `VITE_API_URL` debe apuntar al dominio público del backend. La URL del frontend debe coincidir con `FRONTEND_URL` y el dominio incluido en `SANCTUM_STATEFUL_DOMAINS`.

## Construir y levantar las imágenes localmente

Con Docker instalado, desde la raíz del repositorio:

```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

Compose construye las imágenes independientes `portal-postgrado-api:latest` y `portal-postgrado-frontend:latest`. El portal queda en `http://localhost:3000` y la API en `http://localhost:8080` (`/up` para comprobar salud).

Los puertos locales se enlazan solo a `127.0.0.1` mediante `compose.local.yaml`; ese archivo no se debe seleccionar en Dokploy.

Para consultar registros localmente, ejecuta `docker compose -f compose.yaml -f compose.local.yaml logs -f app frontend`. En Dokploy, usa los logs del servicio `app`. La API expone la comprobación de salud Laravel en `/up`.

## Repositorio de producción

Este repositorio personal es candidato a revisión. El despliegue oficial debe hacerse desde el fork aprobado en `github.com/sociest`; las actualizaciones posteriores se proponen mediante pull requests a ese repositorio. No se deben copiar credenciales reales al repositorio ni desplegar desde una rama personal.

La aplicación actualmente no envía mensajes de correo desde el servidor. Si se agrega esa funcionalidad, coordina un SMTP externo y configura sus credenciales en Dokploy, nunca en el código.
