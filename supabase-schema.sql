-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA MAPA-LOTES
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query > Pegar y ejecutar

-- ============================================
-- 1. TABLA: proyectos
-- ============================================
CREATE TABLE IF NOT EXISTS proyectos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  bounds JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. TABLA: lotes
-- ============================================
CREATE TABLE IF NOT EXISTS lotes (
  id BIGSERIAL PRIMARY KEY,
  proyecto_id TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC(12, 2) NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('disponible', 'vendido', 'reservado', 'area-verde')),
  coords JSONB NOT NULL,
  promotor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para mejorar búsquedas por proyecto
CREATE INDEX IF NOT EXISTS idx_lotes_proyecto_id ON lotes(proyecto_id);

-- ============================================
-- 3. TABLA: perfiles (para roles de usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 4. FUNCIÓN: Crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol)
  VALUES (new.id, 'usuario');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 5. FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_proyectos_updated_at ON proyectos;
CREATE TRIGGER update_proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_lotes_updated_at ON lotes;
CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON lotes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: proyectos
-- ============================================

-- Todos pueden leer proyectos (acceso público)
CREATE POLICY "Proyectos son visibles públicamente"
  ON proyectos FOR SELECT
  USING (true);

-- Solo admins pueden insertar proyectos
CREATE POLICY "Solo admins pueden crear proyectos"
  ON proyectos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );

-- Solo admins pueden actualizar proyectos
CREATE POLICY "Solo admins pueden actualizar proyectos"
  ON proyectos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );

-- Solo admins pueden eliminar proyectos
CREATE POLICY "Solo admins pueden eliminar proyectos"
  ON proyectos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: lotes
-- ============================================

-- Todos pueden leer lotes (acceso público)
CREATE POLICY "Lotes son visibles públicamente"
  ON lotes FOR SELECT
  USING (true);

-- Solo admins pueden insertar lotes
CREATE POLICY "Solo admins pueden crear lotes"
  ON lotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );

-- Admins pueden actualizar cualquier lote
-- Usuarios anónimos pueden actualizar solo para reservar (estado y promotor)
CREATE POLICY "Admins pueden actualizar lotes"
  ON lotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );

-- Política adicional: permitir a usuarios anónimos reservar lotes
CREATE POLICY "Usuarios pueden reservar lotes disponibles"
  ON lotes FOR UPDATE
  USING (
    estado = 'disponible' AND
    NOT EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
    )
  )
  WITH CHECK (
    estado = 'reservado' AND
    promotor IS NOT NULL
  );

-- Solo admins pueden eliminar lotes
CREATE POLICY "Solo admins pueden eliminar lotes"
  ON lotes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE perfiles.id = auth.uid()
      AND perfiles.rol = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: perfiles
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil (pero no el rol)
CREATE POLICY "Los usuarios pueden actualizar su perfil"
  ON perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND rol = (SELECT rol FROM perfiles WHERE id = auth.uid()));

-- ============================================
-- 7. BUCKET DE STORAGE PARA PLANOS
-- ============================================
-- Este paso se hace desde el panel de Storage en Supabase:
-- 1. Ve a Storage > Create a new bucket
-- 2. Nombre: "planos"
-- 3. Public bucket: ✅ Sí (para acceso público a las imágenes)
-- 4. Allowed MIME types: image/png, image/jpeg
-- 5. Max file size: 10MB

-- Después de crear el bucket, ejecuta esta política:
-- (Reemplazar 'planos' si usas otro nombre)

-- Nota: Las políticas de Storage se configuran desde el panel de Storage
-- o ejecutando este SQL después de crear el bucket:

-- Permitir a todos leer archivos del bucket planos
-- INSERT INTO storage.policies (name, bucket_id, definition)
-- VALUES (
--   'Public access to planos',
--   'planos',
--   '{"method":"SELECT","table":"objects","check":true}'
-- );

-- Permitir a admins subir archivos al bucket planos
-- (Configurar desde el panel de Storage > Policies)

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas queries para verificar que todo se creó correctamente:

-- SELECT * FROM proyectos;
-- SELECT * FROM lotes;
-- SELECT * FROM perfiles;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
