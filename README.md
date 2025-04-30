
# Terrax App - Proyecto de Gestión de Monitoreo Agrícola

Este proyecto tiene como objetivo la creación de una aplicación web para gestionar el monitoreo de lotes agrícolas, permitiendo el análisis de imágenes satelitales y de drones, la visualización de índices de vegetación y la gestión de usuarios.

Integrantes:
- **García, Agustina**
- **Sanchez, Camila**
- **Lorenzo, Matías**
- **Roldán, Juan Pedro**

## Estructura del Proyecto

- **backend/**: Código del servidor API en Django.
- **frontend/**: Código del cliente web en React.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- **Python 3.x**: Para ejecutar el backend.
- **Node.js**: Para ejecutar el frontend.
- **Git**: Para clonar el repositorio.

## Backend

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/terrax-app.git
cd terrax-app/backend
```

### Paso 2: Crear un Entorno Virtual

Es recomendable usar un entorno virtual para instalar las dependencias del proyecto:

```bash
python -m venv venv
```

### Paso 3: Activar el Entorno Virtual

- En Windows:

```bash
venv\Scripts\activate
```
- Si te pide permisos, ejecutar antes:
  
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

- En Mac/Linux:

```bash
source venv/bin/activate
```

### Paso 4: Instalar Dependencias

Instala las dependencias necesarias utilizando `pip`:

```bash
pip install -r requirements.txt
```

### Paso 6: Ejecutar Migraciones

Es necesario tener la Base de Datos Postgresql para poder realizar este paso, para ello:

## 🐘 Crear la base de datos en PostgreSQL

### Opción A - Usando SQL Shell (psql)

1. Abrí la SQL Shell (psql).
2. Cuando te pregunte, presioná Enter para usar los valores por defecto (o escribí el usuario y contraseña si lo configuraste).
3. Ejecutá los siguientes comandos:

```sql
CREATE DATABASE terrax_db;
CREATE USER terrax_user WITH PASSWORD 'terrax_pass';
ALTER ROLE terrax_user SET client_encoding TO 'UTF8';
ALTER ROLE terrax_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE terrax_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE terrax_db TO terrax_user;
```

### Opción B - Usando pgAdmin 4

- Abrí pgAdmin 4.
- Conectate a tu servidor PostgreSQL.
- Click derecho sobre "Databases" → Create → Database:
- Name: terrax_db
- Owner: terrax_user (o crealo si no existe)

### Configurar Django para usar PostgreSQL
Abrí el archivo backend/terrax_app/settings.py.

Asegurarse que la configuración de la base de datos en el archivo settings.py sea:

```bash
SITE_ID = 1
AUTHENTICATION_BACKENDS = (
    'allauth.account.auth_backends.AuthenticationBackend',  
    'django.contrib.auth.backends.ModelBackend',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'terrax_db',
        'USER': 'postgres',
        'PASSWORD': 'admin',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Aplica las migraciones para configurar las tablas de la base de datos:

```bash
python manage.py migrate
```

### Paso 8: Ejecutar el Servidor

Levanta el servidor de desarrollo:

```bash
python manage.py runserver
```

El backend estará corriendo en `http://127.0.0.1:8000/`.


---

## Frontend

### Paso 1: Clonar el Repositorio

En el directorio principal, navega al directorio `frontend`:

```bash
cd ../frontend
```

### Paso 2: Instalar Dependencias

Instala las dependencias necesarias utilizando `npm`:

```bash
npm install (o npm i)
```

### Paso 4: Ejecutar el Servidor de Desarrollo

Inicia el servidor de desarrollo de React:

```bash
npm start
```

El frontend estará corriendo en `http://localhost:3000/`.

---

