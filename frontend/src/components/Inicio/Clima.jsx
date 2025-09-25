// src/components/Inicio/Clima.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Clima.css";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";

const API_KEY = "bb506ce6bfb32335624845c3512d3a72"; // Reemplaza con tu clave real

// Función para mapear iconos de OpenWeather a react-icons
const getWeatherIcon = (main, size = 60) => {
  const props = { size, color: "#198754" };
  switch (main) {
    case "Clear":
      return <WiDaySunny {...props} />;
    case "Clouds":
      return <WiCloudy {...props} />;
    case "Rain":
      return <WiRain {...props} />;
    case "Snow":
      return <WiSnow {...props} />;
    case "Thunderstorm":
      return <WiThunderstorm {...props} />;
    case "Fog":
    case "Mist":
    case "Haze":
      return <WiFog {...props} />;
    default:
      return <WiDaySunny {...props} />;
  }
};

const Clima = () => {
  const [ciudad, setCiudad] = useState("Alta Italia,AR");
  const [climaHoy, setClimaHoy] = useState(null);
  const [pronostico, setPronostico] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const dropdownRef = useRef(null);

  // === FETCH clima actual y forecast ===
  const fetchClima = async (city) => {
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );

      setClimaHoy(weatherRes.data);

      // Agrupamos forecast por día (1 muestra por día)
      const daily = [];
      const seenDates = new Set();
      forecastRes.data.list.forEach((item) => {
        const fecha = new Date(item.dt_txt).toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        if (!seenDates.has(fecha)) {
          seenDates.add(fecha);
          daily.push(item);
        }
      });

      // Insertamos tarjeta "Hoy" primero
      const hoy = {
        ...weatherRes.data,
        dt: weatherRes.data.dt,
        main: weatherRes.data.main,
        weather: weatherRes.data.weather,
        wind: weatherRes.data.wind,
        isToday: true,
      };

      setPronostico([hoy, ...daily.slice(0, 4)]);
      setDiaSeleccionado(hoy);
    } catch (error) {
      console.error("Error al obtener clima:", error);
    }
  };

  // === Buscar ciudades ===
  const buscarCiudad = async (query) => {
    if (!query) {
      setResultados([]);
      return;
    }
    setCargandoBusqueda(true);
    setErrorBusqueda(null);
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      setResultados(res.data);
      if (res.data.length === 0) {
        setErrorBusqueda("No se encontraron resultados");
      }
    } catch (error) {
      setErrorBusqueda("Error al buscar ciudades");
    } finally {
      setCargandoBusqueda(false);
    }
  };

  // Cierra el desplegable si clickeo fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResultados([]);
        setErrorBusqueda(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchClima(ciudad);
  }, [ciudad]);

  return (
    <div className="clima-card">
      {/* === Buscador con sugerencias === */}
      <div className="clima-buscador" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Buscar ciudad..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            buscarCiudad(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && resultados.length > 0) {
              const r = resultados[0];
              const nombreCiudad = `${r.name},${r.country}`;
              setCiudad(nombreCiudad);
              setBusqueda("");
              setResultados([]);
            }
          }}
        />

        {cargandoBusqueda && (
          <div className="clima-dropdown">Buscando ciudad...</div>
        )}
        {errorBusqueda && resultados.length === 0 && (
          <div className="clima-dropdown">{errorBusqueda}</div>
        )}
        {resultados.length > 0 && (
          <div className="clima-dropdown">
            {resultados.map((r, i) => (
              <div
                key={i}
                className="clima-opcion"
                onClick={() => {
                  const nombreCiudad = `${r.name},${r.country}`;
                  setCiudad(nombreCiudad);
                  setBusqueda("");
                  setResultados([]);
                  setErrorBusqueda(null);
                }}
              >
                {r.name}, {r.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Clima principal === */}
      {diaSeleccionado && (
        <div className="clima-principal">
          <h4>
            {ciudad}
          </h4>
          <div className="clima-temp">
            {getWeatherIcon(diaSeleccionado.weather[0].main, 80)}
            <span>{Math.round(diaSeleccionado.main.temp)}°C</span>
          </div>
          <p>{diaSeleccionado.weather[0].description}</p>
          <div className="clima-detalles">
            <span>🌡 Máx: {Math.round(diaSeleccionado.main.temp_max)}°C</span>
            <span>🌡 Mín: {Math.round(diaSeleccionado.main.temp_min)}°C</span>
            <span>💧 Humedad: {diaSeleccionado.main.humidity}%</span>
            <span>💨 Viento: {diaSeleccionado.wind.speed} m/s</span>
          </div>
        </div>
      )}

      {/* === Pronóstico === */}
      <div className="clima-pronostico">
        {pronostico.map((dia, i) => (
          <div
            key={i}
            className={`clima-dia ${
              diaSeleccionado.dt === dia.dt ? "activo" : ""
            }`}
            onClick={() => setDiaSeleccionado(dia)}
          >
            <p>
              {dia.isToday
                ? "Hoy"
                : new Date(dia.dt_txt).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
            </p>
            {getWeatherIcon(dia.weather[0].main, 50)}
            <p>{Math.round(dia.main.temp)}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clima;
