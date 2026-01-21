import { memo } from "react";
import { Drawer, Toolbar, Typography, Button, Stack, Box, Divider, useMediaQuery } from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

interface AdminNavBarProps {
  proyectoNombre: string;
  isAdmin: boolean;
  onBack: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProjects?: () => void;
  open?: boolean; // Nuevo: controla si el drawer está abierto
  onClose?: () => void; // Nuevo: función para cerrar el drawer
}

/**
 * Barra de navegación lateral del admin memoizada
 * Solo se re-renderiza si cambian las props
 */
function AdminNavBarComponent({ proyectoNombre, isAdmin, onBack, onOpenLogin, onLogout, onOpenProjects, open, onClose }: AdminNavBarProps) {
  // Detecta si es móvil
  const isMobile = useMediaQuery('(max-width:600px)');
  const drawerWidth = isMobile ? '80vw' : 260;
  const variant = isMobile ? 'temporary' : 'permanent';

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={isMobile ? open : true}
      onClose={isMobile ? onClose : undefined}
      slotProps={{
        paper: {
          sx: {
            width: drawerWidth,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            pt: 2,
            pb: 2,
          },
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" fontWeight={800} letterSpacing={-0.2} color="text.primary">
          {proyectoNombre}
        </Typography>

        <Stack spacing={1}>
          <Button variant="outlined" color="secondary" onClick={onBack} fullWidth>
            ← Atrás
          </Button>

          {isAdmin && onOpenProjects && (
            <>
              <Divider sx={{ my: 1 }} />
              <Button
                variant="outlined"
                color="primary"
                onClick={onOpenProjects}
                fullWidth
                startIcon={<FolderRoundedIcon />}
              >
                Gestionar Proyectos
              </Button>
            </>
          )}

          <Divider sx={{ my: 1 }} />

          {!isAdmin ? (
            <Button variant="contained" color="primary" onClick={onOpenLogin} fullWidth>
              Acceso Admin
            </Button>
          ) : (
            <Button variant="outlined" color="error" onClick={onLogout} fullWidth>
              Cerrar Admin
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

// Memoizar el navbar para evitar re-renders innecesarios
export const AdminNavBar = memo(AdminNavBarComponent);
