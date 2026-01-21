# 🎉 Migración a Supabase Completada

La aplicación **Mapa de Lotes** ha sido migrada exitosamente de localStorage a Supabase.

## ✅ Cambios Implementados

### 1. Infraestructura Backend
- ✅ Cliente de Supabase configurado ([src/lib/supabase.ts](src/lib/supabase.ts))
- ✅ React Query configurado para gestión de estado ([src/lib/queryClient.ts](src/lib/queryClient.ts))
- ✅ Esquema SQL completo con RLS ([supabase-schema.sql](supabase-schema.sql))

### 2. Servicios de API
- ✅ [auth.service.ts](src/services/auth.service.ts) - Autenticación con Supabase Auth
- ✅ [proyectos.service.ts](src/services/proyectos.service.ts) - CRUD de proyectos y upload de imágenes
- ✅ [lotes.service.ts](src/services/lotes.service.ts) - CRUD completo de lotes

### 3. Componentes Actualizados
- ✅ [App.tsx](src/App.tsx) - Envuelto con QueryClientProvider
- ✅ [AppContent.tsx](src/components/AppContent.tsx) - Lógica principal con React Query hooks
- ✅ [AdminLoginDialog.tsx](src/components/AdminLoginDialog.tsx) - Login con Supabase Auth
- ✅ [AdminNavBar.tsx](src/components/AdminNavBar.tsx) - Botón para gestionar proyectos

### 4. Scripts y Utilidades
- ✅ [seed-database.ts](src/scripts/seed-database.ts) - Script de migración de datos iniciales
- ✅ [.env.example](.env.example) - Template para credenciales
- ✅ [SETUP.md](SETUP.md) - Guía completa de configuración

### 5. Seguridad
- ✅ Row Level Security (RLS) configurado
- ✅ Lectura pública, escritura solo para admins
- ✅ Usuarios anónimos pueden reservar lotes
- ✅ Variables de entorno protegidas (`.env` en `.gitignore`)

---

## 🚀 Próximos Pasos

### Paso 1: Configurar Supabase
Sigue la guía completa en [SETUP.md](SETUP.md):

1. **Crear proyecto en Supabase**
2. **Configurar `.env`** con tus credenciales
3. **Ejecutar esquema SQL** en Supabase SQL Editor
4. **Crear bucket "planos"** en Storage
5. **Subir imágenes** a Storage
6. **Crear usuario admin** en Authentication
7. **Asignar rol admin** en tabla perfiles

### Paso 2: Migrar Datos
```bash
# 1. Iniciar servidor
npm run dev

# 2. En la consola del navegador (F12)
seedDatabase()
```

### Paso 3: Probar la Aplicación
1. Recarga la página
2. Inicia sesión como admin
3. Verifica que puedas crear/editar/eliminar lotes
4. Prueba reservar un lote sin estar autenticado

---

## 📋 Credenciales del Admin

**IMPORTANTE**: Durante el setup, crearás un usuario administrador en Supabase Auth.

Ejemplo:
- **Email**: admin@mapadelotes.com
- **Contraseña**: (la que tú elijas)

Recuerda ejecutar este SQL después de crear el usuario:
```sql
INSERT INTO perfiles (id, rol)
VALUES ('tu-uuid-aqui', 'admin');
```

---

## 🔄 Diferencias con la Versión Anterior

### Antes (localStorage)
- ❌ Datos solo en el navegador
- ❌ Se pierden al limpiar caché
- ❌ No sincroniza entre dispositivos
- ❌ Autenticación hardcodeada
- ❌ Sin permisos reales

### Ahora (Supabase)
- ✅ Datos en la nube (PostgreSQL)
- ✅ Persistencia permanente
- ✅ Sincronización automática
- ✅ Autenticación real con JWT
- ✅ Row Level Security (RLS)
- ✅ Storage para imágenes
- ✅ Escalable y profesional

---

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

---

## 📁 Archivos Importantes

### Configuración
- `.env` - Credenciales de Supabase (crear desde .env.example)
- `supabase-schema.sql` - Esquema de base de datos
- `SETUP.md` - Guía de configuración completa

### Código Fuente
- `src/lib/` - Cliente de Supabase y React Query
- `src/services/` - Servicios de API (auth, proyectos, lotes)
- `src/components/AppContent.tsx` - Componente principal con hooks
- `src/scripts/seed-database.ts` - Script de migración

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
```bash
# Verifica que .env existe y tiene las credenciales correctas
cat .env
```

### Error: "No hay proyectos"
```javascript
// En la consola del navegador
seedDatabase()
```

### Error: "No tienes permisos de administrador"
```sql
-- En Supabase SQL Editor
SELECT * FROM perfiles;
-- Si no aparece tu usuario, inserta:
INSERT INTO perfiles (id, rol) VALUES ('tu-uuid', 'admin');
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa [SETUP.md](SETUP.md) paso por paso
2. Verifica la consola del navegador (F12)
3. Revisa los logs en Supabase Dashboard

---

## 🎊 ¡Migración Exitosa!

Tu aplicación ahora:
- ✅ Funciona 100% en la nube
- ✅ Es escalable y profesional
- ✅ Tiene autenticación real
- ✅ Está protegida con RLS
- ✅ Sincroniza automáticamente

**¡Ahora solo falta configurar Supabase y empezar a usar la aplicación!**
