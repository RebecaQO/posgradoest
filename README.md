# Portal Académico de Posgrado — Carrera de Estadística UMSA

Sistema integral web para la gestión, difusión y administración de programas de posgrado (Maestrías y Diplomados), convocatorias, defensas de grado, planta docente y usuarios de la Carrera de Estadística e Instituto de Estadística Teórica y Aplicada (IETA) de la Universidad Mayor de San Andrés (UMSA).

---

## 🏗️ Arquitectura del Sistema

- **Backend:** Laravel 11.x + Laravel Sanctum (Autenticación API) + Laravel Sail.
- **Base de Datos:** PostgreSQL 17.x con persistencia en volumen Docker.
- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + `apiJson` unificado.
- **Entorno de Ejecución:** WSL2 (Ubuntu) con Docker Desktop.

---

## 🚀 Inicio Rápido de los Servicios

Desde PowerShell en la raíz del repositorio:

### 1. Iniciar Contenedores (Sail / Docker Compose)
```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

### 2. Verificar Estado de los Contenedores
```bash
docker compose -f compose.yaml -f compose.local.yaml ps
```
Los servicios `app`, `frontend` y `db` deben estar activos; `app` y `db` deben figurar como saludables.

### 3. Direcciones de Acceso Local
- 🌐 **Portal Web (Frontend):** [http://localhost:3000](http://localhost:3000)
- 🔌 **API REST (Backend):** [http://localhost:8080/api](http://localhost:8080/api)
- 🩺 **Salud del backend:** [http://localhost:8080/up](http://localhost:8080/up)
- 🗄️ **PostgreSQL:** red interna de Docker (`db:5432`); no se publica al host.

---

## 🔐 Acceso

El inicio de sesión acepta nombre de usuario o correo electrónico. El esquema de `usuarios` se crea con las migraciones al iniciar los contenedores, pero no se incluye una cuenta de prueba ni una contraseña predeterminada. Crea las cuentas con credenciales únicas y privadas para cada entorno.

---

## 📌 Módulos del Sistema

### 1. Portal Administrativo (`/admin` / Modal Login)
- **Gestión de Programas de Posgrado:**
  - Creación y edición integral de **Maestrías** (estructura modular con materias, créditos y carga horaria) y **Diplomados** (materias directas asignadas al plan de estudios).
  - Activación y desactivación en tiempo real (`PATCH /api/programas/{id}/desactivar` y `reactivar`).
  - Registro de ediciones con fecha de inicio, duración, requisitos, modalidad de titulación, enlace de convocatoria y formulario de preinscripción.
- **Defensas de Tesis y Grado:**
  - Registro, programación, tribunales evaluadores y estados de defensas académicas.
- **Gestión de Usuarios y Roles:**
  - Control de usuarios administrativos, cambio de contraseñas y asignación de roles.
- **Carrera / IETA:**
  - Información institucional, autoridades, misión, visión y datos de contacto oficiales.

### 2. Portal Público y Catálogo
- **Navegación Dinámica por Hash:**
  - `/#programa/:id` — Ficha y vista detallada oficial del programa académico (información de grado, malla modular, materias, créditos CEUB, perfil del postulante y perfil de egreso).
  - `/#programas` — Catálogo general con filtros por grado académico, área de conocimiento y modalidad.
  - `/#institucion` — Identidad institucional de la Carrera de Estadística y el IETA.
  - `/#convocatorias` — Convocatorias vigentes para postulaciones abiertas.
  - `/#admision` — Pasos, cronograma y requisitos de admisión.
  - `/#contacto` — Canales de atención presenciales y enlace directo a WhatsApp.

---

## 🛠️ Comandos de Mantenimiento

### Ejecución de Comandos Artisan y Migraciones
Los comandos de backend se ejecutan a través del wrapper de Sail dentro de `backend/`:
```bash
cd ~/proyectos/POS_EST/backend
./vendor/bin/sail artisan route:list --path=api
./vendor/bin/sail artisan migrate --force
```

### Compilar Frontend para Producción
```bash
cd ~/proyectos/POS_EST
docker compose -f compose.yaml -f compose.local.yaml exec frontend npm run build
```

### Detener los Servicios
```bash
cd ~/proyectos/POS_EST
docker compose -f compose.yaml -f compose.local.yaml down
```

---

## 💻 Guía para Uso de Git

### Error de "dubious ownership" en Windows PowerShell
Si intentas usar `git` desde PowerShell en Windows sobre la ruta de red `\\wsl.localhost\Ubuntu\...`, Git de Windows puede mostrar el error:
```
fatal: detected dubious ownership in repository at '//wsl.localhost/Ubuntu/home/rebal/proyectos/POS_EST'
```

Para solucionarlo en tu entorno de Windows, abre PowerShell y ejecuta una sola vez:
```powershell
git config --global --add safe.directory "%(prefix)///wsl.localhost/Ubuntu/home/rebal/proyectos/POS_EST"
```
*(O de manera general: `git config --global --add safe.directory *`)*.

### Opción Recomendada: Ejecutar Git dentro de WSL2
La forma más rápida, segura y limpia es ejecutar Git directamente desde la terminal de Ubuntu / WSL2:

```bash
cd ~/proyectos/POS_EST

# 1. Comprobar estado
git status

# 2. Agregar cambios
git add .

# 3. Crear commit
git commit -m "descripcion de los cambios"

# 4. Enviar a GitHub
git push origin main
```

---

## 📂 Estructura del Repositorio

```
POS_EST/
├── backend/                  # API Laravel 11 + Sanctum + PostgreSQL (Sail)
│   ├── app/Http/Controllers/ # Controladores API (Programas, Defensas, Auth, etc.)
│   ├── app/Models/           # Modelos Eloquent con relaciones
│   └── routes/api.php        # Definición de rutas públicas y protegidas
├── frontend/                 # Aplicación React + Vite
│   ├── src/components/       # Componentes (Portales, Programas, Admin, etc.)
│   ├── src/services/         # Clientes de API unificados (programaService, etc.)
│   └── src/App.jsx           # Enrutamiento dinámico por hash y estado general
├── evidencias/               # Reportes técnicos de validación y auditoría de fases
├── docker-compose.yml        # Orquestación de contenedores locales
└── README.md                 # Documentación técnica del proyecto
```
