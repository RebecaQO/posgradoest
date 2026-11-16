# Portal Académico de Posgrado — Carrera de Estadística UMSA

Sistema integral web para la gestión, difusión y administración de programas de posgrado (Maestrías y Diplomados), convocatorias, defensas de grado, planta docente, personal administrativo y usuarios de la Carrera de Estadística e Instituto de Estadística Teórica y Aplicada (IETA) de la Universidad Mayor de San Andrés (UMSA).

---

## 🏗️ Arquitectura del Sistema

- **Backend:** Laravel 11.x + Laravel Sanctum (Autenticación API) + PHP 8.2+ en contenedor Docker.
- **Base de Datos:** PostgreSQL 16.x con persistencia en volumen Docker.
- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons + `apiJson` unificado.
- **Servidor Web Frontend:** Nginx Alpine para servir la SPA y resolver rutas mediante HTML5 History mode.
- **Orquestación:** Docker Compose (`compose.yaml` + `compose.local.yaml`).

---

## 🚀 Cómo Levantar los Contenedores (Paso a Paso)

### Requisitos Previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución (en Windows, macOS o Linux).
- Git instalado.

---

### Paso 1. Clonar el Repositorio y Ubicarse en la Rama
```bash
git clone https://github.com/RebecaQO/postgrado_estadistica.git
cd postgrado_estadistica
git checkout VERSION_ACTUALIZADA
```

---

### Paso 2. Configurar el Archivo de Entorno (`.env`)
Copia la plantilla de variables de entorno en la raíz del proyecto:

**En Linux / macOS / WSL2:**
```bash
cp .env.example .env
```

**En Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

> **Nota:** `.env.example` ya viene preconfigurado con las claves y puertos necesarios para levantar de forma inmediata en local:
> - `APP_URL=http://localhost:8080`
> - `FRONTEND_URL=http://localhost:3000`
> - `VITE_API_URL=http://localhost:8080`
> - `DB_DATABASE=portal` / `DB_USERNAME=portal`

---

### Paso 3. Levantar los Contenedores con Docker Compose
Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

**¿Por qué dos archivos?**
- `compose.yaml`: Define la arquitectura de producción (servicios `app`, `frontend`, `db`, volúmenes de almacenamiento y redes internas).
- `compose.local.yaml`: Mapea los puertos a tu máquina anfitriona (`3000:80` para el frontend y `8080:8080` para el backend).

---

### Paso 4. Verificar el Estado de los Contenedores
```bash
docker compose -f compose.yaml -f compose.local.yaml ps
```
Deberás ver los 3 servicios activos:
- `portal-postgrado-api` (`app`) — Estado: `Up` (healthy) en el puerto `8080`
- `portal-postgrado-frontend` (`frontend`) — Estado: `Up` en el puerto `3000`
- `postgres:16-alpine` (`db`) — Estado: `Up` (healthy) en el puerto `5432` (red interna)

---

### Paso 5. Direcciones de Acceso
| Servicio | URL Local | Descripción |
|---|---|---|
| **Frontend (Portal Web)** | [http://localhost:3000](http://localhost:3000) | Portal público, catálogo y panel administrativo |
| **Backend (API REST)** | [http://localhost:8080/api](http://localhost:8080/api) | Endpoints JSON de la API |
| **Salud del Backend** | [http://localhost:8080/up](http://localhost:8080/up) | Health check del framework Laravel |

---

## 🛠️ Comandos de Mantenimiento Frecuentes

### Ejecutar Migraciones o Seeders en la Base de Datos
Las migraciones se ejecutan automáticamente al iniciar el contenedor `app`. Si deseas forzarlas manualmente:
```bash
docker compose -f compose.yaml -f compose.local.yaml exec app php artisan migrate --force
```

Para sembrar datos iniciales:
```bash
docker compose -f compose.yaml -f compose.local.yaml exec app php artisan db:seed --force
```

### Ver Rutas de la API Backend
```bash
docker compose -f compose.yaml -f compose.local.yaml exec app php artisan route:list --path=api
```

### Ver Logs en Tiempo Real
```bash
# Ver todos los logs
docker compose -f compose.yaml -f compose.local.yaml logs -f

# Ver solo logs del backend
docker compose -f compose.yaml -f compose.local.yaml logs -f app

# Ver solo logs del frontend
docker compose -f compose.yaml -f compose.local.yaml logs -f frontend
```

### Recompilar el Frontend Tras Modificaciones
Si realizas cambios en el código de `frontend/src`:
```bash
# Opción A (Local con Node instalado):
cd frontend
npm run build
docker cp dist/. postgrado_estadistica-avance-gary-frontend-1:/usr/share/nginx/html/

# Opción B (Reconstrucción completa de imagen Docker):
docker compose -f compose.yaml -f compose.local.yaml up -d --build frontend
```

### Detener los Contenedores
Para pausar los contenedores preservando la base de datos y archivos:
```bash
docker compose -f compose.yaml -f compose.local.yaml down
```

Para detener y reiniciar desde cero limpiando volúmenes:
```bash
docker compose -f compose.yaml -f compose.local.yaml down -v
```

---

## 📌 Módulos del Sistema

### 1. Portal Administrativo (`/admin` / Modal Login)
- **Gestión de Programas de Posgrado:** Creación y edición integral de **Maestrías** (malla modular, materias, créditos, carga horaria) y **Diplomados** (módulos directos).
- **Activación / Desactivación:** Control en tiempo real del estado público de los programas (`PATCH /api/programas/{id}/desactivar` y `reactivar`).
- **Gestión de Ediciones:** Fechas de inicio, duración, modalidad, aranceles, enlaces a convocatorias y formularios de preinscripción.
- **Defensas de Tesis y Grado:** Registro, programación de fechas, tribunales evaluadores y estados académicos.
- **Planta Docente y Personal Administrativo:** Mantenimiento de perfiles profesionales, especialidades, grado académico y datos de contacto.
- **Noticias y Publicaciones:** Módulo de comunicados y noticias del posgrado.
- **Usuarios y Roles:** Control de credenciales de acceso administrativo y privilegios del sistema.

### 2. Portal Público y Catálogo
- `/#programa/:id` — Ficha oficial del programa académico (malla curricular, materias, perfil del postulante, egreso, requisitos y horarios).
- `/#programas` — Catálogo general con filtros en vivo por tipo de programa (Maestría / Diplomado), área y modalidad.
- `/#institucion` — Identidad institucional, principios de misión/visión oficial, directorio de personal y línea de tiempo histórica.
- `/#convocatorias` — Convocatorias y afiches oficiales descargables.
- `/#contacto` — Sedes institucionales (Campus Cota Cota y Edificio Monoblock), canales de contacto presencial y WhatsApp.
- `/#inicio` — Página principal con banners destacados, estadísticas, indicadores clave y sección de **Preguntas Frecuentes**.

---

## 🌿 Flujo de Trabajo en Git

Para trabajar y subir cambios a la rama oficial `VERSION_ACTUALIZADA`:

```bash
# 1. Asegurarte de estar en la rama de trabajo
git checkout VERSION_ACTUALIZADA

# 2. Descargar los últimos cambios
git pull origin VERSION_ACTUALIZADA

# 3. Revisar el estado de archivos modificados
git status

# 4. Agregar cambios para commit
git add .

# 5. Crear el commit descriptivo
git commit -m "feat/fix: descripcion clara de los cambios realizados"

# 6. Subir al repositorio remoto
git push origin VERSION_ACTUALIZADA
```

---

## 📂 Estructura Limpia del Repositorio

```text
postgrado_estadistica/
├── backend/                  # API REST en Laravel 11 (PHP 8.2+)
│   ├── app/                  # Controladores, Modelos, Recursos y Middleware
│   ├── config/               # Configuración de base de datos, auth y cors
│   ├── database/             # Migraciones y seeders de la base de datos
│   ├── routes/api.php        # Endpoints de la API pública y administrativa
│   ├── composer.json         # Dependencias PHP
│   ├── composer.lock
│   └── Dockerfile            # Imagen de backend para producción
│
├── frontend/                 # Aplicación SPA en React 19 + Vite
│   ├── src/                  # Componentes, vistas, hooks y servicios API
│   ├── src/assets/images/    # Catálogo limpio de assets gráficos
│   ├── package.json          # Dependencias JavaScript
│   ├── package-lock.json
│   ├── nginx.conf            # Servidor Nginx para rutas SPA
│   └── Dockerfile            # Construcción multi-stage de producción
│
├── files/                    # Almacenamiento persistente
│   └── storage/              # Banners, fotos y folletos subidos (.gitkeep)
│
├── compose.yaml              # Especificación Docker Compose base
├── compose.local.yaml        # Mapeo de puertos para desarrollo local (3000 / 8080)
├── .env.example              # Plantilla de variables de entorno lista para usar
├── .gitignore                # Exclusiones de Git
├── DEPLOY.md                 # Guía para despliegue en servidor / Dokploy
└── README.md                 # Este manual general de referencia
```
