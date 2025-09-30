// src/components/Inicio/Clima.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import "./Clima.css";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiHumidity,
  WiStrongWind,
} from "react-icons/wi";

const API_KEY = "bb506ce6bfb32335624845c3512d3a72";

// Iconos según condición
const getWeatherIcon = (main, size = 60) => {
  let color = "#198754"; // verde por defecto
  switch (main) {
    case "Clear":       // Soleado
      color = "#fab115ff"; // amarillo
      return <WiDaySunny size={size} color={color} />;
    case "Clouds":      // Nublado
      color = "#9ca3af"; // gris
      return <WiCloudy size={size} color={color} />;
    case "Rain":        // Lluvia
      color = "#3b82f6"; // azul
      return <WiRain size={size} color={color} />;
    case "Snow":
      color = "#60a5fa"; // celeste
      return <WiSnow size={size} color={color} />;
    case "Thunderstorm":
      color = "#f59e0b"; // naranja
      return <WiThunderstorm size={size} color={color} />;
    case "Fog":
    case "Mist":
    case "Haze":
      color = "#9ca3af"; // gris claro
      return <WiFog size={size} color={color} />;
    default:
      return <WiDaySunny size={size} color="#facc15" />;
  }
};

const formatearFechaCorta = (fechaISO) => {
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
};
const formatearHora = (fechaISO) => {
  const d = new Date(fechaISO);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

// min/max del día usando horas (fallback al resumen)
const getMinMaxDia = (dia) => {
  const items = dia?.horas?.length ? dia.horas : [dia.resumen];
  let min = Infinity, max = -Infinity;
  items.forEach(h => {
    const tmin = h.main?.temp_min ?? h.main?.temp ?? h.temp ?? 0;
    const tmax = h.main?.temp_max ?? h.main?.temp ?? h.temp ?? 0;
    if (tmin < min) min = tmin;
    if (tmax > max) max = tmax;
  });
  return { min: Math.round(min), max: Math.round(max) };
};

const Clima = () => {
  const [ciudadTexto, setCiudadTexto] = useState("Alta Italia,AR");
  const [displayCiudad, setDisplayCiudad] = useState("Alta Italia,AR");

  const [daily, setDaily] = useState([]); // días con horas incluidas
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedHour, setSelectedHour] = useState(null);

  // búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const dropdownRef = useRef(null);

  // === Buscar ciudades (geocoding) ===
  const buscarCiudad = async (query) => {
    if (!query) { setResultados([]); return; }
    setCargandoBusqueda(true); setErrorBusqueda(null);
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      setResultados(res.data);
      if (res.data.length === 0) setErrorBusqueda("No se encontraron resultados");
    } catch {
      setErrorBusqueda("Error al buscar ciudades");
    } finally {
      setCargandoBusqueda(false);
    }
  };

  // cerrar dropdown si clickeo fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResultados([]); setErrorBusqueda(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Fetch clima actual + forecast ===
  const fetchClima = async (cityText) => {
    try {
      // 1) Geo → lat/lon
      const geo = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityText)}&limit=1&appid=${API_KEY}`
      );
      if (!geo.data?.length) return;
      const g = geo.data[0];
      const nombreDisplay = [g.name, g.state, g.country].filter(Boolean).join(", ");
      setDisplayCiudad(nombreDisplay);

      // 2) Actual + forecast (gratuitos)
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${g.lat}&lon=${g.lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${g.lat}&lon=${g.lon}&appid=${API_KEY}&units=metric&lang=es`
      );

      // 3) Agrupar forecast por día
      const diasMap = {};
      forecastRes.data.list.forEach((item) => {
        const fecha = item.dt_txt.split(" ")[0]; // YYYY-MM-DD
        if (!diasMap[fecha]) diasMap[fecha] = [];
        diasMap[fecha].push(item);
      });

      const dailyArr = Object.keys(diasMap).map((fecha) => {
        const horas = diasMap[fecha];
        const resumen =
          horas.find((h) => h.dt_txt.includes("12:00:00")) ||
          horas[Math.floor(horas.length / 2)];
        return { fecha, resumen, horas };
      });

      // 4) “Hoy” con datos actuales
      const hoyFecha = new Date().toISOString().split("T")[0];
      const hoy = {
        fecha: hoyFecha,
        resumen: {
          main: weatherRes.data.main,
          weather: weatherRes.data.weather,
          wind: weatherRes.data.wind,
          dt_txt: new Date().toISOString(),
        },
        horas: dailyArr[0]?.horas || [],
        isToday: true,
      };

      // /forecast cubre ~5 días → “Hoy” + 4 posteriores
      const posteriores = dailyArr.filter(d => d.fecha !== hoyFecha).slice(0, 4);
      setDaily([hoy, ...posteriores]);
      setSelectedDayIdx(0);
      setSelectedHour(null);
    } catch (e) {
      console.error("Error al obtener clima:", e);
    }
  };

  useEffect(() => { fetchClima(ciudadTexto); }, [ciudadTexto]);

  // horas del día seleccionado
  const horasDelDia = useMemo(() => {
    if (!daily.length) return [];
    return daily[selectedDayIdx]?.horas || [];
  }, [daily, selectedDayIdx]);

  // datos del panel principal (sin max/min)
  const panel = useMemo(() => {
    if (selectedHour) {
      return {
        temp: Math.round(selectedHour.main.temp),
        desc: selectedHour.weather?.[0]?.description ?? "",
        main: selectedHour.weather?.[0]?.main ?? "Clear",
        humidity: selectedHour.main.humidity,
        wind: selectedHour.wind.speed,
      };
    }
    if (!daily.length) return null;
    const d = daily[selectedDayIdx].resumen;
    return {
      temp: Math.round(d.main.temp),
      desc: d.weather?.[0]?.description ?? "",
      main: d.weather?.[0]?.main ?? "Clear",
      humidity: d.main.humidity,
      wind: d.wind.speed,
    };
  }, [selectedHour, daily, selectedDayIdx]);

  return (
    <div className="clima-card">
      {/* === Buscador === */}
      <div className="clima-buscador" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Buscar ciudad..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); buscarCiudad(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && resultados.length > 0) {
              const r = resultados[0];
              const nombreCiudad = `${r.name}${r.state ? "," + r.state : ""},${r.country}`;
              setCiudadTexto(nombreCiudad);
              setBusqueda(""); setResultados([]);
            }
          }}
        />

        {cargandoBusqueda && <div className="clima-dropdown">Buscando ciudad...</div>}
        {errorBusqueda && resultados.length === 0 && <div className="clima-dropdown">{errorBusqueda}</div>}
        {resultados.length > 0 && (
          <div className="clima-dropdown">
            {resultados.map((r, i) => (
              <div
                key={i}
                className="clima-opcion"
                onClick={() => {
                  const nombreCiudad = `${r.name}${r.state ? "," + r.state : ""},${r.country}`;
                  setCiudadTexto(nombreCiudad);
                  setBusqueda(""); setResultados([]); setErrorBusqueda(null);
                }}
              >
                {r.name}{r.state ? `, ${r.state}` : ""}, {r.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Panel principal === */}
      {panel && (
        <div className="clima-principal">
          <h4>{displayCiudad}</h4>
          <div className="clima-temp">
            {getWeatherIcon(panel.main, 80)}
            <span>{panel.temp}°C</span>
          </div>
          <p>{panel.desc}</p>
          <div className="clima-detalles">
            <span className="detalle-con-icono">
              <WiHumidity size={40} color="#3b82f6" />Humedad: {panel.humidity}% 
            </span>
            <span className="detalle-con-icono">
              <WiStrongWind size={40} color="#9ca3af" />Viento: {panel.wind} m/s 
            </span>
          </div>
        </div>
      )}

      {/* === Horas del día seleccionado === */}
      {!!horasDelDia.length && (
        <div className="clima-horaria">
          {horasDelDia.map((h, i) => (
            <button
              key={i}
              className={`clima-hour ${selectedHour?.dt_txt === h.dt_txt ? "activo" : ""}`}
              onClick={() => setSelectedHour(h)}
              title={h.weather?.[0]?.description}
            >
              <span className="hora">{formatearHora(h.dt_txt)}</span>
              {getWeatherIcon(h.weather?.[0]?.main ?? "Clear", 36)}
              <span className="temp">{Math.round(h.main.temp)}°</span>
            </button>
          ))}
        </div>
      )}

      {/* === Tarjetas de días === */}
      <div className="clima-pronostico">
        {daily.map((d, idx) => {
          const { min, max } = getMinMaxDia(d);
          return (
            <div
              key={idx}
              className={`clima-dia ${idx === selectedDayIdx ? "activo" : ""}`}
              onClick={() => { setSelectedDayIdx(idx); setSelectedHour(null); }}
            >
              <p>{idx === 0 ? "Hoy" : formatearFechaCorta(d.fecha)}</p>
              {getWeatherIcon(d.resumen.weather?.[0]?.main ?? "Clear", 50)}
              <p className="dia-temp">{Math.round(d.resumen.main.temp)}°C</p>
              <p className="dia-minmax">min {min}° · max {max}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Clima;
