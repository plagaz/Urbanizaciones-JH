import { memo } from "react";
import { Drawer, Toolbar, Typography, Button, Stack, Box, Divider } from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

interface AdminNavBarProps {
  proyectoNombre: string;
  isAdmin: boolean;
  onBack: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProjects?: () => void;
}

/**
 * Barra de navegación lateral del admin memoizada
 * Solo se re-renderiza si cambian las props
 */
function AdminNavBarComponent({ proyectoNombre, isAdmin, onBack, onOpenLogin, onLogout, onOpenProjects }: AdminNavBarProps) {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      slotProps={{
        paper: {
          sx: {
            width: 260,
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
