import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Lote, type Proyecto, supabase } from "../lib/supabase";
import { useNotification } from "../contexts/NotificationContext";
import { LoteDialog } from "./LoteDialog";
import { AdminButton } from "./AdminButton";
import { AdminLoginDialog } from "./AdminLoginDialog";
import { NewLoteDialog } from "./NewLoteDialog";
import { ProyectosSelector } from "./ProyectosSelector";
import { PromotorDialog } from "./PromotorDialog";
import { AdminNavBar } from "./AdminNavBar";
import { AdminProjectsDialog } from "./AdminProjectsDialog";
import { getProyectos, createProyecto, deleteProyecto } from "../services/proyectos.service";
import {
  createLote,
  updateLoteCoords,
  reservarLote,
  venderLote,
  liberarLote,
  deleteLote,
} from "../services/lotes.service";
import { checkIsAdmin, onAuthStateChange } from "../services/auth.service";

// Lazy load del mapa (componente pesado con Leaflet)
const LoteMap = lazy(() => import("./LoteMap").then(module => ({ default: module.LoteMap })));

export function AppContent() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useNotification();

  const blurActiveElement = () => {
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
  };

  // Estado de UI
  const [proyectoActualId, setProyectoActualId] = useState<string | null>(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState<Lote | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAdminLogin, setOpenAdminLogin] = useState(false);
  const [openNewLoteDialog, setOpenNewLoteDialog] = useState(false);
  const [openAdminProjectsDialog, setOpenAdminProjectsDialog] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState<[number, number][] | null>(null);
  const [showSelector, setShowSelector] = useState(true);
  const [openPromotorDialog, setOpenPromotorDialog] = useState(false);
  const [loteReservaPendiente, setLoteReservaPendiente] = useState<Lote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lote | null>(null);

  // Verificar si el usuario es admin al cargar
  useEffect(() => {
    void checkIsAdmin().then(setIsAdmin);

    // Suscribirse a cambios de autenticación
    const { data: authListener } = onAuthStateChange((isAdmin) => {
      setIsAdmin(isAdmin);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Query para obtener proyectos
  const {
    data: proyectos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["proyectos"],
    queryFn: getProyectos,
  });

  // Suscripción en tiempo real a cambios en lotes y proyectos
  useEffect(() => {
    // Suscribirse a cambios en la tabla lotes
    const lotesChannel = supabase
      .channel("lotes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lotes" },
        () => {
          // Invalidar query cuando hay cambios
          queryClient.invalidateQueries({ queryKey: ["proyectos"] });
        }
      )
      .subscribe();

    // Suscribirse a cambios en la tabla proyectos
    const proyectosChannel = supabase
      .channel("proyectos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "proyectos" },
        () => {
          // Invalidar query cuando hay cambios
          queryClient.invalidateQueries({ queryKey: ["proyectos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lotesChannel);
      supabase.removeChannel(proyectosChannel);
    };
  }, [queryClient]);

  // Establecer proyecto inicial
  useEffect(() => {
    if (proyectos.length > 0 && !proyectoActualId) {
      const guardado = localStorage.getItem("proyecto-actual-id");
      const proyectoId = proyectos.find((p) => p.id === guardado)?.id || proyectos[0].id;
      setProyectoActualId(proyectoId);
    }
  }, [proyectos, proyectoActualId]);

  // Guardar proyecto actual en localStorage
  useEffect(() => {
    if (proyectoActualId) {
      localStorage.setItem("proyecto-actual-id", proyectoActualId);
    }
  }, [proyectoActualId]);

  // Memoizar proyecto actual para evitar búsquedas repetidas
  const proyectoActual = useMemo(
    () => proyectos.find((p) => p.id === proyectoActualId) || proyectos[0],
    [proyectos, proyectoActualId]
  );

  // Mutations
  const createLoteMutation = useMutation({
    mutationFn: ({ proyectoId, lote }: { proyectoId: string; lote: Omit<Lote, "id"> }) =>
      createLote(proyectoId, lote),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      showSuccess("Lote creado exitosamente");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "No se pudo crear el lote";
      showError(`Error al crear lote: ${message}`);
    },
  });

  const updateLoteCoordsMutation = useMutation({
    mutationFn: ({ loteId, coords }: { loteId: number; coords: Lote["coords"] }) =>
      updateLoteCoords(loteId, coords),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el lote";
      showError(`Error al actualizar lote: ${message}`);
    },
  });

  const reservarLoteMutation = useMutation({
    mutationFn: ({ loteId, promotor }: { loteId: number; promotor: string }) =>
      reservarLote(loteId, promotor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      showSuccess("Lote reservado exitosamente");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "No se pudo reservar el lote";
      showError(`Error al reservar lote: ${message}`);
    },
  });

  const venderLoteMutation = useMutation({
    mutationFn: (loteId: number) => venderLote(loteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      showSuccess("Lote vendido exitosamente");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "No se pudo vender el lote";
      showError(`Error al vender lote: ${message}`);
    },
  });

  const liberarLoteMutation = useMutation({
    mutationFn: (loteId: number) => liberarLote(loteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      showSuccess("Lote liberado exitosamente");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "No se pudo liberar el lote";
      showError(`Error al liberar lote: ${message}`);
    },
  });

  const deleteLoteMutation = useMutation({
    mutationFn: (loteId: number) => deleteLote(loteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      setLoteSeleccionado(null);
      showSuccess("Lote eliminado exitosamente");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el lote";
      showError(`Error al eliminar lote: ${message}`);
    },
  });

  const createProyectoMutation = useMutation({
    mutationFn: (proyecto: Proyecto) => createProyecto(proyecto),
    onSuccess: (nuevoProyecto) => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      // Seleccionar automáticamente el nuevo proyecto
      setProyectoActualId(nuevoProyecto.id);
      setShowSelector(false);
    },
  });

  const deleteProyectoMutation = useMutation({
    mutationFn: (proyectoId: string) => deleteProyecto(proyectoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
    },
  });

  // Handlers
  const handleLoginSuccess = (adminStatus: boolean) => {
    setIsAdmin(adminStatus);
  };

  const logoutAdmin = async () => {
    const { signOut } = await import("../services/auth.service");
    await signOut();
    setIsAdmin(false);
  };

  // Memoizar handlers para evitar re-renders en componentes hijos
  const handleSelectProyecto = useCallback((proyectoId: string) => {
    setProyectoActualId(proyectoId);
    setShowSelector(false);
    setLoteSeleccionado(null);
  }, []);

  const handleDrawPolygon = useCallback((coords: [number, number][]) => {
    blurActiveElement();
    setPolygonCoords(coords);
    setOpenNewLoteDialog(true);
  }, []);

  const handleSaveNewLote = useCallback((nombre: string, precio: number) => {
    if (!polygonCoords || !proyectoActualId) return;

    const newLote: Omit<Lote, "id"> = {
      nombre,
      precio,
      coords: polygonCoords,
      estado: "disponible",
    };

    createLoteMutation.mutate({ proyectoId: proyectoActualId, lote: newLote });

    setOpenNewLoteDialog(false);
    setPolygonCoords(null);
  }, [polygonCoords, proyectoActualId, createLoteMutation]);

  const handleEditPolygon = useCallback((loteId: number, coords: [number, number][]) => {
    updateLoteCoordsMutation.mutate({ loteId, coords });
  }, [updateLoteCoordsMutation]);

  const handleDeleteLote = useCallback((loteId: number) => {
    const lote = proyectoActual.lotes?.find((l) => l.id === loteId) ?? null;
    if (!lote) return;
    setDeleteTarget(lote);
  }, [proyectoActual]);

  const solicitarReservaLote = useCallback((loteId: number) => {
    const lote = proyectoActual.lotes?.find((l) => l.id === loteId);
    if (!lote) return;
    blurActiveElement();
    setLoteReservaPendiente(lote);
    setOpenPromotorDialog(true);
  }, [proyectoActual]);

  const confirmarReservaConPromotor = useCallback((promotor: string) => {
    if (!loteReservaPendiente) return;

    reservarLoteMutation.mutate(
      { loteId: loteReservaPendiente.id, promotor: promotor.trim() },
      {
        onSuccess: () => {
          setOpenPromotorDialog(false);
          setLoteReservaPendiente(null);
          setLoteSeleccionado(null);
        },
      }
    );
  }, [loteReservaPendiente, reservarLoteMutation]);

  const cambiarEstadoLote = useCallback((loteId: number, nuevoEstado: Lote["estado"]) => {
    const lote = proyectoActual.lotes?.find((l) => l.id === loteId);
    if (!lote) return;

    if (nuevoEstado === "vendido") {
      venderLoteMutation.mutate(loteId, {
        onSuccess: () => { setLoteSeleccionado(null); },
      });
    } else if (nuevoEstado === "disponible") {
      liberarLoteMutation.mutate(loteId, {
        onSuccess: () => { setLoteSeleccionado(null); },
      });
    } else if (nuevoEstado === "reservado") {
      // Usamos el flujo de promotor para reservar
      solicitarReservaLote(loteId);
    }
  }, [proyectoActual, venderLoteMutation, liberarLoteMutation, solicitarReservaLote]);

  const handleAddProyecto = (proyecto: Proyecto) => {
    createProyectoMutation.mutate(proyecto);
  };

  const handleDeleteProyecto = (proyectoId: string) => {
    deleteProyectoMutation.mutate(proyectoId, {
      onSuccess: () => {
        // Si se eliminó el proyecto actual, resetear la vista
        if (proyectoActualId === proyectoId) {
          setProyectoActualId(null);
          setShowSelector(true);
        }
        // Recargar proyectos
        void queryClient.invalidateQueries({ queryKey: ["proyectos"] });
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <strong>Error al cargar los proyectos</strong>
          <br />
          {error instanceof Error ? error.message : "Error desconocido"}
          <br />
          <br />
          Verifica que:
          <ul>
            <li>Has creado el archivo .env con las credenciales de Supabase</li>
            <li>Has ejecutado el esquema SQL en Supabase</li>
            <li>Las credenciales son correctas</li>
          </ul>
        </Alert>
      </Box>
    );
  }

  // No projects state
  if (proyectos.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          <strong>No hay proyectos</strong>
          <br />
          Ejecuta el script de migración para cargar los datos iniciales.
          <br />
          Abre la consola del navegador y escribe: <code>seedDatabase()</code>
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {showSelector ? (
        <ProyectosSelector proyectos={proyectos} onSelectProyecto={handleSelectProyecto} />
      ) : (
        <Box
          sx={{
            position: "relative",
            height: "100vh",
            width: "100%",
            bgcolor: "background.default",
            pl: isAdmin ? "260px" : 0,
          }}
        >
          {isAdmin && (
            <AdminNavBar
              proyectoNombre={proyectoActual.nombre}
              isAdmin={isAdmin}
              onBack={() => { setShowSelector(true); }}
              onOpenLogin={() => {
                blurActiveElement();
                setOpenAdminLogin(true);
              }}
              onLogout={() => { void logoutAdmin(); }}
              onOpenProjects={() => {
                blurActiveElement();
                setOpenAdminProjectsDialog(true);
              }}
            />
          )}

          {!isAdmin && (
            <Box
              sx={{
                position: "fixed",
                top: 25,
                left: 72, // colocar a la derecha de los controles de zoom de Leaflet
                zIndex: 1200,
              }}
            >
              <Button variant="contained" color="secondary" onClick={() => { setShowSelector(true); }}>
                ← Atrás
              </Button>
            </Box>
          )}

          <Suspense fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                bgcolor: "background.default",
              }}
            >
              <CircularProgress size={60} />
            </Box>
          }>
            <LoteMap
              proyecto={proyectoActual}
              selectedLote={loteSeleccionado}
              onSelectLote={setLoteSeleccionado}
              isAdmin={isAdmin}
              onDrawPolygon={handleDrawPolygon}
              onEditPolygon={handleEditPolygon}
            />
          </Suspense>

          {/* Modal de información del lote */}
          <LoteDialog
            open={!!loteSeleccionado}
            lote={loteSeleccionado}
            isAdmin={isAdmin}
            onClose={() => { setLoteSeleccionado(null); }}
            onReservar={(id) => { solicitarReservaLote(id); }}
            onVender={(id) => { cambiarEstadoLote(id, "vendido"); }}
            onLiberar={(id) => { cambiarEstadoLote(id, "disponible"); }}
            onEliminar={handleDeleteLote}
          />

          <AdminLoginDialog
            open={openAdminLogin}
            onClose={() => { setOpenAdminLogin(false); }}
            onLogin={handleLoginSuccess}
          />

          <NewLoteDialog
            open={openNewLoteDialog}
            onClose={() => {
              setOpenNewLoteDialog(false);
              setPolygonCoords(null);
            }}
            onSave={handleSaveNewLote}
          />

          <AdminProjectsDialog
            open={openAdminProjectsDialog}
            onClose={() => { setOpenAdminProjectsDialog(false); }}
            proyectos={proyectos}
            onAddProyecto={handleAddProyecto}
            onDeleteProyecto={handleDeleteProyecto}
          />

          {!isAdmin && (
            <AdminButton
              isAdmin={isAdmin}
              onOpenLogin={() => {
                blurActiveElement();
                setOpenAdminLogin(true);
              }}
              onLogout={() => { void logoutAdmin(); }}
            />
          )}

          <PromotorDialog
            open={openPromotorDialog}
            onClose={() => {
              setOpenPromotorDialog(false);
              setLoteReservaPendiente(null);
            }}
            onConfirm={confirmarReservaConPromotor}
            loteNombre={loteReservaPendiente?.nombre}
          />

          <Dialog
            open={!!deleteTarget}
            onClose={() => { setDeleteTarget(null); }}
            maxWidth="xs"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}
          >
            <DialogTitle sx={{ fontWeight: 800, pb: 1.5 }}>Eliminar lote</DialogTitle>
            <DialogContent sx={{ pb: 1, color: "text.secondary" }}>
              <Typography sx={{ mb: 1.5 }}>
                ¿Estás seguro de eliminar el lote
                {deleteTarget ? ` "${deleteTarget.nombre}"` : ""}?
              </Typography>
              <Typography variant="body2" color="warning.main">
                Esta acción no se puede deshacer.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => { setDeleteTarget(null); }} variant="outlined">
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!deleteTarget) return;
                  deleteLoteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => {
                      setDeleteTarget(null);
                    },
                    onError: () => {
                      setDeleteTarget(null);
                    },
                  });
                }}
                color="error"
                variant="contained"
              >
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
}
