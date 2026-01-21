import { memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import type { Lote } from "../lib/supabase";

interface LoteDialogProps {
  open: boolean;
  lote: Lote | null;
  isAdmin: boolean;
  onClose: () => void;
  onReservar: (id: number) => void;
  onVender: (id: number) => void;
  onLiberar: (id: number) => void;
  onEliminar: (id: number) => void;
}

/**
 * Dialog de información y acciones del lote memoizado
 * Se re-renderiza solo si cambian las props
 */
function LoteDialogComponent({
  open,
  lote,
  isAdmin,
  onClose,
  onReservar,
  onVender,
  onLiberar,
  onEliminar,
}: LoteDialogProps) {
  if (!lote) return null;

  const getEstadoColor = (estado: Lote["estado"]) => {
    switch (estado) {
      case "disponible":
        return "success";
      case "reservado":
        return "warning";
      case "vendido":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {lote.nombre}
          <Chip label={lote.estado} color={getEstadoColor(lote.estado)} size="small" />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          <strong>Precio:</strong> ${lote.precio.toLocaleString()}
        </Typography>
        {lote.promotor && (
          <Typography variant="body2" color="text.secondary">
            <strong>Promotor:</strong> {lote.promotor}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {isAdmin ? (
          <>
            {lote.estado !== "reservado" && (
              <Button onClick={() => { onReservar(lote.id); }} variant="contained" color="warning">
                Reservar
              </Button>
            )}
            {lote.estado !== "vendido" && (
              <Button onClick={() => { onVender(lote.id); }} variant="contained" color="error">
                Vender
              </Button>
            )}
            {lote.estado !== "disponible" && (
              <Button onClick={() => { onLiberar(lote.id); }} variant="outlined">
                Disponible
              </Button>
            )}
            <Button onClick={() => { onEliminar(lote.id); }} color="error">
              Eliminar
            </Button>
          </>
        ) : (
          <>
            {lote.estado === "disponible" && (
              <Button onClick={() => { onReservar(lote.id); }} variant="contained" color="primary">
                Reservar
              </Button>
            )}
          </>
        )}
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

// Memoizar para evitar re-renders cuando las props no cambian
export const LoteDialog = memo(LoteDialogComponent);