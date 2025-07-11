import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './reportes.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState('');
  const [loteSeleccionado, setLoteSeleccionado] = useState('');

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/campos/', { headers })
      .then(res => setCampos(res.data))
      .catch(err => console.error(err));

    axios.get('http://127.0.0.1:8000/api/reportes/', { headers })
      .then(res => setReportes(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (campoSeleccionado) {
      axios.get(`http://127.0.0.1:8000/api/lotes/por-campo/${campoSeleccionado}/lotes`, { headers })
        .then(res => setLotes(res.data))
        .catch(err => console.error(err));
    } else {
      setLotes([]);
      setLoteSeleccionado('');
    }
  }, [campoSeleccionado]);

  const reportesFiltrados = reportes.filter(r => {
    return (
      (!campoSeleccionado || r.campo === parseInt(campoSeleccionado)) &&
      (!loteSeleccionado || r.lote === parseInt(loteSeleccionado))
    );
  });

  const obtenerNombreCampo = (id) => {
    const campo = campos.find(c => c.id === id);
    return campo ? campo.nombre : id;
  };

  const obtenerNombreLote = (id) => {
    const lote = lotes.find(l => l.id === id);
    return lote ? lote.nombre : id;
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="reportes-container">
      <h2 className="text-3xl font-bold mb-4">Reportes</h2>

      <div className="filtros">
        <div className="filtro">
          <label>Campo:</label>
          <select
            value={campoSeleccionado}
            onChange={e => setCampoSeleccionado(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">-- Todos --</option>
            {campos.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtro">
          <label>Lote:</label>
          <select
            value={loteSeleccionado}
            onChange={e => setLoteSeleccionado(e.target.value)}
            className="p-2 border rounded"
            disabled={!campoSeleccionado}
          >
            <option value="">-- Todos --</option>
            {lotes.map(l => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="tabla-reportes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Campo</th>
            <th>Lote</th>
            <th>Fecha</th> {/* Nueva columna */}
            <th>Observaciones</th>
            <th>Archivo</th>
          </tr>
        </thead>
        <tbody>
          {reportesFiltrados.map(r => (
            <tr key={r.id}>
              <td>{r.nombre}</td>
              <td>{obtenerNombreCampo(r.campo)}</td>
              <td>{obtenerNombreLote(r.lote)}</td>
              <td>{formatearFecha(r.fecha_subida)}</td> {/* Nueva celda */}
              <td>{r.observaciones}</td>
              <td>
                <a
                  href={r.archivo_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faFilePdf} size="2x" className="text-red-600" />
                  <span>Ver PDF</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reportes;
