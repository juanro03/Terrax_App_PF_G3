import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";
import MapaLote from "./MapaLote";
import * as turf from "@turf/turf";

const normalizeCoords = (coords) => {
  if (!coords) return [];

  // Ya vienen como [{lat, lng}, ...]
  if (Array.isArray(coords) && coords[0]?.lat !== undefined) {
    return coords;
  }

  // Vienen como [[lng, lat], ...] (desde backend)
  if (Array.isArray(coords) && Array.isArray(coords[0])) {
    return coords.map(([lng, lat]) => ({ lat, lng }));
  }

  console.error("Formato de coordenadas inválido:", coords);
  return [];
};

const ModalEditarLote = ({ show, onHide, lote, onSuccess }) => {
  const [form, setForm] = useState({ ...lote });

  useEffect(() => {
    if (lote) {
      setForm({ ...lote });
    }
  }, [lote]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen_satelital") {
      setForm({ ...form, imagen_satelital: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🔥 Manejo del polígono + cálculo automático de área
  const handlePolygonChange = (coords, imagenBlob) => {
    const normalized = normalizeCoords(coords);

    if (!normalized.length || normalized.length < 3) {
      alert("El polígono no es válido.");
      return;
    }

    // Convertir a GeoJSON [lng, lat] para turf
    const transformed = normalized.map((p) => [p.lng, p.lat]);

    // Asegurar cierre del polígono
    const first = transformed[0];
    const last = transformed[transformed.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      transformed.push(first);
    }

    try {
      const polygon = turf.polygon([transformed]);
      const areaHa = turf.area(polygon) / 10000;

      setForm((prev) => ({
        ...prev,
        coordenadas: normalized,
        area: areaHa.toFixed(2),
        ...(imagenBlob && { imagen_satelital: imagenBlob }),
      }));
    } catch (e) {
      console.error("Error calculando área:", e);
      alert("Error al calcular el área del polígono.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    for (const [key, value] of Object.entries(form)) {
      if (key === "imagen_satelital") {
        if (value instanceof File || value instanceof Blob)
          formData.append("imagen_satelital", value);
      } else if (key === "coordenadas") {
        formData.append("coordenadas", JSON.stringify(value));
      } else if (key !== "imagen_dron") {
        formData.append(key, value);
      }
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/lotes/${lote.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error al actualizar lote:", error.response?.data || error);
      alert("No se pudo actualizar el lote");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Área (ha)</Form.Label>
            <Form.Control
              type="text"
              value={form.area || ""}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Polígono del lote</Form.Label>
            <MapaLote
              onPoligonoCreado={handlePolygonChange}
              coordenadasIniciales={normalizeCoords(form.coordenadas)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              name="observacion"
              value={form.observacion || ""}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarLote;
