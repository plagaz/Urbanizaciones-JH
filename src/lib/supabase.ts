import { createClient } from "@supabase/supabase-js";
import { type LatLngExpression } from "leaflet";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Falla rápido si faltan credenciales
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "mapa-lotes-auth",
  },
});

// Tipos exportados para usar en toda la app
export type Lote = {
  id: number;
  nombre: string;
  estado: "disponible" | "vendido" | "reservado" | "area-verde";
  precio: number;
  coords: LatLngExpression[];
  promotor?: string | null;
  proyecto_id?: string;
};

export type Proyecto = {
  id: string;
  nombre: string;
  imagenUrl: string;
  bounds: [[number, number], [number, number]];
  lotes?: Lote[];
};
