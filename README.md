# ⏱️ Registro Horario — Práctica 1 DISM

Sistema de **registro horario** para gestionar los fichajes de los trabajadores de una organización y llevar el control de las horas y los trabajos realizados.

> Universidad de Alicante · Ingeniería Multimedia · **DISM** (Dispositivos e Infraestructura de Sistemas Multimedia) · Curso 2026-2027

## 🔌 Puertos

| Servicio | Puerto | Uso |
|---|---|---|
| MySQL | `3306` | Base de datos `api_dism` (XAMPP) |
| Apache HTTP | `80` | phpMyAdmin y servicios de XAMPP (opcional) |
| Apache HTTPS | `443` | Acceso seguro a XAMPP (opcional) |
| Servicio REST | `8080` | API `http://localhost:8080/v1` y Swagger en `/api-docs` |
| AppAdmin | `8100` | Aplicación de administración |
| AppUsuarios | `8101` | Aplicación de los trabajadores |

---

## 📐 Arquitectura

```
┌──────────────┐      ┌───────────────┐
│  AppAdmin    │      │  AppUsuarios  │      Ionic + Angular
│  (Ionic)     │      │  (Ionic)      │
└──────┬───────┘      └───────┬───────┘
       │      HTTP / JSON     │
       └──────────┬───────────┘
                  ▼
        ┌───────────────────┐
        │  Servicios REST   │      Node.js + Express
        │  (OpenAPI 3)      │      http://localhost:8080/v1
        └─────────┬─────────┘
                  ▼
        ┌───────────────────┐
        │   MySQL (api_dism)│      XAMPP
        └───────────────────┘
```

Las dos apps comparten datos exclusivamente a través de los servicios REST. El backend se diseñó primero con **OpenAPI** (`backend/api/openapi.yaml`) y su esqueleto se generó con `openapi-generator` (`nodejs-express-server`), sobre el que se añadió la lógica de negocio.

## 📁 Estructura del repositorio

```
DISM_practica1.1/
├── AppAdmin/            # App Ionic de administración (usuarios, trabajos, fichajes)
├── AppUsuarios/         # App Ionic de los trabajadores (login, fichar, consultar)
├── backend/             # Servicios REST (Node.js + Express + OpenAPI)
│   ├── api/openapi.yaml #   contrato de la API
│   ├── controllers/     #   controladores (sesión, permisos por rol)
│   ├── services/        #   lógica de negocio y consultas SQL
│   ├── utils/db.js      #   pool de conexión a MySQL
│   └── expressServer.js #   middlewares: CORS, sesión, validación OpenAPI
├── codigo.yaml          # Diseño OpenAPI de partida
└── openapitools.json    # Configuración del generador
```

## 🧰 Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | Ionic 9, Angular 22 (componentes standalone), Ionicons, Leaflet |
| Backend | Node.js, Express, express-openapi-validator, express-session, bcryptjs, swagger-ui-express, mysql2, winston |
| Base de datos | MySQL / MariaDB (XAMPP) |
| Diseño de API | OpenAPI 3 + openapi-generator 7.26 |

## ✅ Requisitos previos

- [Node.js](https://nodejs.org/) (versión compatible con Angular 22 y Express 4)
- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL) o cualquier MySQL local
- Ionic CLI: `npm install -g @ionic/cli`

## 🚀 Puesta en marcha

### 1. Base de datos

Con MySQL arrancado, crea la base de datos `api_dism` desde phpMyAdmin o la consola:

```sql
CREATE DATABASE IF NOT EXISTS api_dism CHARACTER SET utf8mb4;
USE api_dism;

CREATE TABLE usuarios (
  IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
  Nombre    VARCHAR(100) NOT NULL,
  Usuario   VARCHAR(50),
  Clave     VARCHAR(255),          -- hash bcrypt (ver nota abajo)
  EsAdmin   TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE trabajos (
  IdTrabajo INT AUTO_INCREMENT PRIMARY KEY,
  Nombre    VARCHAR(200) NOT NULL
);

CREATE TABLE fichajes (
  IdFichaje               INT AUTO_INCREMENT PRIMARY KEY,
  FechaHoraEntrada        DATETIME,
  FechaHoraSalida         DATETIME,
  HorasTrabajadas         INT,
  IdTrabajo               INT,
  IdUsuario               INT,
  GeolocalizacionLatitud  FLOAT,
  GeolocalizacionLongitud FLOAT
);

CREATE TABLE apikey (
  idKey INT AUTO_INCREMENT PRIMARY KEY,
  `Key` VARCHAR(50) NOT NULL
);
```

> **Nota sobre contraseñas y administrador:** el servicio guarda las claves con bcrypt, así que las filas creadas a mano con texto plano no podrán iniciar sesión. Crea el primer administrador a través de `POST /usuarios` (la app lo permite solo con sesión de admin, así que conviene insertarlo una vez por SQL con un hash generado) o usa `UPDATE usuarios SET EsAdmin = 1 WHERE Usuario = '...'` sobre un usuario ya creado.

La conexión se configura mediante variables de entorno (ver `backend/utils/db.js`), o con los valores por defecto: host `localhost`, puerto `3306`, usuario `root`, sin contraseña, base `api_dism`.

### 2. Backend

```bash
cd backend
npm install
npm start
```

- API: `http://localhost:8080/v1`
- Documentación interactiva (Swagger UI): `http://localhost:8080/api-docs`

Variables de entorno (opcionales en desarrollo):

| Variable | Uso | Por defecto |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL | `localhost`, `3306`, `root`, vacía, `api_dism` |
| `SESSION_SECRET` | Secreto de la cookie de sesión | Valor fijo de desarrollo (**obligatorio en producción**) |
| `APP_ORIGIN` | Origen extra permitido por CORS | Solo `localhost` / `127.0.0.1` |

En PowerShell:

```powershell
$env:SESSION_SECRET="clave-segura"
$env:APP_ORIGIN="http://localhost:8100"
npm start
```

### 3. AppAdmin

```bash
cd AppAdmin
npm install
npm start -- --port 8100
```

Se abre en `http://localhost:8100`. Solo pueden entrar usuarios con `EsAdmin = 1`. La URL del backend está en `AppAdmin/src/app/services/api.ts`.

### 4. AppUsuarios

```bash
cd AppUsuarios
npm install
npm start -- --port 8101
```

Se abre en `http://localhost:8101`.

Para que el registro de fichaje funcione, el navegador debe conceder el permiso de geolocalización.

> ⚠️ Arranca **primero** MySQL y el backend; si no, las apps mostrarán errores de conexión.

## 🔐 Autenticación

- El login (`POST /login`) valida el usuario y la contraseña contra la tabla `usuarios` y crea una **sesión** en el servidor (cookie `connect.sid`, `httpOnly`).
- Todas las peticiones del frontend van con `withCredentials: true`.
- Permisos por rol:
  - **Administradores:** usuarios, trabajos y consulta de fichajes de cualquier usuario.
  - **Usuarios normales:** fichar entrada/salida, consultar sus propios fichajes y la lista de trabajos.
- AppAdmin rechaza el acceso a quien no sea administrador.

## 🔌 Endpoints de la API

Base: `http://localhost:8080/v1`

| Recurso | Método | Ruta | Descripción | Acceso |
|---|---|---|---|---|
| Sesión | `POST` | `/login` | Iniciar sesión | Público |
| | `GET` | `/session` | Usuario de la sesión actual (o `null`) | Público |
| | `POST` | `/logout` | Cerrar sesión | Sesión |
| Usuarios | `GET` | `/usuarios` | Listar usuarios | Admin |
| | `POST` | `/usuarios` | Crear usuario | Admin |
| | `GET` | `/usuarios/{id}` | Obtener usuario | Admin |
| | `PUT` | `/usuarios/{id}` | Actualizar usuario | Admin |
| | `DELETE` | `/usuarios/{id}` | Borrar usuario | Admin |
| Trabajos | `GET` | `/trabajos` | Listar trabajos | Sesión |
| | `POST` | `/trabajos` | Crear trabajo | Admin |
| | `GET` | `/trabajos/{id}` | Obtener trabajo | Sesión |
| | `PUT` | `/trabajos/{id}` | Actualizar trabajo | Admin |
| | `DELETE` | `/trabajos/{id}` | Borrar trabajo | Admin |
| Fichajes | `GET` | `/fichajes?idUsuario=&fechaInicio=&fechaFin=` | Listar fichajes con filtros opcionales | Sesión (no admin: solo los propios) |
| | `POST` | `/fichajes` | Registrar entrada con geolocalización | Sesión |
| | `PUT` | `/fichajes/{id}` | Cerrar fichaje (fecha-hora de salida) | Sesión (propio) |
| | `GET` | `/fichajes/activo` | Fichaje abierto del usuario (últimas 12 h) | Sesión |
| ApiKey | `GET` | `/apikey` | Consultar las claves existentes | Admin |

El contrato completo está en [`backend/api/openapi.yaml`](backend/api/openapi.yaml).

## 📱 AppAdmin

Panel de administración con menú lateral y página de inicio con métricas.

| Página | Funcionalidad |
|---|---|
| **Inicio** | Estado del backend, contadores (usuarios, trabajos, fichajes en curso) y accesos rápidos |
| **Gestión de Usuarios** | Listado y CRUD de usuarios |
| **Gestión de Trabajos** | Listado y CRUD de trabajos |
| **Gestión de Fichajes** | Listado filtrable por usuario y rango de fechas, con mapa **Leaflet/OpenStreetMap** del punto donde se fichó |

## 📱 AppUsuarios

| Página | Funcionalidad |
|---|---|
| **Login** | Inicio de sesión con usuario y contraseña |
| **Inicio** | Accesos a registro y consulta de fichajes |
| **Registrar fichaje** | Si no hay fichaje abierto, elige un trabajo e inicia la entrada con la geolocalización del dispositivo. Si lo hay, permite finalizarlo |
| **Consulta de fichajes** | Fichajes propios filtrados por fechas (por defecto, sin filtro), con mapa de cada punto de fichaje |

## 🎨 Sistema de colores

Cada módulo tiene un color propio, usado de forma coherente en menú, tarjetas, barras, botones e iconos, y adaptado al **modo claro y oscuro**:

| Módulo | Color |
|---|---|
| Usuarios | 🟣 Morado `#b597df` |
| Trabajos | 🟡 Ámbar `#f7d277` |
| Fichajes | 🟢 Verde azulado `#85d5cc` |

Los colores se definen en `src/theme/variables.scss` de cada app y se usan con `color="usuarios|trabajos|fichajes"` o las clases `text-*` / `bar-*`.

## 🧪 Tests

```bash
# Backend (lint)
cd backend && npx eslint .

# AppAdmin
cd AppAdmin && npm test

# AppUsuarios
cd AppUsuarios && npm run test:unit   # unitarios (Vitest)
cd AppUsuarios && npm run test:e2e    # e2e (Playwright; requiere el servidor de desarrollo)
```

## 🗺️ Estado

- [x] Base de datos y servicios REST (Usuarios, Trabajos, Fichajes, ApiKey)
- [x] AppAdmin: gestión de usuarios, trabajos y fichajes con mapa
- [x] AppUsuarios: login, registro y finalización de fichajes, consulta con mapa
- [x] Login con validación contra la tabla de usuarios *(optativo)*
- [x] Tema coherente claro/oscuro
- [ ] Validación de peticiones mediante **ApiKey** *(optativo, la tabla y el endpoint existen pero no se usan para autorizar)*
- [ ] Versión **PWA** *(optativo)*

## 📦 Entrega

El proyecto se entrega en ZIP por UACloud **sin las carpetas `node_modules`**, junto con una memoria con los pasos de puesta en marcha.

| Entrega | Contenido |
|---|---|
| 1 | AppAdmin, BD, servicios web y aspectos básicos |
| 2 | AppUsuarios y aspectos básicos y optativos de ambas apps |

## 👤 Autor

**Alex Punzano Gil** — Ingeniería Multimedia, Universidad de Alicante
