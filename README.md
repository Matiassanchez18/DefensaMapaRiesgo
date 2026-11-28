# Mapa de Riesgo

**Aplicación web de seguridad ciudadana para Tucumán.**

Mapa de Riesgo permite reportar hechos delictivos, visualizar incidentes y zonas de riesgo en un mapa interactivo, localizar comisarías y gestionar contactos de emergencia. Además, cuenta con un panel de administración para gestionar la información del sistema.

---

## Características principales

-  **Autenticación:** registro e inicio de sesión con contraseñas protegidas mediante bcrypt y autenticación JWT con expiración de 24 horas.
-  **Carga de reportes:** permite registrar hechos delictivos indicando su ubicación mediante GPS o selección manual en el mapa.
-  **Testigos:** posibilidad de incorporar información de testigos al realizar un reporte.
-  **Mapa interactivo:** visualización de reportes, zonas de riesgo y comisarías de Tucumán.
-  **Contactos de emergencia:** gestión de contactos personales asociados a cada usuario.
-  **Panel de administración:** dashboard y administración de reportes, usuarios, mapa y testigos. Acceso restringido a usuarios con rol `admin`.

## Tecnologías utilizadas

| Parte | Tecnologías |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS 4, Bootstrap 5, Bootstrap Icons, Leaflet, React-Leaflet, Zustand, Recharts , sweetalert2|
| **Backend** | Node.js, Express 5, mysql2, bcrypt, jsonwebtoken, Zod, dotenv, cors |
| **Base de datos** | MySQL 8 |

##  Requisitos previos

Antes de instalar el proyecto, asegurate de tener las siguientes herramientas:

| Herramienta | Versión | Utilidad |
|---|---|---|
| Node.js | 20.19+ o 22.13+ (probado con 22) | Ejecutar frontend y backend |
| npm | Incluido con Node.js | Instalar dependencias |
| MySQL Server | 8.0+ | Base de datos |
| MySQL Workbench | Opcional | Administrar e importar la base |
| Git | Cualquiera | Clonar el repositorio |

**También se necesita:**
- Conexión a internet para cargar los mapas desde OpenStreetMap.
- Permitir el acceso a la ubicación del navegador para utilizar el GPS.

---

## Estructura del proyecto

```text
DefensaMapaRiesgo/
└── MapaRiesgo/
    ├── Backend/
    │   ├── Config/             # Conexión a MySQL
    │   ├── Controllers/        # Lógica de cada recurso
    │   ├── MiddleWare/         # Autenticación y validaciones
    │   ├── Routes/             # Rutas de la API
    │   ├── Scripts/            # Scripts de carga y migración
    │   ├── Utils/              # Generación de tokens
    │   └── Index.js            # Punto de entrada del servidor
    │
    └── Frontend/
        └── src/
            ├── components/     # Componentes reutilizables
            ├── pages/          # Páginas de la aplicación
            ├── store/          # Estado global con Zustand
            └── style/          # Hojas de estilo
```

---

# Instalación y ejecución

## 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd DefensaMapaRiesgo/MapaRiesgo
```

## 2. Configurar la base de datos

El archivo `mapadriesgodb.sql` crea la base de datos `mapaderiesgo`, sus tablas y los datos iniciales.

> **Importante:** si la base de datos ya existe, el script elimina y vuelve a crear las tablas. Realizá una copia de seguridad antes de ejecutarlo si tenés información que quieras conservar.

### Opción A: MySQL Workbench

1. Abrir MySQL Workbench.
2. Ir a **Server → Data Import**.
3. Seleccionar **Import from Self-Contained File**.
4. Elegir `mapadriesgodb.sql`.
5. Ejecutar la importación.

### Opción B: Consola CMD o Git Bash

```bash
mysql -u root -p < mapadriesgodb.sql
```

### Opción C: PowerShell

En PowerShell, el operador `<` no funciona como redirección de entrada para este comando. Utilizá:

```powershell
mysql -u root -p -e "source C:/ruta/al/archivo/mapadriesgodb.sql"
```

### Verificar la importación

```sql
USE mapaderiesgo;
SHOW TABLES;
```

Deben aparecer las siguientes tablas:

- `comisaria`
- `contacto_emergencia`
- `criminales_buscados`
- `delito`
- `estadistica`
- `reporte`
- `testigo`
- `usuario`
- `zona`

## 3. Configurar e iniciar el Backend

Ingresar a la carpeta:

```bash
cd Backend
```

Instalar las dependencias:

```bash
npm install
```

### a) Configurar la conexión a MySQL

Abrir `Backend/Config/db.js` y completar las credenciales de MySQL local:

```javascript
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "TU_CONTRASEÑA",
  database: "mapaderiesgo",
  // ...
});
```

> No subas las credenciales de MySQL al repositorio. Antes de realizar un commit, revisá los cambios con `git diff Config/db.js`.

### b) Configurar las variables de entorno

Crear un archivo `.env` dentro de `Backend/`, al mismo nivel que `Index.js`:

```env
JWT_SECRET=una_clave_larga_y_aleatoria
```

Podés generar una clave segura ejecutando:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Importante:** el archivo `.env` no se sube a Git. Cada integrante debe crear el suyo. Sin `JWT_SECRET`, el servidor no podrá iniciar correctamente.

### c) Iniciar el servidor

```bash
node Index.js
```

Para iniciar el servidor con reinicio automático al guardar cambios:

```bash
npx nodemon Index.js
```

El backend debe mostrar un mensaje indicando que está funcionando en el puerto **3000**.

> ℹEl script `npm run dev` ejecuta `node index.js` (con la `i` minúscula). En Windows puede funcionar, pero en Linux y macOS puede fallar por diferencias entre mayúsculas y minúsculas. Por eso se recomienda utilizar los comandos anteriores.

## 4. Configurar e iniciar el Frontend

Abrir otra terminal, sin cerrar la del backend:

```bash
cd Frontend
npm install
npm run dev
```

Vite mostrará la dirección local de la aplicación. Normalmente:

```text
http://localhost:5173/
```

## 5. Comprobar el funcionamiento

Una vez iniciados ambos servidores:

| Dirección | Resultado esperado |
|---|---|
| `http://localhost:3000/api/reportes` | Devuelve un JSON con los reportes |
| `http://localhost:5173/` | Carga la aplicación web |
| `http://localhost:5173/login` | Permite iniciar sesión |

Para probar el sistema:

1. Registrarse o iniciar sesión.
2. Ingresar a `/denuncia`.
3. Completar los datos del hecho.
4. Seleccionar una ubicación mediante GPS o el mapa.
5. Enviar el reporte.
6. Comprobar que el nuevo reporte aparece en el mapa.

---

# Configuración del sistema

| Configuración | Ubicación | Valor |
|---|---|---|
| Usuario MySQL | `Backend/Config/db.js` | `root` |
| Contraseña MySQL | `Backend/Config/db.js` | Contraseña local |
| Base de datos | `Backend/Config/db.js` | `mapaderiesgo` |
| Clave JWT | `Backend/.env` | `JWT_SECRET` |
| Puerto Backend | `Backend/Index.js` | `3000` |
| Puerto Frontend | Vite | `5173` |
| URL de la API | Componentes del frontend | `http://localhost:3000` |

## Usuarios y roles

Los usuarios nuevos se registran desde:

```text
/register
```

Por defecto, se crean con el rol `usuario`.

Para habilitar el acceso al panel de administración, se debe cambiar el rol de un usuario desde MySQL:

```sql
UPDATE mapaderiesgo.usuario
SET rol = 'admin'
WHERE email = 'tu_correo@ejemplo.com';
```

Después de modificar el rol, el usuario debe cerrar sesión e iniciar sesión nuevamente para obtener un token con el rol actualizado.

**Seguridad de contraseñas:**

Las contraseñas se almacenan utilizando bcrypt. Si se importa una base de datos antigua que contiene contraseñas en texto plano, es necesario ejecutar el script de migración antes de iniciar sesión:

```bash
cd Backend
node Scripts/hashearContrasenas.js
```

---

# Datos de ejemplo (opcional)

Dentro de `Backend/Scripts/` se encuentran scripts para cargar información de prueba.

Los scripts están preparados para ejecutarse más de una vez sin duplicar filas.

| Script | Descripción |
|---|---|
| `importarComisarias.js` | Importa comisarías de Tucumán desde OpenStreetMap. Requiere internet. |
| `01_cargar_delito.sql` | Agrega 50 tipos de delitos de ejemplo. |
| `02_cargar_comisaria.sql` | Agrega 50 comisarías y puestos policiales de ejemplo. |
| `03_cargar_contacto_emergencia.sql` | Agrega 50 contactos de emergencia distribuidos entre los primeros usuarios. Requiere al menos un usuario registrado. |

### Importar comisarías desde OpenStreetMap

Desde la carpeta `Backend`:

```bash
node Scripts/importarComisarias.js
```

### Ejecutar scripts SQL

**MySQL Workbench:**
1. Ir a **File → Open SQL Script**.
2. Seleccionar el archivo correspondiente.
3. Ejecutar con el botón del rayo.

**Consola:**

```bash
mysql -u root -p -e "source RUTA/ARCHIVO.sql"
```

> ℹ Los datos incluidos en los scripts SQL son ficticios y se utilizan exclusivamente para pruebas y demostraciones.

---

# API REST

Las rutas que requieren autenticación esperan el siguiente encabezado HTTP:

```http
Authorization: Bearer <token>
```

El token es devuelto por los endpoints `POST /api/login` y `POST /api/register`.

## Autenticación

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/register` | Registra un usuario y devuelve un token. | Público |
| POST | `/api/login` | Inicia sesión y devuelve usuario y token. | Público |

## Reportes

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/reportes` | Lista todos los reportes. | Público |
| GET | `/api/reportes/ultimo` | Obtiene el último reporte cargado. | Público |
| GET | `/api/reportes/dashboard` | Obtiene los datos del panel de administración. | Sin autenticación por ahora |
| POST | `/api/reportes` | Crea un reporte. El usuario se obtiene del JWT. | Token |
| PUT | `/api/reportes/:id` | Actualiza la descripción y el estado. | Sin autenticación por ahora |
| DELETE | `/api/reportes/:id` | Elimina un reporte. | Sin autenticación por ahora |

## Otros recursos

| Endpoint | Descripción | Acceso |
|---|---|---|
| `/api/comisarias` | Lista las comisarías. | Público |
| `/api/estadisticas` | Devuelve estadísticas por zona y delito. | Público |
| `/api/contactos-emergencia` | Alta, consulta, edición y baja de contactos. | Sin autenticación por ahora |
| `/api/usuarios` | Alta, consulta, edición y baja de usuarios. | Sin autenticación por ahora |
| `/api/testigos` | Alta, consulta, edición y baja de testigos. | Token y rol `admin` |

> **Nota de seguridad:** los endpoints indicados como "Sin autenticación por ahora" no cuentan actualmente con protección de acceso según la configuración documentada. No deben considerarse seguros para un entorno de producción hasta incorporar las validaciones y autorizaciones correspondientes.

---

# Páginas del Frontend

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/mapa` | Mapa de riesgo |
| `/denuncia` | Carga de reportes |
| `/reporte` | Carga de reportes |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuarios |
| `/admin` | Dashboard de administración |
| `/admin/reportes` | Administración de reportes |
| `/admin/mapa` | Mapa del panel de administración |
| `/admin/usuarios` | Administración de usuarios |
| `/admin/crudTestigos` | Administración de testigos |

---

# Scripts disponibles

### Backend

| Comando | Descripción |
|---|---|
| `node Index.js` | Inicia el servidor. |
| `npx nodemon Index.js` | Inicia el servidor con reinicio automático. |

### Frontend

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Ejecuta una vista previa de producción. |
| `npm run lint` | Analiza el código con ESLint. |

---

# Solución de problemas

| Problema | Causa posible y solución |
|---|---|
| Falta `JWT_SECRET` al iniciar el backend. | Crear el archivo `Backend/.env` al lado de `Index.js` y configurar la variable. |
| `Cannot find module '...'` | Ejecutar `npm install` en la carpeta correspondiente y verificar nombres y rutas de archivos. |
| `'vite' no se reconoce como un comando` | Ejecutar `npm install` dentro de `Frontend`. |
| `Access denied for user` | Revisar usuario y contraseña en `Backend/Config/db.js`. |
| `ECONNREFUSED` o `Unknown database` | Comprobar que MySQL esté encendido y que se haya importado la base de datos. |
| `EADDRINUSE` en el puerto 3000 | Otro proceso está utilizando el puerto. Cerrar el proceso o liberar el puerto. |
| Error de correo o contraseña con credenciales correctas. | Verificar si la base tiene contraseñas en texto plano o con un formato anterior. Ejecutar el script de migración si corresponde. |
| `401` al cargar un reporte. | No hay sesión iniciada o el token venció. Volver a iniciar sesión. |
| El panel `/admin` no abre. | Verificar que el usuario tenga el rol `admin` y vuelva a iniciar sesión. |
| El mapa aparece en blanco. | Comprobar la conexión a internet y la carga de los mapas desde OpenStreetMap. |
| El GPS no funciona. | Permitir el acceso a la ubicación desde la configuración del navegador. |

---

## Mapa de Riesgo — Seguridad ciudadana

**Una herramienta para visualizar información, reportar incidentes y facilitar el acceso a recursos de seguridad en Tucumán.**

Desarrollado como proyecto académico de la Tecnicatura en Programación de la Universidad Tecnológica Nacional (UTN).
