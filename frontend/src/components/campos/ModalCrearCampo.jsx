import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";

const ModalCrearCampo = ({ show, onHide, onSuccess }) => {
  const [form, setForm] = useState({
    nombre: "",
    provincia: "",
    localidad: "",
    cantidadLotes: "",
    imagen_satelital: null,
    observacion: "",
  });
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  useEffect(() => {
    axios.get("https://apis.datos.gob.ar/georef/api/provincias").then((res) => {
      setProvincias(res.data.provincias.map((p) => p.nombre).sort());
    });
  }, []);

  useEffect(() => {
    if (form.provincia) {
      axios
        .get(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${form.provincia}&max=1000`)
        .then((res) => {
          setLocalidades(res.data.localidades.map((l) => l.nombre).sort());
        });
    } else {
      setLocalidades([]);
    }
  }, [form.provincia]);

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
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await axios.post("http://127.0.0.1:8000/api/campos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error al crear campo:", error);
      alert("No se pudo crear el campo.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Campo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Nombre</Form.Label>
            <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Provincia</Form.Label>
            <Form.Select name="provincia" value={form.provincia} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {provincias.map((prov, i) => (
                <option key={i} value={prov}>{prov}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Localidad</Form.Label>
            <Form.Select name="localidad" value={form.localidad} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {localidades.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Cantidad de Lotes</Form.Label>
            <Form.Control type="number" name="cantidadLotes" value={form.cantidadLotes} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Imagen Satelital</Form.Label>
            <Form.Control type="file" name="imagen_satelital" accept="image/*" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Observaciones</Form.Label>
            <Form.Control as="textarea" name="observacion" value={form.observacion} onChange={handleChange} />
          </Form.Group>
          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">Cancelar</Button>
            <Button type="submit" variant="success">Guardar</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCrearCampo;

