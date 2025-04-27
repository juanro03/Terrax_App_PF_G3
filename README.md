
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
.env\Scriptsctivate
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

### Paso 5: Configuración de la Base de Datos

Asegúrate de tener configurada la base de datos en el archivo `settings.py`. Si estás usando una base de datos local (por ejemplo, SQLite), no es necesario hacer nada más. Si usas otra base de datos (como PostgreSQL), ajusta la configuración de `DATABASES` en `settings.py`.

### Paso 6: Ejecutar Migraciones

Aplica las migraciones para configurar las tablas de la base de datos:

```bash
python manage.py migrate
```

### Paso 7: Crear un Superusuario (Opcional)

Si quieres acceder al panel de administración de Django, crea un superusuario:

```bash
python manage.py createsuperuser
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

Instala las dependencias necesarias utilizando `npm` o `yarn`:

- Con **npm**:

```bash
npm install
```

- Con **yarn**:

```bash
yarn install
```

### Paso 3: Configurar la API

Asegúrate de que el frontend esté configurado para apuntar al backend correcto. En el archivo de configuración de tu frontend (`src/config.js` o similar), asegúrate de que la URL de la API esté configurada correctamente. Ejemplo:

```js
const API_URL = "http://127.0.0.1:8000/api";
```

### Paso 4: Ejecutar el Servidor de Desarrollo

Inicia el servidor de desarrollo de React:

- Con **npm**:

```bash
npm start
```

- Con **yarn**:

```bash
yarn start
```

El frontend estará corriendo en `http://localhost:3000/`.

---

## Notas Adicionales

- **Autenticación**: Si el proyecto usa autenticación (por ejemplo, a través de `dj_rest_auth` y `allauth`), asegúrate de seguir los pasos necesarios para configurar correctamente la autenticación y el registro de usuarios en el backend.

- **Configuración de Variables de Entorno**: Si es necesario, asegúrate de configurar las variables de entorno para los secretos de API, bases de datos o cualquier otro servicio de terceros.

- **Manejo de Errores**: Si encuentras errores durante el proceso de configuración, revisa los logs de la consola para detalles adicionales. Si no puedes solucionar el problema, no dudes en abrir un issue en el repositorio.

---

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/mi-nueva-funcionalidad`).
3. Haz los cambios necesarios y haz commit de los mismos (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube tu rama (`git push origin feature/mi-nueva-funcionalidad`).
5. Abre un pull request.

---

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.
