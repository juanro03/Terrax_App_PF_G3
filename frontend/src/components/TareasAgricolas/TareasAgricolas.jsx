// src/components/TareasAgricolas/TareasAgricolas.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, ButtonGroup } from "react-bootstrap";
import axios from "../../axiosconfig";
import "bootstrap-icons/font/bootstrap-icons.css";
import TrazabilidadEmbed from "./TrazabilidadEmbed";

const verde = "#198754";
const verdeOscuro = "#155a36";
const blanco = "#fff";

const actividades = [
  "Fertilización",
  "Manejo de Malezas",
  "Laboreos de Lote",
  "Riego",
  "Aplicación Fitosanitaria",
];

const TIPO_MAP = {
  Fertilización: "fertilizacion",
  "Manejo de Malezas": "maleza",
  "Laboreos de Lote": "laboreo",
  Riego: "riego",
  "Aplicación Fitosanitaria": "fitosanitaria",
};

const TIPOS_LABOREO = [
  "Cincel",
  "Rastra disco",
  "Desmalezadora",
  "Rabasto",
  "Rolo",
  "Rastra diamante",
  "Disco, rastra y rolo",
  "Cultivador de campo",
  "Rabasto con rolo",
  "Labranza convencional",
];

export default function ActividadesAgricolas() {
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [actividad, setActividad] = useState("");
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [mensaje, setMensaje] = useState("");
  const [mensajeOk, setMensajeOk] = useState(true);

  const [showTraz, setShowTraz] = useState(true);

  // ---- estados por actividad
  const [fertVista, setFertVista] = useState("variable");
  const [fert, setFert] = useState({
    fecha: "", tipoFertilizante: "", de: "", productoAplicar: "",
    concentracion: "", fabricante: "", litrosPorHa: "", hectareasAplicadas: "",
    observaciones: "", mapaAdjunto: null,
  });

  const [riego, setRiego] = useState({ fecha: "", tipoRiego: "", volumen: "", observaciones: "" });
  const [laboreo, setLaboreo] = useState({ fecha: "", tipoLaboreo: "", operario: "", observaciones: "" });
  const [maleza, setMaleza] = useState({
    fecha: "", tipoFitosanitario: "", plagaMaleza: "", productoAplicar: "",
    fabricante: "", lkgPorHa: "", hectareasAplicadas: "", observaciones: "", mapaVariable: null,
  });
  const [fito, setFito] = useState({
    fecha: "", porcentaje: "", plaga: "", estadoFen: "", producto: "", maquinaria: "",
    mapa: false, observaciones: "",
  });

  // ---- cargar listas
  useEffect(() => {
    axios.get("/api/campos/").then(r => setCampos(r.data)).catch(console.error);
  }, []);
  useEffect(() => {
    if (!campo) return setLotes([]);
    axios.get(`/api/lotes/por-campo/${campo}/`)
      .then(r => setLotes(r.data))
      .catch(() => setLotes([]));
  }, [campo]);

  // ---- helpers
  const limpiarFormularioActividad = () => {
    if (actividad === "Fertilización") setFert({
      fecha: "", tipoFertilizante: "", de: "", productoAplicar: "",
      concentracion: "", fabricante: "", litrosPorHa: "", hectareasAplicadas: "",
      observaciones: "", mapaAdjunto: null,
    });
    if (actividad === "Riego") setRiego({ fecha: "", tipoRiego: "", volumen: "", observaciones: "" });
    if (actividad === "Laboreos de Lote") setLaboreo({ fecha: "", tipoLaboreo: "", operario: "", observaciones: "" });
    if (actividad === "Manejo de Malezas") setMaleza({
      fecha: "", tipoFitosanitario: "", plagaMaleza: "", productoAplicar: "",
      fabricante: "", lkgPorHa: "", hectareasAplicadas: "", observaciones: "", mapaVariable: null,
    });
    if (actividad === "Aplicación Fitosanitaria") setFito({
      fecha: "", porcentaje: "", plaga: "", estadoFen: "", producto: "", maquinaria: "",
      mapa: false, observaciones: "",
    });
  };

  const handleNuevaTareaMismoLote = () => { limpiarFormularioActividad(); setMensaje(""); };
  const handleNuevaTareaOtroLote = () => { limpiarFormularioActividad(); setActividad(""); setLote(""); setMensaje(""); };

  // ---- submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const tipoKey = TIPO_MAP[actividad];
    if (!tipoKey) { setMensajeOk(false); setMensaje("Actividad inválida."); setTimeout(() => setMensaje(""), 3500); return; }
    if (!lote) { setMensajeOk(false); setMensaje("Selecciona un lote."); setTimeout(() => setMensaje(""), 3500); return; }

    const formData = new FormData();
    formData.append("lote", lote);
    formData.append("tipo", tipoKey);

    try {
      if (actividad === "Fertilización") {
        if (!fert.fecha) throw new Error("La fecha es obligatoria.");
        formData.append("fecha", fert.fecha);
        formData.append("observaciones", fert.observaciones || "");
        formData.append("dosis_tipo", fertVista);
        formData.append("tipo_fertilizante", fert.tipoFertilizante || "");
        formData.append("de", fert.de || "");
        formData.append("producto_aplicar", fert.productoAplicar || "");
        formData.append("concentracion", fert.concentracion || "");
        formData.append("fabricante", fert.fabricante || "");
        formData.append("litros_por_ha", fert.litrosPorHa || "");
        formData.append("hectareas_aplicadas", fert.hectareasAplicadas || "");
        if (fertVista === "variable" && fert.mapaAdjunto) formData.append("mapa_adjunto", fert.mapaAdjunto);
      } else if (actividad === "Riego") {
        if (!riego.fecha) throw new Error("La fecha es obligatoria.");
        formData.append("fecha", riego.fecha);
        formData.append("observaciones", riego.observaciones || "");
        formData.append("tipo_riego", riego.tipoRiego || "");
        formData.append("volumen", riego.volumen || "");
      } else if (actividad === "Laboreos de Lote") {
        if (!laboreo.fecha) throw new Error("La fecha es obligatoria.");
        formData.append("fecha", laboreo.fecha);
        formData.append("observaciones", laboreo.observaciones || "");
        formData.append("tipo_laboreo", laboreo.tipoLaboreo || "");
        formData.append("operario", laboreo.operario || "");
      } else if (actividad === "Manejo de Malezas") {
        if (!maleza.fecha) throw new Error("La fecha es obligatoria.");
        formData.append("fecha", maleza.fecha);
        formData.append("observaciones", maleza.observaciones || "");
        formData.append("tipo_fitosanitario", maleza.tipoFitosanitario || "");
        formData.append("plaga_maleza", maleza.plagaMaleza || "");
        formData.append("producto_aplicar", maleza.productoAplicar || "");
        formData.append("fabricante", maleza.fabricante || "");
        formData.append("lkg_por_ha", maleza.lkgPorHa || "");
        formData.append("hectareas_aplicadas", maleza.hectareasAplicadas || "");
        if (maleza.mapaVariable) formData.append("mapa_variable", maleza.mapaVariable);
      } else if (actividad === "Aplicación Fitosanitaria") {
        if (!fito.fecha) throw new Error("La fecha es obligatoria.");
        formData.append("fecha", fito.fecha);
        formData.append("dosis_tipo", "variable");
        formData.append("plaga_maleza", fito.plaga || "");
        formData.append("producto_aplicar", fito.producto || "");
        const extras = [];
        if (fito.porcentaje) extras.push(`% afectado: ${fito.porcentaje}`);
        if (fito.estadoFen) extras.push(`Estado fenológico: ${fito.estadoFen}`);
        if (fito.maquinaria) extras.push(`Maquinaria: ${fito.maquinaria}`);
        extras.push(`Mapa: ${fito.mapa ? "sí" : "no"}`);
        const obs = [fito.observaciones, extras.join(" · ")].filter(Boolean).join(" | ");
        formData.append("observaciones", obs);
      }

      await axios.post("/api/tareas/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMensajeOk(true);
      setMensaje("¡Actividad registrada correctamente!");
      setRefreshKey((k) => k + 1);

    } catch (err) {
      setMensajeOk(false);
      const texto = err?.response?.data
        ? (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data))
        : err?.message || "Error desconocido";
      setMensaje("Error al registrar: " + texto);
    } finally {
      setTimeout(() => setMensaje(""), 8000);
    }
  };

  const canSubmit = Boolean(
    lote && actividad && (
      (actividad === "Fertilización" && fert.fecha) ||
      (actividad === "Riego" && riego.fecha) ||
      (actividad === "Laboreos de Lote" && laboreo.fecha) ||
      (actividad === "Manejo de Malezas" && maleza.fecha) ||
      (actividad === "Aplicación Fitosanitaria" && fito.fecha)
    )
  );

  return (
    <Card className="mx-auto my-5 shadow"
      style={{
        maxWidth: 1160,
        background: blanco,
        borderRadius: "1.4rem",
        border: "none",
        transform: "none",
        transition: "none"
      }}>
      <Card.Body>
        <Card.Title className="fw-bold mb-3" style={{ color: verdeOscuro }}>
          Registrar Actividad Agrícola
        </Card.Title>

        {mensaje && (
          <div className={`alert ${mensajeOk ? "alert-success" : "alert-danger"}`} style={{ fontWeight: "bold", whiteSpace: "pre-wrap" }}>
            {mensaje}
            {mensajeOk && (
              <div className="mt-2 d-flex gap-2">
                <Button size="sm" variant="success" className="rounded-pill px-3" onClick={handleNuevaTareaMismoLote}>
                  + Agregar otra tarea
                </Button>
                <Button size="sm" variant="outline-secondary" className="rounded-pill px-3" onClick={handleNuevaTareaOtroLote}>
                  Cambiar lote/campo
                </Button>
              </div>
            )}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>Campo</Form.Label>
              <Form.Select
                value={campo}
                onChange={(e) => { setCampo(e.target.value); setLote(""); }}
                required
                className="input-terrax"
              >
                <option value="">Seleccione un campo</option>
                {campos.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>Lote</Form.Label>
              <Form.Select
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                disabled={!campo}
                required
                className="input-terrax"
              >
                <option value="">Seleccione un lote</option>
                {lotes.map((l) => (<option key={l.id} value={l.id}>{l.nombre}</option>))}
              </Form.Select>
              {campo && lotes.length === 0 && (
                <div style={{ color: "#d9534f", marginTop: 6, fontSize: "0.95rem" }}>
                  No hay lotes asociados a este campo.
                </div>
              )}
            </Col>

            <Col md={4}>
              <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>Actividad</Form.Label>
              <Form.Select
                value={actividad}
                onChange={(e) => { setActividad(e.target.value); setFertVista("variable"); limpiarFormularioActividad(); }}
                required
                className="input-terrax"
                disabled={lotes.length === 0}
              >
                <option value="">Seleccione actividad</option>
                {actividades.map((a) => (<option key={a} value={a}>{a}</option>))}
              </Form.Select>
            </Col>
          </Row>

          {/* Formularios por actividad (igual que antes) */}
          {actividad === "Fertilización" && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: verdeOscuro, margin: 0 }}>
                  Fertilización · {fertVista === "variable" ? "Dosis Variable" : "Dosis Fija"}
                </h5>
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant={fertVista === "variable" ? "success" : "outline-success"}
                    onClick={() => { setFertVista("variable"); setFert((p) => ({ ...p, mapaAdjunto: null })); }}
                  >
                    Dosis Variable
                  </Button>
                  <Button
                    size="sm"
                    variant={fertVista === "fija" ? "success" : "outline-success"}
                    onClick={() => { setFertVista("fija"); setFert((p) => ({ ...p, mapaAdjunto: null })); }}
                  >
                    Dosis Fija
                  </Button>
                </ButtonGroup>
              </div>

              <Row className="g-3">
                <Col md={4}><Form.Label>Fecha</Form.Label>
                  <Form.Control type="date" value={fert.fecha} onChange={(e) => setFert({ ...fert, fecha: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>Tipo de fertilizante</Form.Label>
                  <Form.Control value={fert.tipoFertilizante} onChange={(e) => setFert({ ...fert, tipoFertilizante: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>De</Form.Label>
                  <Form.Control value={fert.de} onChange={(e) => setFert({ ...fert, de: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>Producto a aplicar</Form.Label>
                  <Form.Control value={fert.productoAplicar} onChange={(e) => setFert({ ...fert, productoAplicar: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>Concentración</Form.Label>
                  <Form.Control value={fert.concentracion} onChange={(e) => setFert({ ...fert, concentracion: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>Fabricante</Form.Label>
                  <Form.Control value={fert.fabricante} onChange={(e) => setFert({ ...fert, fabricante: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>L/Kg por Ha</Form.Label>
                  <Form.Control value={fert.litrosPorHa} onChange={(e) => setFert({ ...fert, litrosPorHa: e.target.value })} />
                </Col>
                <Col md={4}><Form.Label>Ha aplicadas</Form.Label>
                  <Form.Control value={fert.hectareasAplicadas} onChange={(e) => setFert({ ...fert, hectareasAplicadas: e.target.value })} />
                </Col>
                {fertVista === "variable" && (
                  <Col md={4}><Form.Label>Mapa adjunto</Form.Label>
                    <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFert({ ...fert, mapaAdjunto: e.target.files?.[0] || null })} />
                    {fert.mapaAdjunto && <small className="text-muted">{fert.mapaAdjunto.name}</small>}
                  </Col>
                )}
                <Col md={12}><Form.Label>Observaciones</Form.Label>
                  <Form.Control as="textarea" rows={2} value={fert.observaciones}
                    onChange={(e) => setFert({ ...fert, observaciones: e.target.value })} />
                </Col>
              </Row>
            </>
          )}

          {actividad === "Riego" && (
            <Row className="g-3">
              <Col md={4}><Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={riego.fecha} onChange={(e) => setRiego({ ...riego, fecha: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Tipo de riego</Form.Label>
                <Form.Control value={riego.tipoRiego} onChange={(e) => setRiego({ ...riego, tipoRiego: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Volumen (mm)</Form.Label>
                <Form.Control value={riego.volumen} onChange={(e) => setRiego({ ...riego, volumen: e.target.value })} />
              </Col>
              <Col md={12}><Form.Label>Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} value={riego.observaciones}
                  onChange={(e) => setRiego({ ...riego, observaciones: e.target.value })} />
              </Col>
            </Row>
          )}

          {actividad === "Laboreos de Lote" && (
            <Row className="g-3">
              <Col md={4}><Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={laboreo.fecha} onChange={(e) => setLaboreo({ ...laboreo, fecha: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Tipo de laboreo</Form.Label>
                <Form.Select value={laboreo.tipoLaboreo} onChange={(e) => setLaboreo({ ...laboreo, tipoLaboreo: e.target.value })}>
                  <option value="">Seleccione tipo de laboreo</option>
                  {TIPOS_LABOREO.map(op => <option key={op} value={op}>{op}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}><Form.Label>Operario</Form.Label>
                <Form.Control value={laboreo.operario} onChange={(e) => setLaboreo({ ...laboreo, operario: e.target.value })} />
              </Col>
              <Col md={12}><Form.Label>Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} value={laboreo.observaciones}
                  onChange={(e) => setLaboreo({ ...laboreo, observaciones: e.target.value })} />
              </Col>
            </Row>
          )}

          {actividad === "Manejo de Malezas" && (
            <Row className="g-3">
              <Col md={4}><Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={maleza.fecha} onChange={(e) => setMaleza({ ...maleza, fecha: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Tipo de fitosanitarios</Form.Label>
                <Form.Control value={maleza.tipoFitosanitario} onChange={(e) => setMaleza({ ...maleza, tipoFitosanitario: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Plaga / Maleza</Form.Label>
                <Form.Control value={maleza.plagaMaleza} onChange={(e) => setMaleza({ ...maleza, plagaMaleza: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Producto a aplicar</Form.Label>
                <Form.Control value={maleza.productoAplicar} onChange={(e) => setMaleza({ ...maleza, productoAplicar: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Fabricante</Form.Label>
                <Form.Control value={maleza.fabricante} onChange={(e) => setMaleza({ ...maleza, fabricante: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>L/Kg por Ha</Form.Label>
                <Form.Control value={maleza.lkgPorHa} onChange={(e) => setMaleza({ ...maleza, lkgPorHa: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Ha aplicadas</Form.Label>
                <Form.Control value={maleza.hectareasAplicadas} onChange={(e) => setMaleza({ ...maleza, hectareasAplicadas: e.target.value })} />
              </Col>
              <Col md={8}><Form.Label>Mapa de aplicación variable</Form.Label>
                <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setMaleza({ ...maleza, mapaVariable: e.target.files?.[0] || null })} />
                {maleza.mapaVariable && <small className="text-muted">{maleza.mapaVariable.name}</small>}
              </Col>
              <Col md={12}><Form.Label>Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} value={maleza.observaciones}
                  onChange={(e) => setMaleza({ ...maleza, observaciones: e.target.value })} />
              </Col>
            </Row>
          )}

          {actividad === "Aplicación Fitosanitaria" && (
            <Row className="g-3">
              <Col md={4}><Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={fito.fecha} onChange={(e) => setFito({ ...fito, fecha: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>% Afectado</Form.Label>
                <Form.Control value={fito.porcentaje} onChange={(e) => setFito({ ...fito, porcentaje: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Plaga</Form.Label>
                <Form.Control value={fito.plaga} onChange={(e) => setFito({ ...fito, plaga: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Estado Fenológico</Form.Label>
                <Form.Control value={fito.estadoFen} onChange={(e) => setFito({ ...fito, estadoFen: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Producto</Form.Label>
                <Form.Control value={fito.producto} onChange={(e) => setFito({ ...fito, producto: e.target.value })} />
              </Col>
              <Col md={4}><Form.Label>Maquinaria</Form.Label>
                <Form.Control value={fito.maquinaria} onChange={(e) => setFito({ ...fito, maquinaria: e.target.value })} />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Form.Check type="switch" id="fito-mapa" label="Incluye mapa"
                  checked={!!fito.mapa} onChange={(e) => setFito({ ...fito, mapa: e.target.checked })} />
              </Col>
              <Col md={12}><Form.Label>Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} value={fito.observaciones}
                  onChange={(e) => setFito({ ...fito, observaciones: e.target.value })} />
              </Col>
            </Row>
          )}

          <div className="d-flex align-items-center mt-4 gap-2">
            <Button variant="success" type="submit" disabled={!canSubmit}>Registrar Actividad</Button>

          </div>
        </Form>

        {showTraz && (
          <div className="mt-4 p-3 rounded-4" style={{ background: "#f3fbf6", border: "1px solid #d9efe3" }}>
            <h5 className="fw-bold mb-3" style={{ color: verdeOscuro }}>Trazabilidad Agrícola</h5>
            <TrazabilidadEmbed campos={campos} lotes={lotes} refreshKey={refreshKey} />

          </div>
        )}
      </Card.Body>
    </Card>
  );
}
