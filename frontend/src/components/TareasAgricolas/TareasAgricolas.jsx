import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  ButtonGroup,
} from "react-bootstrap";
import axios from "../../axiosconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

// PALETA DE COLORES
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

// Mapa actividad (UI) -> key del modelo
const TIPO_MAP = {
  Fertilización: "fertilizacion",
  "Manejo de Malezas": "maleza",
  "Laboreos de Lote": "laboreo",
  Riego: "riego",
  "Aplicación Fitosanitaria": "fitosanitaria",
};

// Opciones para "Tipo de laboreo"
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

  // Mensajes UI
  const [mensaje, setMensaje] = useState("");
  const [mensajeOk, setMensajeOk] = useState(true);

  // Fertilización
  const [fertVista, setFertVista] = useState("variable"); // 'variable' | 'fija'
  const [rowsFert, setRowsFert] = useState([]);

  // Aplicación Fitosanitaria (si luego agregás fija/variable lo vas a usar)
  const [fitoVista] = useState("variable");

  // Actividades separadas
  const [rowsRiego, setRowsRiego] = useState([]); // Riego
  const [rowsLaboreos, setRowsLaboreos] = useState([]); // Laboreos de lote
  const [rowsMaleza, setRowsMaleza] = useState([]); // Manejo de malezas
  const [rowsFito, setRowsFito] = useState([]); // Aplicación Fitosanitaria

  useEffect(() => {
    axios
      .get("/api/campos/")
      .then((r) => setCampos(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!campo) return setLotes([]);
    axios
      .get(`/api/lotes/por-campo/${campo}/`)
      .then((r) => setLotes(r.data))
      .catch(() => setLotes([]));
  }, [campo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // qué filas se envían según actividad
    let tareas = [];
    if (actividad === "Fertilización") tareas = rowsFert;
    else if (actividad === "Riego") tareas = rowsRiego;
    else if (actividad === "Laboreos de Lote") tareas = rowsLaboreos;
    else if (actividad === "Manejo de Malezas") tareas = rowsMaleza;
    else if (actividad === "Aplicación Fitosanitaria") tareas = rowsFito;

    // Validar que todas las filas tengan fecha
    if (tareas.length === 0 || tareas.some((t) => !t.fecha)) {
      setMensajeOk(false);
      setMensaje("Debes completar la fecha en todas las filas.");
      setTimeout(() => setMensaje(""), 3500);
      return;
    }

    const tipoKey = TIPO_MAP[actividad];
    if (!tipoKey) {
      setMensajeOk(false);
      setMensaje("Actividad inválida.");
      setTimeout(() => setMensaje(""), 3500);
      return;
    }

    let todoOk = true;
    let primerError = null;

    for (const tarea of tareas) {
      const formData = new FormData();

      // Campos comunes
      formData.append("lote", lote);
      formData.append("tipo", tipoKey);
      formData.append("fecha", tarea.fecha || "");
      formData.append("observaciones", tarea.observaciones || "");

      // Campos específicos según actividad
      if (actividad === "Fertilización") {
        formData.append("dosis_tipo", fertVista); // 'fija' o 'variable'
        formData.append("tipo_fertilizante", tarea.tipoFertilizante || "");
        formData.append("de", tarea.de || "");
        formData.append("producto_aplicar", tarea.productoAplicar || "");
        formData.append("concentracion", tarea.concentracion || "");
        formData.append("fabricante", tarea.fabricante || "");
        formData.append("litros_por_ha", tarea.litrosPorHa || "");
        formData.append("hectareas_aplicadas", tarea.hectareasAplicadas || "");
        if (fertVista === "variable" && tarea.mapaAdjunto)
          formData.append("mapa_adjunto", tarea.mapaAdjunto);
      }

      if (actividad === "Riego") {
        formData.append("tipo_riego", tarea.tipoRiego || "");
        formData.append("volumen", tarea.volumen || "");
      }

      if (actividad === "Laboreos de Lote") {
        formData.append("tipo_laboreo", tarea.tipoLaboreo || "");
        formData.append("operario", tarea.operario || "");
      }

      if (actividad === "Manejo de Malezas") {
        formData.append("tipo_fitosanitario", tarea.tipoFitosanitario || "");
        formData.append("plaga_maleza", tarea.plagaMaleza || "");
        formData.append("producto_aplicar", tarea.productoAplicar || "");
        formData.append("fabricante", tarea.fabricante || "");
        formData.append("lkg_por_ha", tarea.lkgPorHa || "");
        formData.append("hectareas_aplicadas", tarea.hectareasAplicadas || "");
        if (tarea.mapaVariable)
          formData.append("mapa_variable", tarea.mapaVariable);
      }

      if (actividad === "Aplicación Fitosanitaria") {
        // Solo campos existentes en el modelo:
        formData.append("dosis_tipo", fitoVista); // 'variable' o 'fija'
        formData.append("plaga_maleza", tarea.plaga || "");
        formData.append("producto_aplicar", tarea.producto || "");

        // Si querés guardar extras (porcentaje/maquinaria/mapa) sin tocar el modelo:
        const extras = [];
        if (tarea.porcentaje) extras.push(`% afectado: ${tarea.porcentaje}`);
        if (tarea.maquinaria) extras.push(`Maquinaria: ${tarea.maquinaria}`);
        if (typeof tarea.mapa !== "undefined")
          extras.push(`Mapa: ${tarea.mapa ? "sí" : "no"}`);

        if (extras.length) {
          const obs = (tarea.observaciones || "") + " | " + extras.join(" · ");
          formData.set("observaciones", obs);
        }
        // Si más adelante agregás archivos:
        // if (tarea.mapaAdjunto) formData.append("mapa_adjunto", tarea.mapaAdjunto);
      }

      try {
        await axios.post("/api/tareas/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        todoOk = false;
        if (!primerError)
          primerError = err?.response?.data || err?.message || err;
        console.error(
          "Error al registrar la tarea:",
          err?.response?.data || err
        );
        break; // cortamos el loop para no seguir enviando
      }
    }

    if (todoOk) {
      setMensajeOk(true);
      setMensaje("¡Actividad registrada correctamente!");
      // reset
      setCampo("");
      setLote("");
      setActividad("");
      setRowsFert([]);
      setRowsRiego([]);
      setRowsLaboreos([]);
      setRowsMaleza([]);
      setRowsFito([]);
    } else {
      setMensajeOk(false);
      setMensaje(
        "Error al registrar: " +
          (typeof primerError === "object"
            ? JSON.stringify(primerError)
            : String(primerError || ""))
      );
    }

    setTimeout(() => setMensaje(""), 4500);
  };

  // helpers
  const updateRow = (setFn, idx, field, value) =>
    setFn((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  const eliminarRow = (setFn, idx) =>
    setFn((prev) => prev.filter((_, i) => i !== idx));

  // ===== FERTILIZACIÓN =====
  const addRowFert = () => {
    const base = {
      lote,
      fecha: "",
      tipoFertilizante: "",
      de: "",
      productoAplicar: "",
      concentracion: "",
      fabricante: "",
      litrosPorHa: "",
      hectareasAplicadas: "",
      observaciones: "",
    };
    const extra = fertVista === "variable" ? { mapaAdjunto: null } : {};
    setRowsFert((p) => [...p, { ...base, ...extra }]);
  };

  const headersFert = () => {
    const comunes = ["ID Lote", "Fecha"];
    const base = [
      "Tipo de fertilizante",
      "De",
      "Producto a aplicar",
      "Concentración",
      "Fabricante",
      "L/Kg por Ha",
      "Ha aplicadas",
    ];
    const extra = fertVista === "variable" ? ["Mapa adjunto"] : [];
    return [...comunes, ...base, ...extra, "Observaciones", ""];
  };

  const rowFert = (r, i) => [
    <td key="idx">{i + 1}</td>,
    <td key="fecha">
      <Form.Control
        size="sm"
        type="date"
        value={r.fecha || ""}
        onChange={(e) => updateRow(setRowsFert, i, "fecha", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td key="tipo">
      <Form.Control
        size="sm"
        value={r.tipoFertilizante || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "tipoFertilizante", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="de">
      <Form.Control
        size="sm"
        value={r.de || ""}
        onChange={(e) => updateRow(setRowsFert, i, "de", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td key="prod">
      <Form.Control
        size="sm"
        value={r.productoAplicar || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "productoAplicar", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="conc">
      <Form.Control
        size="sm"
        value={r.concentracion || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "concentracion", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="fab">
      <Form.Control
        size="sm"
        value={r.fabricante || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "fabricante", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="lkh">
      <Form.Control
        size="sm"
        value={r.litrosPorHa || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "litrosPorHa", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="has">
      <Form.Control
        size="sm"
        value={r.hectareasAplicadas || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "hectareasAplicadas", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    ...(fertVista === "variable"
      ? [
          <td key="mapa">
            <Form.Control
              size="sm"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ padding: "2px 4px", fontSize: "0.8rem", height: 25 }}
              onChange={(e) =>
                updateRow(
                  setRowsFert,
                  i,
                  "mapaAdjunto",
                  e.target.files?.[0] || null
                )
              }
            />
            {r.mapaAdjunto && (
              <small className="text-muted">{r.mapaAdjunto.name}</small>
            )}
          </td>,
        ]
      : []),
    <td key="obs">
      <Form.Control
        size="sm"
        value={r.observaciones || ""}
        onChange={(e) =>
          updateRow(setRowsFert, i, "observaciones", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="act" className="text-center">
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => eliminarRow(setRowsFert, i)}
      >
        <i className="bi bi-trash" />
      </Button>
    </td>,
  ];

  // ===== RIEGO =====
  const headersRiego = [
    "ID Lote",
    "Fecha",
    "Tipo de riego",
    "Volumen (mm)",
    "Observaciones",
    "",
  ];
  const addRowRiego = () =>
    setRowsRiego((p) => [
      ...p,
      { lote, fecha: "", tipoRiego: "", volumen: "", observaciones: "" },
    ]);
  const rowRiego = (r, i) => [
    <td key="idx">{i + 1}</td>,
    <td key="fecha">
      <Form.Control
        size="sm"
        type="date"
        value={r.fecha || ""}
        onChange={(e) => updateRow(setRowsRiego, i, "fecha", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td key="tipo">
      <Form.Control
        size="sm"
        value={r.tipoRiego || ""}
        onChange={(e) =>
          updateRow(setRowsRiego, i, "tipoRiego", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="vol">
      <Form.Control
        size="sm"
        value={r.volumen || ""}
        onChange={(e) => updateRow(setRowsRiego, i, "volumen", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td key="obs">
      <Form.Control
        size="sm"
        value={r.observaciones || ""}
        onChange={(e) =>
          updateRow(setRowsRiego, i, "observaciones", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="act" className="text-center">
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => eliminarRow(setRowsRiego, i)}
      >
        <i className="bi bi-trash" />
      </Button>
    </td>,
  ];

  // ===== LABOREOS DE LOTE =====
  const headersLaboreos = [
    "ID Lote",
    "Fecha",
    "Tipo de laboreo",
    "Operario",
    "Observaciones",
    "",
  ];
  const addRowLaboreos = () =>
    setRowsLaboreos((p) => [
      ...p,
      { lote, fecha: "", tipoLaboreo: "", operario: "", observaciones: "" },
    ]);
  const rowLaboreos = (r, i) => [
    <td key="idx">{i + 1}</td>,
    <td key="fecha">
      <Form.Control
        size="sm"
        type="date"
        value={r.fecha || ""}
        onChange={(e) => updateRow(setRowsLaboreos, i, "fecha", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td key="tipo">
      <Form.Select
        size="sm"
        value={r.tipoLaboreo || ""}
        onChange={(e) =>
          updateRow(setRowsLaboreos, i, "tipoLaboreo", e.target.value)
        }
        className="input-terrax"
      >
        <option value="">Seleccione tipo de laboreo</option>
        {TIPOS_LABOREO.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </Form.Select>
    </td>,
    <td key="oper">
      <Form.Control
        size="sm"
        value={r.operario || ""}
        onChange={(e) =>
          updateRow(setRowsLaboreos, i, "operario", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="obs">
      <Form.Control
        size="sm"
        value={r.observaciones || ""}
        onChange={(e) =>
          updateRow(setRowsLaboreos, i, "observaciones", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="act" className="text-center">
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => eliminarRow(setRowsLaboreos, i)}
      >
        <i className="bi bi-trash" />
      </Button>
    </td>,
  ];

  // ===== MANEJO DE MALEZAS =====
  const headersMaleza = [
    "ID Lote",
    "Fecha",
    "Tipo de fitosanitarios",
    "Plaga/Maleza",
    "Producto a aplicar",
    "Fabricante",
    "L/Kg por Ha",
    "Cantidad de hectáreas aplicadas",
    "Observaciones",
    "Mapa de aplicación variable",
    "",
  ];
  const addRowMaleza = () =>
    setRowsMaleza((p) => [
      ...p,
      {
        lote,
        fecha: "",
        tipoFitosanitario: "",
        plagaMaleza: "",
        productoAplicar: "",
        fabricante: "",
        lkgPorHa: "",
        hectareasAplicadas: "",
        observaciones: "",
        mapaVariable: null,
      },
    ]);
  const rowMaleza = (r, i) => [
    <td key="idx">{i + 1}</td>,
    <td key="fecha">
      <Form.Control
        size="sm"
        type="date"
        value={r.fecha || ""}
        onChange={(e) => updateRow(setRowsMaleza, i, "fecha", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td key="tipoF">
      <Form.Control
        size="sm"
        value={r.tipoFitosanitario || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "tipoFitosanitario", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="plaga">
      <Form.Control
        size="sm"
        value={r.plagaMaleza || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "plagaMaleza", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="prod">
      <Form.Control
        size="sm"
        value={r.productoAplicar || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "productoAplicar", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="fab">
      <Form.Control
        size="sm"
        value={r.fabricante || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "fabricante", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="lkh">
      <Form.Control
        size="sm"
        value={r.lkgPorHa || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "lkgPorHa", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="has">
      <Form.Control
        size="sm"
        value={r.hectareasAplicadas || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "hectareasAplicadas", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="obs">
      <Form.Control
        size="sm"
        value={r.observaciones || ""}
        onChange={(e) =>
          updateRow(setRowsMaleza, i, "observaciones", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td key="mapa">
      <Form.Control
        size="sm"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ padding: "2px 4px", fontSize: "0.8rem", height: 25 }}
        onChange={(e) =>
          updateRow(
            setRowsMaleza,
            i,
            "mapaVariable",
            e.target.files?.[0] || null
          )
        }
      />
      {r.mapaVariable && (
        <small className="text-muted">{r.mapaVariable.name}</small>
      )}
    </td>,
    <td key="act" className="text-center">
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => eliminarRow(setRowsMaleza, i)}
      >
        <i className="bi bi-trash" />
      </Button>
    </td>,
  ];

  // ===== APLICACIÓN FITOSANITARIA (versión simple) =====
  const headersFito = [
    "Lote",
    "Fecha",
    "% Afectado",
    "Plaga",
    "Estado Fenológico",
    "Producto",
    "Maquinaria",
    "Mapa",
    "Observaciones",
    "",
  ];
  const addRowFito = () =>
    setRowsFito((p) => [
      ...p,
      {
        lote,
        fecha: "",
        porcentaje: "",
        plaga: "",
        estadoFen: "",
        producto: "",
        maquinaria: "",
        mapa: false,
        observaciones: "",
      },
    ]);
  const rowFito = (r, i) => [
    <td>{i + 1}</td>,
    <td>
      <Form.Control
        size="sm"
        type="date"
        value={r.fecha || ""}
        onChange={(e) => updateRow(setRowsFito, i, "fecha", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td>
      <Form.Control
        size="sm"
        value={r.porcentaje || ""}
        onChange={(e) =>
          updateRow(setRowsFito, i, "porcentaje", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td>
      <Form.Control
        size="sm"
        value={r.plaga || ""}
        onChange={(e) => updateRow(setRowsFito, i, "plaga", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td>
      <Form.Control
        size="sm"
        value={r.estadoFen || ""}
        onChange={(e) => updateRow(setRowsFito, i, "estadoFen", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td>
      <Form.Control
        size="sm"
        value={r.producto || ""}
        onChange={(e) => updateRow(setRowsFito, i, "producto", e.target.value)}
        className="input-terrax"
      />
    </td>,
    <td>
      <Form.Control
        size="sm"
        value={r.maquinaria || ""}
        onChange={(e) =>
          updateRow(setRowsFito, i, "maquinaria", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td className="text-center">
      <Form.Check
        checked={!!r.mapa}
        onChange={(e) => updateRow(setRowsFito, i, "mapa", e.target.checked)}
      />
    </td>,
    <td>
      <Form.Control
        size="sm"
        value={r.observaciones || ""}
        onChange={(e) =>
          updateRow(setRowsFito, i, "observaciones", e.target.value)
        }
        className="input-terrax"
      />
    </td>,
    <td className="text-center">
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => eliminarRow(setRowsFito, i)}
      >
        <i className="bi bi-trash" />
      </Button>
    </td>,
  ];

  // habilitar submit según la actividad visible
  const canSubmit =
    actividad === "Fertilización"
      ? rowsFert.length > 0
      : actividad === "Riego"
      ? rowsRiego.length > 0
      : actividad === "Laboreos de Lote"
      ? rowsLaboreos.length > 0
      : actividad === "Manejo de Malezas"
      ? rowsMaleza.length > 0
      : actividad === "Aplicación Fitosanitaria"
      ? rowsFito.length > 0
      : false;

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: 1160,
        background: blanco,
        borderRadius: "1.4rem",
        border: "none",
      }}
    >
      <Card.Body>
        <Card.Title className="fw-bold mb-4" style={{ color: verdeOscuro }}>
          Registrar Actividad Agrícola
        </Card.Title>

        {/* Mensaje de éxito/error */}
        {mensaje && (
          <div
            className={`alert ${mensajeOk ? "alert-success" : "alert-danger"}`}
            style={{ fontWeight: "bold", whiteSpace: "pre-wrap" }}
          >
            {mensaje}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Campo
              </Form.Label>
              <Form.Select
                value={campo}
                onChange={(e) => {
                  setCampo(e.target.value);
                  setLote("");
                }}
                required
                className="input-terrax"
              >
                <option value="">Seleccione un campo</option>
                {campos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Lote
              </Form.Label>
              <Form.Select
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                disabled={!campo}
                required
                className="input-terrax"
              >
                <option value="">Seleccione un lote</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </Form.Select>
              {campo && lotes.length === 0 && (
                <div
                  style={{
                    color: "#d9534f",
                    marginTop: 6,
                    fontSize: "0.95rem",
                  }}
                >
                  No hay lotes asociados a este campo.
                </div>
              )}
            </Col>

            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Actividad
              </Form.Label>
              <Form.Select
                value={actividad}
                onChange={(e) => {
                  const v = e.target.value;
                  setActividad(v);
                  // reset de todas las colecciones
                  setRowsFert([]);
                  setRowsRiego([]);
                  setRowsLaboreos([]);
                  setRowsMaleza([]);
                  setRowsFito([]);
                  if (v === "Fertilización") setFertVista("variable");
                }}
                required
                className="input-terrax"
                disabled={lotes.length === 0}
              >
                <option value="">Seleccione actividad</option>
                {actividades.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* FERTILIZACIÓN */}
          {actividad === "Fertilización" && (
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 style={{ color: verdeOscuro, margin: 0 }}>
                  Fertilización ·{" "}
                  {fertVista === "variable" ? "Dosis Variable" : "Dosis Fija"}
                </h5>
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant={
                      fertVista === "variable" ? "success" : "outline-success"
                    }
                    onClick={() => {
                      setFertVista("variable");
                      setRowsFert([]);
                    }}
                  >
                    Dosis Variable
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      fertVista === "fija" ? "success" : "outline-success"
                    }
                    onClick={() => {
                      setFertVista("fija");
                      setRowsFert([]);
                    }}
                  >
                    Dosis Fija
                  </Button>
                </ButtonGroup>
              </div>

              <Table
                bordered
                hover
                size="sm"
                className="table-terrax encabezado-claro"
              >
                <thead>
                  <tr style={{ background: verde, color: blanco }}>
                    {headersFert().map((h, idx) => (
                      <th key={idx}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsFert.map((r, i) => (
                    <tr key={i}>{rowFert(r, i)}</tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex align-items-center mt-2">
                <Button
                  size="sm"
                  variant="success"
                  className="rounded-pill px-3"
                  onClick={addRowFert}
                >
                  + Agregar fila
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill px-3 ms-2"
                  onClick={() => setRowsFert([])}
                >
                  Limpiar
                </Button>
                <div className="ms-auto">
                  <Button
                    type="submit"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: "bold",
                      background: verde,
                      borderColor: verde,
                    }}
                    disabled={!canSubmit}
                  >
                    Registrar Actividad
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* RIEGO */}
          {actividad === "Riego" && (
            <div className="mt-5">
              <h5 style={{ color: verdeOscuro }}>Riego</h5>
              <Table
                bordered
                hover
                size="sm"
                className="table-terrax encabezado-claro"
              >
                <thead>
                  <tr style={{ background: verde, color: blanco }}>
                    {headersRiego.map((h, idx) => (
                      <th key={idx}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsRiego.map((r, i) => (
                    <tr key={i}>{rowRiego(r, i)}</tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex">
                <Button
                  size="sm"
                  variant="success"
                  className="rounded-pill px-3"
                  onClick={addRowRiego}
                >
                  + Agregar fila
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill px-3 ms-2"
                  onClick={() => setRowsRiego([])}
                >
                  Limpiar
                </Button>
                <div className="ms-auto">
                  <Button
                    type="submit"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: "bold",
                      background: verde,
                      borderColor: verde,
                    }}
                    disabled={!canSubmit}
                  >
                    Registrar Actividad
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* LABOREOS DE LOTE */}
          {actividad === "Laboreos de Lote" && (
            <div className="mt-5">
              <h5 style={{ color: verdeOscuro }}>Laboreos del lote</h5>
              <Table
                bordered
                hover
                size="sm"
                className="table-terrax encabezado-claro"
              >
                <thead>
                  <tr style={{ background: verde, color: blanco }}>
                    {headersLaboreos.map((h, idx) => (
                      <th key={idx}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsLaboreos.map((r, i) => (
                    <tr key={i}>{rowLaboreos(r, i)}</tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex">
                <Button
                  size="sm"
                  variant="success"
                  className="rounded-pill px-3"
                  onClick={addRowLaboreos}
                >
                  + Agregar fila
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill px-3 ms-2"
                  onClick={() => setRowsLaboreos([])}
                >
                  Limpiar
                </Button>
                <div className="ms-auto">
                  <Button
                    type="submit"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: "bold",
                      background: verde,
                      borderColor: verde,
                    }}
                    disabled={!canSubmit}
                  >
                    Registrar Actividad
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* MANEJO DE MALEZAS */}
          {actividad === "Manejo de Malezas" && (
            <div className="mt-5">
              <h5 style={{ color: verdeOscuro }}>Manejo de malezas</h5>
              <Table
                bordered
                hover
                size="sm"
                className="table-terrax encabezado-claro"
              >
                <thead>
                  <tr style={{ background: verde, color: blanco }}>
                    {headersMaleza.map((h, idx) => (
                      <th key={idx}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsMaleza.map((r, i) => (
                    <tr key={i}>{rowMaleza(r, i)}</tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex">
                <Button
                  size="sm"
                  variant="success"
                  className="rounded-pill px-3"
                  onClick={addRowMaleza}
                >
                  + Agregar fila
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill px-3 ms-2"
                  onClick={() => setRowsMaleza([])}
                >
                  Limpiar
                </Button>
                <div className="ms-auto">
                  <Button
                    type="submit"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: "bold",
                      background: verde,
                      borderColor: verde,
                    }}
                    disabled={!canSubmit}
                  >
                    Registrar Actividad
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* APLICACIÓN FITOSANITARIA */}
          {actividad === "Aplicación Fitosanitaria" && (
            <div className="mt-5">
              <h5 style={{ color: verdeOscuro }}>Aplicación Fitosanitaria</h5>
              <Table
                bordered
                hover
                size="sm"
                className="table-terrax encabezado-claro"
              >
                <thead>
                  <tr style={{ background: verde, color: blanco }}>
                    {headersFito.map((h, idx) => (
                      <th key={idx}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsFito.map((r, i) => (
                    <tr key={i}>{rowFito(r, i)}</tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex align-items-center mt-2">
                <Button
                  size="sm"
                  variant="success"
                  className="rounded-pill px-3"
                  onClick={addRowFito}
                >
                  + Agregar fila
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill px-3 ms-2"
                  onClick={() => setRowsFito([])}
                >
                  Limpiar
                </Button>
                <div className="ms-auto">
                  <Button
                    type="submit"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: "bold",
                      background: verde,
                      borderColor: verde,
                    }}
                    disabled={!canSubmit}
                  >
                    Registrar Actividad
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
