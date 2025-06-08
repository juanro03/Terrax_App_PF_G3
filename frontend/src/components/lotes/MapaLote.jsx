import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import html2canvas from "html2canvas";

const MapWithDraw = ({ onPoligonoCreado }) => {
  const map = useMap();
  const drawnItems = useRef(new L.FeatureGroup());
  const drawControlRef = useRef(null);

  useEffect(() => {
    if (!map || drawControlRef.current) return;

    console.log("map creado ✅");
    map.addLayer(drawnItems.current);

    const drawControl = new L.Control.Draw({
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

    drawControlRef.current = drawControl;
    console.log("drawControl ✅");
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, async (e) => {
      drawnItems.current.clearLayers();
      const layer = e.layer;
      drawnItems.current.addLayer(layer);

      const latlngs = layer.getLatLngs()[0].map((p) => ({
        lat: p.lat,
        lng: p.lng,
      }));

      // 🕒 Esperar brevemente para que se renderice el polígono
      setTimeout(async () => {
        const canvas = await html2canvas(map.getContainer());
        canvas.toBlob((blob) => {
          const file = new File([blob], "mapa_lote.png", { type: "image/png" });
          onPoligonoCreado(latlngs, file);
        });
      }, 300); // 🕓 delay de 300ms
    });


    // Tooltips en español
    setTimeout(() => {
      const btnDibujar = document.querySelector(".leaflet-draw-draw-polygon");
      const btnEliminar = document.querySelector(".leaflet-draw-edit-remove");
      if (btnDibujar) btnDibujar.setAttribute("title", "Dibujar lote");
      if (btnEliminar) btnEliminar.setAttribute("title", "Eliminar lote");
    }, 500);
  }, [map, onPoligonoCreado]);

  return null;
};

const MapaLote = ({ onPoligonoCreado }) => {
  const mapRef = useRef(null); // ✅ declarado correctamente

  return (
    <MapContainer
      center={[-31.41, -64.19]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      />
      <MapWithDraw onPoligonoCreado={onPoligonoCreado} />
    </MapContainer>
  );
};

export default MapaLote;
