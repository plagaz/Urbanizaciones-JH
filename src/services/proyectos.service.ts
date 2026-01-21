import { supabase } from "../lib/supabase";
import type { Proyecto } from "../lib/supabase";
import {
  type LoteRow,
  type ProyectoRow,
  type ProyectoInsert,
  type ProyectoUpdate,
  mapLoteRowToModel,
  mapProyectoRowToModel,
} from "./types";

/**
 * Obtener todos los proyectos con sus lotes
 */
export const getProyectos = async (): Promise<Proyecto[]> => {
  try {
    // Obtener proyectos
    const { data: proyectosData, error: proyectosError } = await supabase
      .from('proyectos')
      .select('*')
      .order('created_at', { ascending: true });

    if (proyectosError) {
      console.error('Error al obtener proyectos:', proyectosError);
      throw proyectosError;
    }

    // Obtener todos los lotes
    const { data: lotesData, error: lotesError } = await supabase
      .from('lotes')
      .select('*')
      .order('id', { ascending: true });

    if (lotesError) {
      console.error('Error al obtener lotes:', lotesError);
      throw lotesError;
    }

    // Combinar proyectos con sus lotes
    const proyectosRows = proyectosData as ProyectoRow[];
    const lotesRows = lotesData as LoteRow[];

    const proyectos: Proyecto[] = proyectosRows.map((proyecto) => {
      const lotes = lotesRows
        .filter((lote) => lote.proyecto_id === proyecto.id)
        .map(mapLoteRowToModel);

      return mapProyectoRowToModel(proyecto, lotes);
    });

    return proyectos;
  } catch (error) {
    console.error('Error en getProyectos:', error);
    throw error;
  }
};

/**
 * Crear un nuevo proyecto
 */
export const createProyecto = async (proyecto: Proyecto): Promise<Proyecto> => {
  try {
    const payload: ProyectoInsert = {
      id: proyecto.id,
      nombre: proyecto.nombre,
      imagen_url: proyecto.imagenUrl,
      bounds: proyecto.bounds,
    };

    const { data, error } = await supabase
      .from('proyectos')
      .insert(payload)
      .select()
      .single<ProyectoRow>();

    if (error) {
      console.error('Error al crear proyecto:', error);
      throw error;
    }

    return mapProyectoRowToModel(data, []);
  } catch (error) {
    console.error('Error en createProyecto:', error);
    throw error;
  }
};
/**
 * Actualizar un proyecto
 */
export const updateProyecto = async (
  proyectoId: string,
  updates: Partial<Proyecto>
): Promise<Proyecto> => {
  try {
    const updateData: ProyectoUpdate = {};
    if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
    if (updates.imagenUrl !== undefined) updateData.imagen_url = updates.imagenUrl;
    if (updates.bounds !== undefined) updateData.bounds = updates.bounds;

    const { data, error } = await supabase
      .from('proyectos')
      .update(updateData)
      .eq('id', proyectoId)
      .select()
      .single<ProyectoRow>();

    if (error) throw error;

    return mapProyectoRowToModel(data, []);
  } catch (error) {
    console.error('Error en updateProyecto:', error);
    throw error;
  }
};

/**
 * Eliminar un proyecto (los lotes se eliminan automáticamente por CASCADE)
 */
export const deleteProyecto = async (proyectoId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('proyectos')
      .delete()
      .eq('id', proyectoId);

    if (error) {
      console.error('Error al eliminar proyecto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deleteProyecto:', error);
    throw error;
  }
};

/**
 * Subir imagen de plano a Supabase Storage
 */
export const uploadPlanoImage = async (file: File, proyectoId: string): Promise<string> => {
  try {
    const nameExt = file.name.includes('.') ? file.name.split('.').pop() : undefined;
    const mimeExt = file.type && file.type.includes('/') ? file.type.split('/').pop() : undefined;
    const fileExt = (nameExt || mimeExt || 'bin').toLowerCase();
    const timestamp = String(Date.now());
    const fileName = `${proyectoId}-${timestamp}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('planos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError);
      throw uploadError;
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from('planos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error en uploadPlanoImage:', error);
    throw error;
  }
};
