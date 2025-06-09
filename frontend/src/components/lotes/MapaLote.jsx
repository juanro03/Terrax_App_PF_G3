import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import html2canvas from "html2canvas";
import leafletImage from "leaflet-image";


const MapWithDraw = ({ onPoligonoCreado, coordenadasIniciales, mapContainerRef  }) => {
  const map = useMap();
  const drawnItems = useRef(new L.FeatureGroup());
  const drawControlRef = useRef(null);




  useEffect(() => {
    if (!map || drawControlRef.current) return;

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
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.current.clearLayers();

      const layer = e.layer;
      const latlngs = layer.getLatLngs()[0].map((p) => ({
        lat: p.lat,
        lng: p.lng,
      }));

      // Mostrar al usuario
      drawnItems.current.addLayer(layer);

      // 🔵 Captura visual: crear polígono temporal directamente
      const poligonoCapturable = L.polygon(latlngs, { color: "blue" }).addTo(map);

      // 📸 Captura
      setTimeout(() => {
        leafletImage(map, (err, canvas) => {
          if (err) return;

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "lote.png", { type: "image/png" });
              onPoligonoCreado(latlngs, file);

              // 🔁 Eliminar polígono auxiliar si no querés que quede
              map.removeLayer(poligonoCapturable);
            }
          });
        });
      }, 500);
    });

    


    // ⬇️ Este bloque es el importante para precargar el polígono
    if (coordenadasIniciales && Array.isArray(coordenadasIniciales)) {
      const latlngs = coordenadasIniciales.map(coord => L.latLng(coord.lat, coord.lng));
      const polygon = L.polygon(latlngs);
      drawnItems.current.addLayer(polygon);
      map.fitBounds(polygon.getBounds()); // opcional: centra el mapa
    }

  }, [map, onPoligonoCreado, coordenadasIniciales]);

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
