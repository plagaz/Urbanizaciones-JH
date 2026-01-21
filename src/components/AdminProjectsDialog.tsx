import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Snackbar,
  CircularProgress,
  DialogActions,
  Typography,
} from "@mui/material";
import { useState, useCallback, memo } from "react";
import { type Proyecto } from "../lib/supabase";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseIcon from "@mui/icons-material/Close";
import { uploadPlanoImage } from "../services/proyectos.service";
import { ProyectoSchema, validateFormData } from "../utils/validators";
import { useNotification } from "../contexts/NotificationContext";

interface AdminProjectsDialogProps {
  open: boolean;
  onClose: () => void;
  proyectos: Proyecto[];
  onAddProyecto: (proyecto: Proyecto) => void;
  onDeleteProyecto: (proyectoId: string) => void;
}

/**
 * Dialog para administrar proyectos (CRUD) memoizado
 * Solo se re-renderiza cuando cambian las props
 */
function AdminProjectsDialogComponent({
  open,
  onClose,
  proyectos,
  onAddProyecto,
  onDeleteProyecto,
}: AdminProjectsDialogProps) {
  const { showError, showSuccess } = useNotification();
  const [nombre, setNombre] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [bounds, setBounds] = useState({
    lat1: "0",
    lng1: "0",
    lat2: "1000",
    lng2: "1000",
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; lotes: number } | null>(null);

  // Generar preview de imagen
  const generarPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen");
      return;
    }

    setIsUploading(true);
    try {
      // Generar preview antes de subir
      generarPreview(file);
      
      const newId = Math.random().toString(36).slice(2, 11);
      const url = await uploadPlanoImage(file, newId);
      setImagenUrl(url);
      setError("");
    } catch (err) {
      console.error("Error al subir imagen:", err);
      const message = (() => {
        if (err instanceof Error) return err.message;
        if (typeof err === "object" && err !== null && "message" in err) {
          const candidate = (err as { message?: unknown }).message;
          if (typeof candidate === "string") return candidate;
        }
        return "Error al subir la imagen. Por favor intenta de nuevo";
      })();
      setError(message);
      setImagePreview("");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }, [generarPreview]);

  const handleAddProyecto = useCallback(() => {
    setError("");

    // Validar bounds numéricamente primero
    const lat1 = parseFloat(bounds.lat1);
    const lng1 = parseFloat(bounds.lng1);
    const lat2 = parseFloat(bounds.lat2);
    const lng2 = parseFloat(bounds.lng2);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      setError("Los bounds deben ser números válidos");
      showError("Los bounds deben ser números válidos");
      return;
    }

    // Validar con Zod
    const validation = validateFormData(ProyectoSchema, {
      nombre: nombre.trim(),
      imagenUrl: imagenUrl.trim(),
      bounds: { lat1, lng1, lat2, lng2 },
    });

    if (!validation.valid) {
      const errorMessage = Object.values(validation.errors || {})[0] || 'Error de validación';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    // Generar nuevo ID
    const newId = Math.random().toString(36).slice(2, 11);

    const newProyecto: Proyecto = {
      id: newId,
      nombre: nombre.trim(),
      imagenUrl: imagenUrl.trim(),
      bounds: [
        [lat1, lng1],
        [lat2, lng2],
      ],
      lotes: [],
    };

    onAddProyecto(newProyecto);
    
    // Mostrar notificación de éxito
    setSuccessMessage(`✅ "${nombre.trim()}" creada exitosamente`);
    setShowSuccessMessage(true);
    showSuccess(`"${nombre.trim()}" creada exitosamente`);
    
    setNombre("");
    setImagenUrl("");
    setImagePreview("");
    setBounds({ lat1: "0", lng1: "0", lat2: "1000", lng2: "1000" });
    setShowForm(false);
  }, [nombre, imagenUrl, bounds, onAddProyecto, showError, showSuccess]);

  const handleDelete = useCallback((proyectoId: string, projectName: string, lotes: number) => {
    setDeleteTarget({ id: proyectoId, name: projectName, lotes });
  }, []);

  return (
    <>
      <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Gestionar Proyectos
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Lista de proyectos */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => { setShowForm(!showForm); }}
                size="small"
              >
                Nuevo Proyecto
              </Button>
            </Box>

            {proyectos.length === 0 ? (
              <Alert severity="info">No hay proyectos creados</Alert>
            ) : (
              <List sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                {proyectos.map((proyecto, index) => (
                  <Box key={proyecto.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => { handleDelete(proyecto.id, proyecto.nombre, proyecto.lotes?.length ?? 0); }}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={proyecto.nombre}
                        secondary={`${String(proyecto.lotes?.length ?? 0)} lotes`}
                      />
                    </ListItem>
                    {index < proyectos.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Box>

          {/* Formulario para agregar */}
          {showForm && (
            <Box
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <TextField
                label="Nombre del Proyecto"
                fullWidth
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); }}
                placeholder="Ej: Urbanización Los Andes"
                sx={{ mb: 2 }}
                autoFocus
              />

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  disabled={isUploading}
                  sx={{ textTransform: "none" }}
                >
                  {isUploading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} />
                      <span>Subiendo imagen...</span>
                    </Stack>
                  ) : (
                    "📁 Subir Imagen de Plano"
                  )}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => { void handleFileUpload(e); }}
                    disabled={isUploading}
                  />
                </Button>
                {imagenUrl && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: "success.light", borderRadius: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 20 }} />
                      <span style={{ fontSize: "0.85rem" }}>Imagen cargada exitosamente</span>
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Preview de imagen */}
              {imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 1, color: "text.secondary" }}>
                    Vista previa:
                  </Box>
                  <Box
                    component="img"
                    src={imagePreview}
                    sx={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                    alt="Vista previa"
                  />
                </Box>
              )}

              <Box sx={{ mb: 2, p: 1.5, bgcolor: "info.light", borderRadius: 1 }}>
                <Box sx={{ mb: 1.5, fontWeight: 600, fontSize: "0.9rem", color: "info.main" }}>
                  Límites del Mapa (Bounds)
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    label="Lat Min"
                    type="number"
                    value={bounds.lat1}
                    onChange={(e) => { setBounds({ ...bounds, lat1: e.target.value }); }}
                    size="small"
                    placeholder="0"
                  />
                  <TextField
                    label="Lng Min"
                    type="number"
                    value={bounds.lng1}
                    onChange={(e) => { setBounds({ ...bounds, lng1: e.target.value }); }}
                    size="small"
                    placeholder="0"
                  />
                  <TextField
                    label="Lat Max"
                    type="number"
                    value={bounds.lat2}
                    onChange={(e) => { setBounds({ ...bounds, lat2: e.target.value }); }}
                    size="small"
                    placeholder="1000"
                  />
                  <TextField
                    label="Lng Max"
                    type="number"
                    value={bounds.lng2}
                    onChange={(e) => { setBounds({ ...bounds, lng2: e.target.value }); }}
                    size="small"
                    placeholder="1000"
                  />
                </Stack>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleAddProyecto}
                  disabled={!nombre.trim() || !imagenUrl.trim()}
                >
                  Crear Proyecto
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowForm(false);
                    setNombre("");
                    setImagenUrl("");
                    setImagePreview("");
                    setBounds({ lat1: "0", lng1: "0", lat2: "1000", lng2: "1000" });
                    setError("");
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>

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
        {successMessage}
      </Alert>
    </Snackbar>

    <Dialog
      open={!!deleteTarget}
      onClose={() => { setDeleteTarget(null); }}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1.5 }}>Eliminar proyecto</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Esta acción eliminará el proyecto y todos sus lotes.
        </Alert>
        <Typography sx={{ mb: 0.5 }}>
          ¿Seguro que deseas eliminar
          {deleteTarget ? ` "${deleteTarget.name}"` : " este proyecto"}?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lotes afectados: {deleteTarget?.lotes ?? 0}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => { setDeleteTarget(null); }} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (!deleteTarget) return;
            onDeleteProyecto(deleteTarget.id);
            setSuccessMessage(`✅ Proyecto "${deleteTarget.name}" eliminado`);
            setShowSuccessMessage(true);
            setDeleteTarget(null);
          }}
          color="error"
          variant="contained"
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
}

// Memoizar el dialog de proyectos por su complejidad
export const AdminProjectsDialog = memo(AdminProjectsDialogComponent);

