import { memo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { colorEstado } from "../utils/colorEstado";

/**
 * Leyenda del mapa memoizada
 * Componente estático que no necesita re-renderizarse
 */
function MapLeyendaComponent() {
  const estados = [
    { estado: "disponible" as const, label: "Lote disponible" },
    { estado: "reservado" as const, label: "Lote reservado" },
    { estado: "vendido" as const, label: "Lote vendido" },
    { estado: "area-verde" as const, label: "Área verde" },
  ];

  return (
    <Paper
      sx={{
        position: "absolute",
        top: 72, // colocarla más abajo del botón de admin
        right: 16,
        zIndex: 1000,
        p: 2,
        minWidth: 200,
        bgcolor: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "rgba(148, 163, 184, 0.2)",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontSize: "0.75rem",
          color: "rgba(203, 213, 225, 0.8)",
        }}
      >
        Leyenda
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {estados.map(({ estado, label }) => (
          <Box
            key={estado}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: colorEstado(estado),
                borderRadius: 1,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.875rem",
                color: "rgba(226, 232, 240, 0.95)",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// Componente completamente estático, se memoiza para no re-renderizar nunca
export const MapLeyenda = memo(MapLeyendaComponent);
