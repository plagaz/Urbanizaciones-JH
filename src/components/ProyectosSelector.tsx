import { memo } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Button,
  Container,
} from "@mui/material";
import { type Proyecto } from "../lib/supabase";
import MapRoundedIcon from "@mui/icons-material/MapRounded";

interface ProyectosSelectorProps {
  proyectos: Proyecto[];
  onSelectProyecto: (proyectoId: string) => void;
}

/**
 * Selector de proyectos memoizado
 * Solo se re-renderiza si cambia la lista de proyectos o el callback
 */
function ProyectosSelectorComponent({
  proyectos,
  onSelectProyecto,
}: ProyectosSelectorProps) {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 900,
            textAlign: "center",
            background: "linear-gradient(135deg, #60a5fa 0%, #7c3aed 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -1,
          }}
        >
          Mapa de Lotes
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 5,
            textAlign: "center",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Selecciona una urbanización para ver sus lotes
        </Typography>

        <Grid container spacing={3}>
          {proyectos.map((proyecto) => (
            <Grid
              key={proyecto.id}
              sx={{ display: "grid", gridColumn: { xs: "span 12", sm: "span 6", md: "span 4" } }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 16px 32px rgba(96, 165, 250, 0.3)",
                  },
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                }}
                onClick={() => { onSelectProyecto(proyecto.id); }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={proyecto.imagenUrl}
                  alt={proyecto.nombre}
                  sx={{
                    objectFit: "cover",
                    filter: "brightness(0.9)",
                    transition: "filter 0.3s ease",
                    "&:hover": {
                      filter: "brightness(1)",
                    },
                  }}
                />

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        letterSpacing: -0.5,
                      }}
                    >
                      {proyecto.nombre}
                    </Typography>

                    {(() => {
                      const lotes = proyecto.lotes ?? [];
                      const disponibles = lotes.filter((l) => l.estado === "disponible").length;
                      const reservados = lotes.filter((l) => l.estado === "reservado").length;
                      const vendidos = lotes.filter((l) => l.estado === "vendido").length;

                      return (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {lotes.length} lote{lotes.length !== 1 ? "s" : ""}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              mb: 2,
                              opacity: 0.8,
                            }}
                          >
                            Disponibles: {disponibles} | Reservados: {reservados} | Vendidos: {vendidos}
                          </Typography>
                        </>
                      );
                    })()}
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<MapRoundedIcon />}
                    fullWidth
                    sx={{
                      mt: 2,
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    Ver Mapa
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// Memoizar el selector de proyectos
export const ProyectosSelector = memo(ProyectosSelectorComponent);
