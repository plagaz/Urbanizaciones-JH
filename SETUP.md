# 🗺️ Mapa de Lotes - Sistema de Gestión Inmobiliaria

Sistema web para gestión y visualización de proyectos inmobiliarios con mapas interactivos.

## ✨ Características

- 🗺️ **Visualización de planos** con mapas interactivos (Leaflet)
- 📍 **Gestión de lotes** con estados (disponible, reservado, vendido, área verde)
- 🔐 **Autenticación** para administradores
- 👥 **Reservas sin registro** para usuarios normales
- 🎨 **Interfaz moderna** con Material-UI
- ☁️ **Base de datos en la nube** con Supabase
- 🖼️ **Almacenamiento de imágenes** en Supabase Storage

---

## 🚀 Migración a Supabase - Guía Completa

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Clic en **"New Project"**
4. Completa:
   - **Name**: Mapa-Lotes
   - **Database Password**: (guarda esta contraseña)
   - **Region**: (elige la más cercana)
5. Espera 2-3 minutos mientras se crea el proyecto

### Paso 2: Configurar Variables de Entorno

1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia:
   - **Project URL** 
   - **anon public** key

3. Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Paso 3: Ejecutar Esquema SQL

1. En Supabase, ve a **SQL Editor** (icono de database en el menú lateral)
2. Clic en **"New Query"**
3. Abre el archivo `supabase-schema.sql` de este proyecto
4. Copia todo el contenido y pégalo en el editor
5. Clic en **"Run"** (botón verde abajo a la derecha)
6. Verifica que aparezca: ✅ **"Success. No rows returned"**

### Paso 4: Crear Bucket de Storage

1. En Supabase, ve a **Storage** (icono de carpeta en el menú)
2. Clic en **"Create a new bucket"**
3. Completa:
   - **Name**: `planos`
   - **Public bucket**: ✅ **Activar** (para acceso público)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `image/png, image/jpeg`
4. Clic en **"Create bucket"**

### Paso 5: Subir Imágenes de Planos

1. En Storage, entra al bucket **"planos"**
2. Clic en **"Upload file"**
3. Sube los archivos:
   - `public/plano.png`
   - `public/plano2.png`
4. Para cada imagen subida:
   - Clic en los **3 puntos** (...) al lado del archivo
   - Selecciona **"Get URL"** o **"Copy URL"**
   - Copia la URL completa

### Paso 6: Actualizar URLs en el Script de Migración

1. Abre `src/scripts/seed-database.ts`
2. Encuentra la constante `IMAGEN_URLS` (línea ~23)
3. Reemplaza con las URLs reales:

```typescript
const IMAGEN_URLS = {
  '/plano.png': 'https://tu-proyecto.supabase.co/storage/v1/object/public/planos/plano.png',
  '/plano2.png': 'https://tu-proyecto.supabase.co/storage/v1/object/public/planos/plano2.png',
};
```

### Paso 7: Crear Usuario Administrador

1. En Supabase, ve a **Authentication** > **Users**
2. Clic en **"Add user"** > **"Create new user"**
3. Completa:
   - **Email**: admin@mapadelotes.com (o el que prefieras)
   - **Password**: (tu contraseña segura)
   - **Auto Confirm User**: ✅ **Activar**
4. Clic en **"Create user"**
5. **Copia el UUID del usuario** (primera columna, ej: `a1b2c3d4-...`)

### Paso 8: Asignar Rol de Admin

1. Ve a **SQL Editor** en Supabase
2. Nueva query y ejecuta (reemplaza con el UUID real):

```sql
INSERT INTO perfiles (id, rol)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');
```

3. Verifica ejecutando:

```sql
SELECT * FROM perfiles;
```

Debe aparecer tu usuario con `rol = 'admin'`.

### Paso 9: Ejecutar Migración de Datos

1. Inicia el servidor de desarrollo:

```bash
npm run dev
```

2. Abre la aplicación en el navegador
3. Abre la **Consola del Navegador** (F12 > Console)
4. Escribe y ejecuta:

```javascript
seedDatabase()
```

5. Espera a que termine (verás logs de progreso)
6. Debes ver: ✅ **"¡Migración completada exitosamente!"**

### Paso 10: Verificar que Todo Funciona

1. Recarga la página
2. Deberías ver la lista de proyectos
3. Selecciona un proyecto
4. Clic en **"Acceso Admin"**
5. Inicia sesión con:
   - **Email**: admin@mapadelotes.com
   - **Contraseña**: (la que creaste)
6. Si entras, ¡todo está funcionando! 🎉

---

## 🛠️ Desarrollo Local

### Instalar Dependencias

```bash
npm install
```

### Iniciar Servidor

```bash
npm run dev
```

### Compilar para Producción

```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes de React
│   ├── AppContent.tsx   # Contenido principal con React Query
│   ├── LoteMap.tsx      # Mapa interactivo con Leaflet
│   ├── LoteDialog.tsx   # Modal de información de lote
│   ├── AdminNavBar.tsx  # Barra lateral de administración
│   └── ...
├── services/            # Servicios de API
│   ├── auth.service.ts       # Autenticación
│   ├── proyectos.service.ts  # CRUD de proyectos
│   └── lotes.service.ts      # CRUD de lotes
├── lib/                 # Configuración
│   ├── supabase.ts      # Cliente de Supabase
│   └── queryClient.ts   # React Query
├── scripts/             # Scripts de utilidad
│   └── seed-database.ts # Migración de datos
└── utils/               # Utilidades
    └── colorEstado.ts   # Colores por estado
```

---

## 🔑 Funcionalidades por Rol

### Usuario Normal (Sin autenticación)
- ✅ Ver proyectos y lotes
- ✅ Reservar lotes disponibles (asignando promotor)
- ❌ No puede editar, eliminar o cambiar estados

### Administrador
- ✅ Todo lo del usuario normal +
- ✅ Crear, editar y eliminar lotes
- ✅ Crear y eliminar proyectos
- ✅ Cambiar estados de lotes (disponible/vendido)
- ✅ Ver información de promotores
- ✅ Dibujar polígonos en el mapa

---

## 🗄️ Esquema de Base de Datos

### Tabla: `proyectos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text (PK) | ID único del proyecto |
| nombre | text | Nombre de la urbanización |
| imagen_url | text | URL de la imagen del plano |
| bounds | jsonb | Límites del mapa [[x1,y1],[x2,y2]] |

### Tabla: `lotes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigserial (PK) | ID auto-incrementable |
| proyecto_id | text (FK) | Referencia al proyecto |
| nombre | text | Nombre del lote |
| precio | numeric | Precio en bolivianos |
| estado | text | disponible/reservado/vendido/area-verde |
| coords | jsonb | Coordenadas del polígono |
| promotor | text (nullable) | Nombre del promotor (si está reservado) |

### Tabla: `perfiles`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid (PK, FK) | ID del usuario (auth.users) |
| rol | text | usuario o admin |

---

## 🔒 Seguridad (Row Level Security)

- **Lectura**: Todos los proyectos y lotes son públicos
- **Escritura**: Solo usuarios con `rol='admin'` pueden:
  - Crear, editar y eliminar proyectos
  - Crear y eliminar lotes
  - Cambiar estados de lotes
- **Reservas**: Usuarios anónimos pueden cambiar lotes de `disponible` a `reservado`

---

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Verifica que has ejecutado el esquema SQL en Supabase

### Error: "No hay proyectos"
- Ejecuta `seedDatabase()` en la consola del navegador
- Verifica que las URLs de las imágenes en `seed-database.ts` son correctas

### Error: "No tienes permisos de administrador"
- Verifica que creaste el perfil con `rol='admin'` en la base de datos
- Ejecuta: `SELECT * FROM perfiles;` para verificar

### Los cambios no se guardan
- Abre la consola del navegador (F12) y busca errores
- Verifica las políticas RLS en Supabase (Settings > Policies)

---

## 📦 Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Material-UI (MUI)
- **Mapas**: Leaflet + React-Leaflet
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: React Query (TanStack Query)

---

## 📝 Notas Importantes

1. **No uses localStorage**: Todos los datos ahora se guardan en Supabase
2. **Imágenes en Storage**: Los planos deben estar en Supabase Storage, no en `/public`
3. **RLS habilitado**: Las políticas de seguridad protegen los datos
4. **IDs auto-increment**: Los lotes usan IDs autogenerados por PostgreSQL

---

## 🤝 Soporte

Si encuentras problemas durante la migración, verifica:
1. ✅ Credenciales correctas en `.env`
2. ✅ Esquema SQL ejecutado sin errores
3. ✅ Bucket "planos" creado y público
4. ✅ Imágenes subidas y URLs actualizadas
5. ✅ Usuario admin creado con perfil

---

## 📄 Licencia

MIT

---

**¡Tu aplicación ahora funciona 100% en la nube! 🚀**
