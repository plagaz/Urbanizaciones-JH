import { type Lote } from "../lib/supabase";

export const colorEstado = (estado: Lote["estado"]): string => {
  switch (estado) {
    case "disponible":
      return "green";
    case "vendido":
      return "red";
    case "reservado":
      return "orange";
    case "area-verde":
      return "#04ff04";
    default:
      return "gray";
  }
};
