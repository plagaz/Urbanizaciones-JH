import type { Lote, Proyecto } from "../lib/supabase";

// Representación de filas en Supabase
export type LoteRow = {
  id: number;
  proyecto_id: string;
  nombre: string;
  estado: Lote["estado"];
  precio: number;
  coords: unknown;
  promotor: string | null;
};

export type ProyectoRow = {
  id: string;
  nombre: string;
  imagen_url: string;
  bounds: Proyecto["bounds"];
  created_at?: string;
};

// Inputs de escritura
export type LoteInsert = Omit<LoteRow, "id"> & { promotor?: string | null };
export type LoteUpdate = Partial<Pick<LoteRow, "estado" | "promotor" | "coords" | "precio" | "nombre">>;
export type ProyectoInsert = Omit<ProyectoRow, "created_at">;
export type ProyectoUpdate = Partial<Omit<ProyectoRow, "id">>;

// Transformadores helpers
export const mapLoteRowToModel = (row: LoteRow): Lote => ({
  id: row.id,
  nombre: row.nombre,
  estado: row.estado,
  precio: row.precio,
  coords: row.coords as Lote["coords"],
  promotor: row.promotor ?? undefined,
  proyecto_id: row.proyecto_id,
});

export const mapProyectoRowToModel = (row: ProyectoRow, lotes: Lote[] = []): Proyecto => ({
  id: row.id,
  nombre: row.nombre,
  imagenUrl: row.imagen_url,
  bounds: row.bounds,
  lotes,
});
