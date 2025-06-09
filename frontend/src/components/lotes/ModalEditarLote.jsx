import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";
import MapaLote from "./MapaLote"; // ← Asegurate que este sea tu componente para seleccionar polígono

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

  const handlePolygonChange = (coordenadas, imagenBlob) => {
  setForm((prev) => ({
    ...prev,
    coordenadas,
    ...(imagenBlob && { imagen_satelital: imagenBlob }),
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const [key, value] of Object.entries(form)) {
        if (key === "imagen_satelital") {
            if (value instanceof File) {
            formData.append("imagen_satelital", value);
            }
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
            <Form.Label>Área (hectáreas)</Form.Label>
            <Form.Control
              type="number"
              name="area"
              value={form.area || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Seleccionar polígono del lote</Form.Label>
            <MapaLote
                onPoligonoCreado={handlePolygonChange}
                coordenadasIniciales={form.coordenadas}
            />

          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              name="observacion"
              value={form.observacion || ""}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarLote;
