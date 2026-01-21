

import { Box, Button } from "@mui/material";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

interface AdminButtonProps {
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export function AdminButton({
  isAdmin,
  onOpenLogin,
  onLogout,
}: AdminButtonProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 1200,
        display: "flex",
        gap: 1,
      }}
    >
      <Button
        variant="contained"
        color={isAdmin ? "success" : "primary"}
        startIcon={isAdmin ? <LockRoundedIcon /> : <LockOpenRoundedIcon />}
        onClick={isAdmin ? onLogout : onOpenLogin}
      >
        {isAdmin ? "Admin Activo" : "Admin"}
      </Button>
    </Box>
  );
}
