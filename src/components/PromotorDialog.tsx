import { memo } from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";

interface PromotorDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (promotor: string) => void;
  loteNombre?: string;
}

/**
 * Dialog para asignar promotor memoizado
 * Solo se re-renderiza cuando cambian las props
 */
function PromotorDialogComponent({ open, onClose, onConfirm, loteNombre }: PromotorDialogProps) {
  const [nombre, setNombre] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setNombre("");
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleConfirm = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    onConfirm(limpio);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle>Asignar promotor</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {loteNombre && (
            <Typography variant="body2" color="text.secondary">
              Lote: {loteNombre}
            </Typography>
          )}
          <TextField
            label="Nombre del promotor"
            fullWidth
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); }}
            autoFocus
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!nombre.trim()}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Memoizar el dialog de promotor
export const PromotorDialog = memo(PromotorDialogComponent);
