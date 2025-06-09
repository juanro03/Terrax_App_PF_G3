import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";
import MapaLote from "./MapaLote"; 

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

    if (!coordenadas) {
      alert("Debes seleccionar el área del lote en el mapa.");
      return;
    }

    const formData = new FormData();

    formData.append("nombre", form.nombre);
    formData.append("area", form.area);
    formData.append("imagen_satelital", imagenAutoGenerada ?? form.imagen_satelital);
    formData.append("observacion", form.observacion);
    //formData.append("campo", campoId); 
    formData.append("campo", parseInt(campoId, 10));
    formData.append("coordenadas", JSON.stringify(coordenadas));

    try {
      await axios.post("http://127.0.0.1:8000/api/lotes/", formData);
      onSuccess();
      onHide();
    } catch (error) {
      if (error.response) {
        //console.error("Detalles del error:", error.response.data);
        alert("Error al crear lote: " + JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("Error inesperado:", error);
        alert("Error inesperado al crear lote.");
      }
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
            <Form.Label>Área (ha)</Form.Label>
            <Form.Control
              type="number"
              name="area"
              value={form.area}
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

          {/* CAMPO DEL MAPA */}
          <Form.Group className="mb-3">
          <Form.Label>Seleccionar lote en el mapa</Form.Label>
          <MapaLote
            onPoligonoCreado={(coords, imagenBlob) => {
              console.log("imagenBlob:", imagenBlob);
              console.log("Es un File?", imagenBlob instanceof File);
              setCoordenadas(coords);
              setImagenAutoGenerada(imagenBlob);
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
