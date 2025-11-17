import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import html2canvas from "html2canvas";
import leafletImage from "leaflet-image";


const MapWithDraw = ({ onPoligonoCreado, coordenadasIniciales }) => {
  const map = useMap();
  const drawnItems = useRef(null);
  const drawControl = useRef(null);

  useEffect(() => {
    if (!map) return;

    // --- Crear FeatureGroup una sola vez ---
    if (!drawnItems.current) {
      drawnItems.current = new L.FeatureGroup();
      map.addLayer(drawnItems.current);
    }

    // --- Crear control Draw una sola vez ---
    if (!drawControl.current) {
      drawControl.current = new L.Control.Draw({
        draw: {
          polygon: true,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
          polyline: false,
        },
        edit: {
          featureGroup: drawnItems.current,
          remove: true,
        },
      });
      map.addControl(drawControl.current);
    }

    // --- Evento: polygon creado ---
    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.current.clearLayers();

      const layer = e.layer;
      drawnItems.current.addLayer(layer);

      const latlngs = layer
        .getLatLngs()[0]
        .map((p) => ({ lat: p.lat, lng: p.lng }));

      // Captura PNG
      leafletImage(map, (err, canvas) => {
        if (err) return;

        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], "lote.png", { type: "image/png" });
          onPoligonoCreado(latlngs, file);
        });
      });
    });

    // --- Precargar polígono inicial ---
    if (coordenadasIniciales?.length > 0) {
      const points = coordenadasIniciales.map((p) => L.latLng(p.lat, p.lng));
      const polygon = L.polygon(points);
      drawnItems.current.addLayer(polygon);
      map.fitBounds(polygon.getBounds());
    }
  }, [map, coordenadasIniciales, onPoligonoCreado]);

  return null;
};

const MapaLote = ({ onPoligonoCreado, coordenadasIniciales }) => {
  const mapContainerRef = useRef(null);

  return (
    <div ref={mapContainerRef}>
      <MapContainer
        center={[-31.41, -64.19]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        preferCanvas={true}
      >
        <TileLayer
          attribution='Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        />
        <MapWithDraw
          onPoligonoCreado={onPoligonoCreado}
          coordenadasIniciales={coordenadasIniciales}
          mapContainerRef={mapContainerRef} // ⬅️ se lo pasamos
        />
      </MapContainer>
    </div>
  );
};


export default MapaLote;