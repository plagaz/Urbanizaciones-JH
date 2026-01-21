import { memo, useState, type KeyboardEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { signIn } from "../services/auth.service";
import { useNotification } from "../contexts/NotificationContext";
import { AdminLoginSchema, validateFormData } from "../utils/validators";

interface AdminLoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (isAdmin: boolean) => void;
}

/**
 * Dialog de login de admin memoizado
 * Se re-renderiza solo cuando cambian las props
 */
function AdminLoginDialogComponent({
  open,
  onClose,
  onLogin,
}: AdminLoginDialogProps) {
  const { showError, showSuccess } = useNotification();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    // Validar con Zod
    const validation = validateFormData(AdminLoginSchema, {
      email: email.trim(),
      password: contrasena.trim(),
    });

    if (!validation.valid) {
      const errorMessage =
        Object.values(validation.errors || {})[0] || "Error de validación";
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(email, contrasena);

      if (result.success) {
        if (result.isAdmin) {
          onLogin(true);
          setEmail("");
          setContrasena("");
          onClose();
          showSuccess("¡Sesión iniciada correctamente!");
        } else {
          setError("No tienes permisos de administrador");
          showError("No tienes permisos de administrador");
        }
      } else {
        setError(result.error || "Error al iniciar sesión");
        showError(result.error || "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
      showError("Error de conexión");
    } finally {
      setLoading(false);
      setContrasena("");
    }
  };

  const handleClose = () => {
    setEmail("");
    setContrasena("");
    setError("");
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      void handleLogin();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 800 }}
      >
        <LockRoundedIcon />
        Acceso Administrativo
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            variant="outlined"
            disabled={loading}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            variant="outlined"
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void handleLogin();
          }}
          disabled={loading || !email.trim() || !contrasena.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Iniciando..." : "Ingresar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Memoizar el dialog de login
export const AdminLoginDialog = memo(AdminLoginDialogComponent);
