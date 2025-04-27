
# Terrax App - Proyecto de Gestión de Monitoreo Agrícola

Este proyecto tiene como objetivo la creación de una aplicación web para gestionar el monitoreo de lotes agrícolas, permitiendo el análisis de imágenes satelitales y de drones, la visualización de índices de vegetación y la gestión de usuarios.

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
.\env\Scripts\ctivate
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

- Con **npm**:

```bash
npm install (o npm i)
```

### Paso 4: Ejecutar el Servidor de Desarrollo

Inicia el servidor de desarrollo de React:

- Con **npm**:

```bash
npm start
```

El frontend estará corriendo en `http://localhost:3000/`.

---

