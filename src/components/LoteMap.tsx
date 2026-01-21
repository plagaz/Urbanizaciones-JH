import { memo } from "react";
import {
  MapContainer,
  ImageOverlay,
  Polygon,
  Popup,
  FeatureGroup,
} from "react-leaflet";
import L, { type LeafletMouseEvent } from "leaflet";
import { type Lote, type Proyecto } from "../lib/supabase";
import { colorEstado } from "../utils/colorEstado";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { MapLeyenda } from "./MapLeyenda";

interface LoteMapProps {
  proyecto: Proyecto;
  selectedLote: Lote | null;
  onSelectLote: (lote: Lote) => void;
  isAdmin?: boolean;
  onDrawPolygon?: (coords: [number, number][]) => void;
  onEditPolygon?: (loteId: number, coords: [number, number][]) => void;
}

/**
 * Componente memoizado del mapa de lotes con Leaflet
 * Solo se re-renderiza si cambian proyecto, selectedLote, isAdmin o los callbacks
 */
function LoteMapComponent({
  proyecto,
  selectedLote,
  onSelectLote,
  isAdmin,
  onDrawPolygon,
  onEditPolygon,
}: LoteMapProps) {
  // Asegurar que bounds existe y tiene el formato correcto
  const bounds = proyecto.bounds;
  const lotes = proyecto.lotes ?? [];

  return (
    <>
      <MapLeyenda />
      <MapContainer
        key={proyecto.id}
        center={[bounds[1][0] / 2, bounds[1][1] / 2]}
        zoom={-1}
        minZoom={-2}
        maxZoom={2}
        style={{ height: "100vh", width: "100%" }}
        crs={L.CRS.Simple}
      >
      <ImageOverlay url={proyecto.imagenUrl} bounds={proyecto.bounds} />

      {isAdmin && (
        <FeatureGroup>
          {lotes.map((lote) => (
            <Polygon
              key={`editable-${String(lote.id)}`}
              positions={lote.coords}
              pathOptions={{
                color: colorEstado(lote.estado),
                fillOpacity: 0.1,
                weight: 1,
                dashArray: "5, 5",
              }}
              interactive={false}
            />
          ))}
          <EditControl
            position="topleft"
            onCreated={(e: L.DrawEvents.Created) => {
              const target = e.target as L.FeatureGroup;
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              const createdLayer = e.layer as L.Layer;
              if (!(createdLayer instanceof L.Polygon)) return;

              const latLngs = createdLayer.getLatLngs()[0] as L.LatLng[];
              const coords = latLngs.map((ll) => [ll.lat, ll.lng] as [number, number]);
              onDrawPolygon?.(coords);
              target.removeLayer(createdLayer);
            }}
            onEdited={(e: L.DrawEvents.Edited) => {
              // Cuando se edita un polígono
              const editedLayers = e.layers;
              editedLayers.eachLayer((layer) => {
                if (!(layer instanceof L.Polygon)) return;

                const latLngs = layer.getLatLngs()[0] as L.LatLng[];
                const coords = latLngs.map((ll) => [ll.lat, ll.lng] as [number, number]);

                // Encontrar cuál lote fue editado
                const editedLoteId = lotes.find((lote) => {
                  if (lote.coords.length !== coords.length) return false;
                  const firstLote = lote.coords[0] as [number, number];
                  const firstCoord = coords[0];
                  return (
                    Math.abs(firstLote[0] - firstCoord[0]) < 0.01 &&
                    Math.abs(firstLote[1] - firstCoord[1]) < 0.01
                  );
                })?.id;

                if (editedLoteId) {
                  onEditPolygon?.(editedLoteId, coords);
                }
              });
            }}
            onDeleted={() => {}}
            draw={{
              polygon: true,
              polyline: false,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
      )}

      {lotes.map((lote) => (
        <Polygon
          key={lote.id}
          positions={lote.coords}
          pathOptions={{
            color: colorEstado(lote.estado),
            fillOpacity: selectedLote?.id === lote.id ? 0.8 : 0.5,
            weight: selectedLote?.id === lote.id ? 4 : 2,
          }}
          eventHandlers={{
            click: () => { onSelectLote(lote); },
            mouseover: (e: LeafletMouseEvent) => {
              const target = e.target as L.Path;
              target.setStyle({ fillOpacity: 0.8 });
            },
            mouseout: (e: LeafletMouseEvent) => {
              const target = e.target as L.Path;
              target.setStyle({
                fillOpacity: selectedLote?.id === lote.id ? 0.8 : 0.5,
              });
            },
          }}
        >
          <Popup>
            <strong>{lote.nombre}</strong>
            <br />
            Estado: {lote.estado}
            <br />
            Precio: Bs. {lote.precio.toLocaleString()}
          </Popup>
        </Polygon>
      ))}
    </MapContainer>
    </>
  );
}

// Memoizar el componente para evitar re-renders innecesarios
// Solo se actualiza si cambian las props
export const LoteMap = memo(LoteMapComponent);
