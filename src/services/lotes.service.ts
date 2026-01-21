import { supabase } from "../lib/supabase";
import type { Lote } from "../lib/supabase";
import {
  type LoteRow,
  type LoteUpdate,
  mapLoteRowToModel,
} from "./types";
import { checkIsAdmin } from "./auth.service";

/**
 * Crear un nuevo lote
 */
export const createLote = async (
  proyectoId: string,
  lote: Omit<Lote, "id">
): Promise<Lote> => {
  try {
    // Verificar autorización de admin
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error('No autorizado: Se requiere rol de administrador');
    }
    const { data, error } = await supabase
      .from("lotes")
      .insert({
        proyecto_id: proyectoId,
        nombre: lote.nombre,
        precio: lote.precio,
        estado: lote.estado,
        coords: lote.coords,
        promotor: lote.promotor ?? null,
      })
      .select()
      .single<LoteRow>();

    if (error) {
      console.error('Error al crear lote:', error);
      throw error;
    }

    return mapLoteRowToModel(data);
  } catch (error) {
    console.error('Error en createLote:', error);
    throw error;
  }
};

/**
 * Actualizar las coordenadas de un lote
 */
export const updateLoteCoords = async (
  loteId: number,
  coords: Lote['coords']
): Promise<void> => {
  try {
    // Verificar autorización de admin
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error('No autorizado: Se requiere rol de administrador');
    }
    const { error } = await supabase
      .from('lotes')
      .update({ coords } satisfies LoteUpdate)
      .eq('id', loteId);

    if (error) {
      console.error('Error al actualizar coordenadas:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en updateLoteCoords:', error);
    throw error;
  }
};

/**
 * Actualizar el estado de un lote
 */
export const updateLoteEstado = async (
  loteId: number,
  estado: Lote['estado'],
  promotor?: string
): Promise<void> => {
  try {
    // Solo exigir admin si NO es reserva
    if (estado !== 'reservado') {
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        throw new Error('No autorizado: Se requiere rol de administrador');
      }
    }
    const updateData: LoteUpdate = { estado };
    if (estado === 'reservado' && promotor) {
      updateData.promotor = promotor;
    } else if (estado !== 'reservado') {
      updateData.promotor = null;
    }
    const { error } = await supabase
      .from('lotes')
      .update(updateData)
      .eq('id', loteId);
    if (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en updateLoteEstado:', error);
    throw error;
  }
};

/**
 * Reservar un lote (cambiar estado a reservado y asignar promotor)
 */
export const reservarLote = async (
  loteId: number,
  promotor: string
): Promise<void> => {
  return updateLoteEstado(loteId, 'reservado', promotor);
};

/**
 * Vender un lote (cambiar estado a vendido)
 */
export const venderLote = async (loteId: number): Promise<void> => {
  return updateLoteEstado(loteId, 'vendido');
};

/**
 * Liberar un lote (cambiar estado a disponible y quitar promotor)
 */
export const liberarLote = async (loteId: number): Promise<void> => {
  return updateLoteEstado(loteId, 'disponible');
};

/**
 * Eliminar un lote
 */
export const deleteLote = async (loteId: number): Promise<void> => {
  try {
    // Verificar autorización de admin
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error('No autorizado: Se requiere rol de administrador');
    }
    const { error } = await supabase
      .from('lotes')
      .delete()
      .eq('id', loteId);

    if (error) {
      console.error('Error al eliminar lote:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deleteLote:', error);
    throw error;
  }
};
