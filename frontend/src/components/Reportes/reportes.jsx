import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reportes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [campoSeleccionado, setCampoSeleccionado] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [rol, setRol] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nuevoReporte, setNuevoReporte] = useState({
    productor: "",
    campo: "",
    lote: "",
    nombre: "",
    tipo_reporte: "",
    observaciones: "",
    archivo_pdf: null,
    fecha_reporte: "",
  });
  const [atributoFiltro, setAtributoFiltro] = useState("nombre");
  const [valorBusqueda, setValorBusqueda] = useState("");

  const token = localStorage.getItem("accessToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/usuarios/me/", { headers })
      .then((res) => setRol(res.data.rol))
      .catch((err) => console.error(err));

    axios
      .get("http://127.0.0.1:8000/api/reportes/", { headers })
      .then((res) => setReportes(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://127.0.0.1:8000/api/usuarios/", { headers })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (rol === "admin" && usuarioSeleccionado) {
      axios
        .get(
          `http://127.0.0.1:8000/api/campos/?usuario=${usuarioSeleccionado}`,
          { headers }
        )
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    } else if (rol !== "admin") {
      axios
        .get("http://127.0.0.1:8000/api/campos/", { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    }
    setCampoSeleccionado("");
    setLoteSeleccionado("");
    setLotes([]);
  }, [usuarioSeleccionado, rol]);

  useEffect(() => {
    if (nuevoReporte.campo) {
      axios
        .get(
          `http://127.0.0.1:8000/api/lotes/por-campo/${nuevoReporte.campo}`,
          { headers }
        )
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
    }
  }, [nuevoReporte.campo]);

  useEffect(() => {
    if (campoSeleccionado) {
      axios
        .get(`http://127.0.0.1:8000/api/lotes/por-campo/${campoSeleccionado}`, {
          headers,
        })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
      setLoteSeleccionado("");
    }
  }, [campoSeleccionado]);

  const handleCrearReporte = () => {
    const formData = new FormData();
    Object.entries(nuevoReporte).forEach(([key, value]) => {
      formData.append(key, value);
    });

    axios
      .post("http://127.0.0.1:8000/api/reportes/", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setReportes([...reportes, res.data]);
        setShowModal(false);
        setNuevoReporte({
          productor: "",
          campo: "",
          lote: "",
          nombre: "",
          tipo_reporte: "",
          observaciones: "",
          archivo_pdf: null,
          fecha_reporte: "",
        });
      })
      .catch((err) => console.error(err));
  };

  const reportesFiltrados = reportes.filter((r) => {
    const filtroBase =
      (!usuarioSeleccionado || r.productor === parseInt(usuarioSeleccionado)) &&
      (!campoSeleccionado || r.campo === parseInt(campoSeleccionado)) &&
      (!loteSeleccionado || r.lote === parseInt(loteSeleccionado));

    const valor = valorBusqueda.toLowerCase();

    if (!valor) return filtroBase;

    if (atributoFiltro === "nombre")
      return filtroBase && r.nombre.toLowerCase().includes(valor);

    if (atributoFiltro === "tipo_reporte")
      return filtroBase && r.tipo_reporte.toLowerCase().includes(valor);

    if (atributoFiltro === "productor") {
      const usuario = usuarios.find((u) => u.id === r.productor);
      return filtroBase && usuario?.email?.toLowerCase().includes(valor);
    }

    if (atributoFiltro === "campo") {
      const campo = campos.find((c) => c.id === r.campo);
      return filtroBase && campo?.nombre?.toLowerCase().includes(valor);
    }

    if (atributoFiltro === "fecha") {
      const fecha = new Date(r.fecha_reporte).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return filtroBase && fecha.toLowerCase().includes(valor);
    }

    return filtroBase;
  });

  const obtenerNombreCampo = (id) =>
    campos.find((c) => c.id === id)?.nombre || id;
  const obtenerNombreLote = (id) =>
    lotes.find((l) => l.id === id)?.nombre || id;
  const obtenerNombreUsuario = (id) =>
    usuarios.find((u) => u.id === id)?.email || id;

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
      axios
        .delete(`http://127.0.0.1:8000/api/reportes/${id}/`, { headers })
        .then(() => setReportes(reportes.filter((r) => r.id !== id)))
        .catch((err) => console.error(err));
    }
  };

  const opcionesUsuarios = usuarios.map((u) => ({
    value: u.id,
    label: u.email,
  }));
  const opcionesCampos = campos.map((c) => ({
    value: c.id,
    label: c.nombre,
  }));
  const opcionesLotes = lotes.map((l) => ({
    value: l.id,
    label: l.nombre,
  }));
  const opcionesFiltro = [
    { value: "nombre", label: "Nombre reporte" },
    { value: "tipo de reporte", label: "Tipo de reporte" },
    { value: "productor", label: "Usuario" },
    { value: "campo", label: "Campo" },
    { value: "fecha", label: "Fecha" },
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#28a745" : "#ced4da", // verde cuando está enfocado
      boxShadow: state.isFocused ? "0 0 0 1px #28a745" : "none",
      "&:hover": {
        borderColor: "#28a745",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#d4edda" // verde claro si está seleccionado
        : state.isFocused
        ? "#e9f7ef" // verde más tenue si está enfocado
        : null,
      color: "#000",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#28a745", // color verde para el texto seleccionado
    }),
  };

  return (
    <div className="reportes-container">
      <h2 className="text-3xl font-bold mb-4">Reportes</h2>

      {/* Subir Reporte */}
      {rol === "admin" && (
        <div className="mb-4">
          <button
            className="btn btn-success"
            onClick={() => setShowModal(true)}
          >
            Agregar nuevo reporte
          </button>
        </div>
      )}

      <div
        className="mb-3"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "180px" }}>
          <Select
            options={opcionesFiltro}
            value={opcionesFiltro.find((opt) => opt.value === atributoFiltro)}
            onChange={(opcion) => setAtributoFiltro(opcion.value)}
            styles={customStyles}
            isSearchable={false}
          />
        </div>

        <input
          type="text"
          placeholder={`Buscar por ${atributoFiltro}`}
          value={valorBusqueda}
          onChange={(e) => setValorBusqueda(e.target.value)}
          style={{
            height: "38px",
            borderRadius: "6px",
            border: "1px solid #ced4da",
            backgroundColor: "#fff",
            padding: "0 12px",
            fontSize: "14px",
            color: "#333",
            boxShadow: "none",
            width: "450px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={() => {
            setValorBusqueda("");
            setAtributoFiltro("nombre");
          }}
          style={{
            height: "38px",
            padding: "0 16px",
            fontSize: "14px",
            border: "1px solid #ced4da",
            borderRadius: "6px",
            backgroundColor: "#fff",
            color: "#333",
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros">
        {rol === "admin" && (
          <div className="filtro" style={{ minWidth: "250px" }}>
            <label>Usuario:</label>
            <Select
              options={[{ value: "", label: "Todos" }, ...opcionesUsuarios]}
              value={
                opcionesUsuarios.find(
                  (o) => o.value === usuarioSeleccionado
                ) || { value: "", label: "Todos" }
              }
              onChange={(opcion) => setUsuarioSeleccionado(opcion.value)}
              placeholder="Buscar usuario..."
              isSearchable
              styles={customStyles}
            />
          </div>
        )}

        <div className="filtro">
          <label>Campo:</label>
          <Select
            options={[{ value: "", label: "Todos" }, ...opcionesCampos]}
            value={
              opcionesCampos.find((o) => o.value === campoSeleccionado) || {
                value: "",
                label: "Todos",
              }
            }
            onChange={(opcion) => setCampoSeleccionado(opcion.value)}
            placeholder="Buscar campo..."
            isSearchable
            isDisabled={rol === "admin" && !usuarioSeleccionado}
            styles={customStyles}
          />
        </div>

        <div className="filtro">
          <label>Lote:</label>
          <Select
            options={[{ value: "", label: "Todos" }, ...opcionesLotes]}
            value={
              opcionesLotes.find((o) => o.value === loteSeleccionado) || {
                value: "",
                label: "Todos",
              }
            }
            onChange={(opcion) => setLoteSeleccionado(opcion.value)}
            placeholder="Buscar lote..."
            isSearchable
            isDisabled={!campoSeleccionado}
            styles={customStyles}
          />
        </div>
      </div>

      {/* Tabla reportes */}
      <table className="tabla-reportes">
        <thead>
          <tr>
            {rol === "admin" && <th>Usuario</th>}
            <th>Nombre</th>
            <th>Tipo</th> {/* ✅ nueva columna */}
            <th>Campo</th>
            <th>Lote</th>
            <th>Fecha</th>
            <th>Observaciones</th>
            <th>Archivo</th>
            {rol === "admin" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {reportesFiltrados.map((r) => (
            <tr key={r.id}>
              {rol === "admin" && <td>{obtenerNombreUsuario(r.productor)}</td>}
              <td>{r.nombre}</td>
              <td>{r.tipo_reporte}</td>
              <td>{obtenerNombreCampo(r.campo)}</td>
              <td>{obtenerNombreLote(r.lote)}</td>
              <td>{formatearFecha(r.fecha_reporte)}</td>
              <td>{r.observaciones}</td>
              <td>
                <a
                  href={r.archivo_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    size="2x"
                    className="text-red-600"
                  />
                  <span>Ver PDF</span>
                </a>
              </td>
              {rol === "admin" && (
                <td className="flex gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleEliminar(r.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de creación */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                as="select"
                value={nuevoReporte.productor}
                onChange={(e) =>
                  setNuevoReporte({
                    ...nuevoReporte,
                    productor: e.target.value,
                  })
                }
              >
                <option value="">Seleccione</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Campo</Form.Label>
              <Form.Control
                as="select"
                value={nuevoReporte.campo}
                onChange={(e) =>
                  setNuevoReporte({ ...nuevoReporte, campo: e.target.value })
                }
              >
                <option value="">Seleccione</option>
                {campos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Lote</Form.Label>
              <Form.Control
                as="select"
                value={nuevoReporte.lote}
                onChange={(e) =>
                  setNuevoReporte({ ...nuevoReporte, lote: e.target.value })
                }
              >
                <option value="">Seleccione</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nuevoReporte.nombre}
                onChange={(e) =>
                  setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Tipo de Reporte</Form.Label>
              <Form.Control
                type="text"
                value={nuevoReporte.tipo_reporte}
                onChange={(e) =>
                  setNuevoReporte({
                    ...nuevoReporte,
                    tipo_reporte: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Fecha del Reporte</Form.Label>
              <Form.Control
                type="datetime-local"
                value={nuevoReporte.fecha_reporte}
                onChange={(e) =>
                  setNuevoReporte({
                    ...nuevoReporte,
                    fecha_reporte: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={nuevoReporte.observaciones}
                onChange={(e) =>
                  setNuevoReporte({
                    ...nuevoReporte,
                    observaciones: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Archivo PDF</Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setNuevoReporte({
                    ...nuevoReporte,
                    archivo_pdf: e.target.files[0],
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCrearReporte}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reportes;
