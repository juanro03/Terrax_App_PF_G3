import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";
import MapaLote from "./MapaLote";
import * as turf from "@turf/turf";

const ModalCrearLote = ({ show, onHide, onSuccess, campoId }) => {
  const [form, setForm] = useState({
    nombre: "",
    area: "",
    observacion: "",
    campo: parseInt(campoId),
  });

  const [coordenadas, setCoordenadas] = useState(null);
  const [imagenAutoGenerada, setImagenAutoGenerada] = useState(null);
  const [centroMapa, setCentroMapa] = useState([-31.41, -64.19]); // Coordenada por defecto (Córdoba)

  useEffect(() => {
    if (campoId) {
      axios.get(`http://127.0.0.1:8000/api/campos/${campoId}/`).then((res) => {
        const campo = res.data;
        const provincia = campo.provincia;
        const localidad = campo.localidad;

        axios
          .get(
            `https://apis.datos.gob.ar/georef/api/localidades?provincia=${provincia}&nombre=${localidad}&max=1`
          )
          .then((res) => {
            const centroide = res.data.localidades[0]?.centroide;
            if (centroide) {
              setCentroMapa([centroide.lat, centroide.lon]);
            }
          });
      });
    }
  }, [campoId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen_satelital") {
      setForm({ ...form, imagen_satelital: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const areaValue = parseFloat(form.area);
    if (isNaN(areaValue) || !isFinite(areaValue)) {
      alert("Error: el área calculada no es válida.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("area", areaValue); // Ya validado como número real
    formData.append(
      "imagen_satelital",
      imagenAutoGenerada ?? form.imagen_satelital
    );
    formData.append("observacion", form.observacion);
    formData.append("campo", parseInt(campoId, 10));
    formData.append("coordenadas", JSON.stringify(coordenadas));

    try {
      await axios.post("http://127.0.0.1:8000/api/lotes/", formData);
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error al crear lote:", error);
      alert(
        "Ocurrió un error al crear el lote. Verificá la consola para más detalles."
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              name="observacion"
              rows={3}
              value={form.observacion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Área estimada (ha)</Form.Label>
            <Form.Control type="text" value={form.area} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Seleccionar lote en el mapa</Form.Label>
            <MapaLote
              onPoligonoCreado={(coords, imagenBlob) => {
                console.log("Coords recibidas:", coords);
                coords.forEach((p, i) => console.log(`Punto ${i}:`, p));

                if (!Array.isArray(coords)) {
                  alert("Error interno: las coordenadas no son válidas.");
                  return;
                }

                setCoordenadas(coords);
                setImagenAutoGenerada(imagenBlob);

                try {
                  // 🔄 transformar cada { lat, lng } => [lng, lat]
                  const transformed = coords.map((point) => {
                    if (point.lat !== undefined && point.lng !== undefined) {
                      return [point.lng, point.lat]; // GeoJSON usa [lon, lat]
                    } else {
                      throw new Error("Formato de punto inválido");
                    }
                  });

                  // Asegurar cierre del polígono
                  const first = transformed[0];
                  const last = transformed[transformed.length - 1];
                  if (first[0] !== last[0] || first[1] !== last[1]) {
                    transformed.push(first);
                  }

                  const polygon = turf.polygon([transformed]);
                  const areaHa = turf.area(polygon) / 10000;

                  if (isNaN(areaHa) || !isFinite(areaHa)) {
                    throw new Error("Área inválida");
                  }

                  setForm((prevForm) => ({
                    ...prevForm,
                    area: areaHa.toFixed(2),
                  }));
                } catch (err) {
                  console.error("Error calculando el área:", err);
                  alert("Error: el área calculada no es válida.");
                }
              }}
              centroInicial={centroMapa}
            />

            {!coordenadas && (
              <div className="text-danger mt-2">
                * Este campo es obligatorio
              </div>
            )}
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCrearLote;
