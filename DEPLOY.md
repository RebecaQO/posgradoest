# Despliegue en Dokploy

El repositorio contiene una API Laravel en `backend/` y un frontend React independiente en `frontend/`. El `compose.yaml` de la raíz construye imágenes Docker separadas para la API y la interfaz, y ejecuta PostgreSQL.

## Variables de entorno

En Dokploy, configura estas variables para el proyecto Compose. Para desarrollo local, copia `.env.example` a `.env` y reemplaza los valores de ejemplo.

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

PostgreSQL no publica puertos al exterior y guarda sus datos en el volumen `db_data`. Los archivos públicos subidos por usuarios se conservan en `files/storage`.

## Frontend

El servicio `frontend` usa Nginx para servir la compilación React. `VITE_API_URL` debe apuntar al dominio público del backend. La URL del frontend debe coincidir con `FRONTEND_URL` y el dominio incluido en `SANCTUM_STATEFUL_DOMAINS`.

## Construir y levantar las imágenes localmente

Con Docker instalado, desde la raíz del repositorio:

```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

Compose construye las imágenes independientes `portal-postgrado-api:latest` y `portal-postgrado-frontend:latest`. El portal queda en `http://localhost:3000` y la API en `http://localhost:8080` (`/up` para comprobar salud).

Para consultar registros localmente, ejecuta `docker compose -f compose.yaml -f compose.local.yaml logs -f app frontend`. En Dokploy, usa los logs del servicio `app`. La API expone la comprobación de salud Laravel en `/up`.
