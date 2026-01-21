import { memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { useState, useEffect } from "react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { LoteSchema, validateFormData } from "../utils/validators";
import { useNotification } from "../contexts/NotificationContext";

interface NewLoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (nombre: string, precio: number) => void;
}

/**
 * Dialog para crear nuevo lote memoizado
 * Se re-renderiza solo cuando cambian las props
 */
function NewLoteDialogComponent({ open, onClose, onSave }: NewLoteDialogProps) {
  const { showError, showSuccess } = useNotification();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setNombre("");
      setPrecio("");
      setError("");
      setShowSuccessMessage(false);
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    setError("");

    // Validar con Zod
    const validation = validateFormData(LoteSchema, {
      nombre: nombre.trim(),
      precio: precio ? parseFloat(precio) : 0,
      estado: 'disponible',
    });

    if (!validation.valid) {
      const errorMessage = Object.values(validation.errors || {})[0] || 'Error de validación';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    onSave(nombre.trim(), parseFloat(precio));
    
    // Mostrar notificación de éxito
    setShowSuccessMessage(true);
    showSuccess("Lote creado exitosamente");
    
    setNombre("");
    setPrecio("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle>Nuevo Lote</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nombre del lote"
            fullWidth
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); }}
            placeholder="Ej: Lote A1"
            autoFocus
          />

          <TextField
            label="Precio (Bs.)"
            type="number"
            fullWidth
            value={precio}
            onChange={(e) => { setPrecio(e.target.value); }}
            placeholder="0.00"
            slotProps={{ input: { inputProps: { step: "0.01", min: "0" } } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!nombre.trim() || !precio.trim()}
        >
          Guardar Lote
        </Button>
      </DialogActions>
      {/* Notificación de éxito */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={() => { setShowSuccessMessage(false); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => { setShowSuccessMessage(false); }}
          severity="success"
          sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}
          icon={<CheckCircleRoundedIcon />}
        >
          ✅ Lote "{nombre}" creado exitosamente
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

// Memoizar el dialog de nuevo lote
export const NewLoteDialog = memo(NewLoteDialogComponent);
