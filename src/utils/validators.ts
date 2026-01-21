import { z, type ZodRawShape, type ZodType } from 'zod';

/**
 * Esquema de validación para crear/editar un lote
 * 
 * Valida:
 * - nombre: string requerido, 2-100 caracteres, se limpia espacios
 * - precio: acepta number o string numérico, debe ser positivo, se convierte a float
 * - estado: enum con valores permitidos (disponible, reservado, vendido, area-verde)
 * - promotor: string opcional, nombre del vendedor asignado
 * - coords: array de coordenadas [lat, lng] opcional, para el polígono del lote
 */
export const LoteSchema = z.object({
  // Nombre del lote: obligatorio, entre 2 y 100 caracteres
  nombre: z.string()
    .min(1, 'El nombre del lote es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  
  // Precio: acepta number o string, convierte a float, valida que sea positivo
  precio: z.number()
    .positive('El precio debe ser un número positivo')
    .or(z.string()
      .regex(/^\d+(\.\d+)?$/, 'El precio debe ser un número válido')
      .transform((val) => parseFloat(val))
      .refine((val) => val > 0, 'El precio debe ser un número positivo')
    ),
  
  // Estado del lote: solo acepta valores predefinidos
  estado: z.enum(['disponible', 'reservado', 'vendido', 'area-verde']),
  
  // Promotor: opcional, solo se usa cuando estado = 'reservado'
  promotor: z.string().optional(),
  
  // Coordenadas del polígono: array de [lat, lng], opcional al crear
  coords: z.array(z.array(z.number())).optional(),
});

export type LoteFormData = z.infer<typeof LoteSchema>;

/**
 * Esquema de validación para crear/editar un proyecto
 * 
 * Valida:
 * - nombre: string requerido, 2-150 caracteres
 * - imagenUrl: URL válida del plano/mapa del proyecto
 * - bounds: coordenadas de límites del mapa (lat1,lng1 = esquina inferior, lat2,lng2 = esquina superior)
 *   Valida que sean coordenadas geográficas válidas y que no sean idénticas
 */
export const ProyectoSchema = z.object({
  // Nombre del proyecto: obligatorio, entre 2 y 150 caracteres
  nombre: z.string()
    .min(1, 'El nombre del proyecto es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),
  
  // URL de la imagen del plano: debe ser una URL válida (http/https)
  imagenUrl: z.string()
    .min(1, 'La URL de la imagen es requerida')
    .trim()
    .pipe(z.url({ message: 'La URL de la imagen debe ser válida' })),
  
  // Límites del mapa para Leaflet (se permite usar coordenadas en píxeles con CRS.Simple)
  // lat1, lng1: esquina inferior izquierda
  // lat2, lng2: esquina superior derecha
  bounds: z.object({
    lat1: z.number().min(-1_000_000, 'Lat Min fuera de rango').max(1_000_000, 'Lat Min fuera de rango'),
    lng1: z.number().min(-1_000_000, 'Lng Min fuera de rango').max(1_000_000, 'Lng Min fuera de rango'),
    lat2: z.number().min(-1_000_000, 'Lat Max fuera de rango').max(1_000_000, 'Lat Max fuera de rango'),
    lng2: z.number().min(-1_000_000, 'Lng Max fuera de rango').max(1_000_000, 'Lng Max fuera de rango'),
  }).refine(
    // Validación custom: evitar bounds vacíos o invertidos
    (b) => b.lat2 > b.lat1 && b.lng2 > b.lng1,
    'Lat Max debe ser mayor a Lat Min y Lng Max mayor a Lng Min'
  ),
});

export type ProyectoFormData = z.infer<typeof ProyectoSchema>;

/**
 * Esquema de validación para login de admin
 * 
 * Valida:
 * - email: string requerido, se convierte a minúsculas automáticamente
 * - password: string requerido, mínimo 6 caracteres
 * 
 * Nota: No valida formato de email para permitir mayor flexibilidad.
 * La autenticación real se hace contra Supabase que valida el formato.
 */
export const AdminLoginSchema = z.object({
  // Email: obligatorio, se normaliza a minúsculas para consistencia
  email: z.string()
    .min(1, 'El email es requerido')
    .toLowerCase() // Normaliza a minúsculas
    .trim(),
  
  // Contraseña: obligatoria, mínimo 6 caracteres
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type AdminLoginFormData = z.infer<typeof AdminLoginSchema>;

/**
 * Esquema para validar dimensiones de imagen
 * 
 * Valida que las imágenes de planos cumplan con requisitos mínimos:
 * - Ancho: 100px - 10,000px
 * - Alto: 100px - 10,000px
 * - Tamaño: máximo 5MB
 */
export const ImageValidationSchema = z.object({
  // Ancho de la imagen en píxeles
  width: z.number().min(100, 'El ancho mínimo es 100px').max(10000, 'El ancho máximo es 10000px'),
  
  // Alto de la imagen en píxeles
  height: z.number().min(100, 'El alto mínimo es 100px').max(10000, 'El alto máximo es 10000px'),
  
  // Tamaño del archivo en bytes (5MB = 5 * 1024 * 1024)
  size: z.number().max(5 * 1024 * 1024, 'El archivo no debe exceder 5MB'),
});

export type ImageValidation = z.infer<typeof ImageValidationSchema>;

/**
 * Función auxiliar para validar datos de formulario con Zod
 * 
 * @param schema - Esquema de Zod a usar para la validación
 * @param data - Datos a validar (generalmente del formulario)
 * @returns Objeto con:
 *   - valid: true si pasó la validación
 *   - data: datos parseados y transformados (si valid = true)
 *   - errors: objeto con errores por campo { campo: 'mensaje' } (si valid = false)
 * 
 * @example
 * const result = validateFormData(LoteSchema, { nombre: 'A1', precio: 5000, estado: 'disponible' });
 * if (result.valid) {
 *   console.log(result.data); // Datos validados y tipados
 * } else {
 *   console.log(result.errors); // { precio: 'Debe ser positivo' }
 * }
 */
export const validateFormData = <T,>(schema: z.ZodType<T>, data: unknown): { valid: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { valid: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.reduce(
        (acc: Record<string, string>, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        },
        {}
      );
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Error de validación desconocido' } };
  }
};

/**
 * Función para validar un campo individual de un formulario
 * 
 * Útil para validación en tiempo real mientras el usuario escribe
 * 
 * @param schema - Esquema Zod del formulario completo
 * @param fieldName - Nombre del campo a validar
 * @param value - Valor actual del campo
 * @returns Objeto con:
 *   - valid: true si el campo es válido
 *   - error: mensaje de error (si valid = false)
 * 
 * @example
 * const result = validateField(LoteSchema, 'nombre', 'A');
 * if (!result.valid) {
 *   setError(result.error); // 'El nombre debe tener al menos 2 caracteres'
 * }
 */
export const validateField = <Shape extends ZodRawShape>(
  schema: z.ZodObject<Shape>,
  fieldName: keyof z.infer<z.ZodObject<Shape>>,
  value: unknown
): { valid: boolean; error?: string } => {
  const fieldSchema = schema.shape[fieldName as string] as ZodType | undefined;
  if (!fieldSchema) return { valid: true };

  const result = fieldSchema.safeParse(value);
  if (result.success) return { valid: true };

  const message = result.error.issues[0]?.message ?? 'Error de validación';
  return { valid: false, error: message };
};
