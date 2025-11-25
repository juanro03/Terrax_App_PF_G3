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
import useUserLocation from "../../hooks/useUserLocation.js";


const API_KEY = "bb506ce6bfb32335624845c3512d3a72";

// Iconos según condición (con colores, sin fondo)
const getWeatherIcon = (main, size = 60) => {
  const map = {
    Clear: { Comp: WiDaySunny, color: "#facc15" },        // amarillo
    Clouds: { Comp: WiCloudy, color: "#9ca3af" },         // gris
    Rain: { Comp: WiRain, color: "#3b82f6" },             // azul
    Snow: { Comp: WiSnow, color: "#60a5fa" },
    Thunderstorm: { Comp: WiThunderstorm, color: "#f59e0b" },
    Fog: { Comp: WiFog, color: "#9ca3af" },
    Mist: { Comp: WiFog, color: "#9ca3af" },
    Haze: { Comp: WiFog, color: "#9ca3af" },
  };
  const { Comp, color } = map[main] || map.Clear;
  return <Comp size={size} color={color} />;
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
  items.forEach((h) => {
    const tmin = h.main?.temp_min ?? h.main?.temp ?? h.temp ?? 0;
    const tmax = h.main?.temp_max ?? h.main?.temp ?? h.temp ?? 0;
    if (tmin < min) min = tmin;
    if (tmax > max) max = tmax;
  });
  return { min: Math.round(min), max: Math.round(max) };
};

const Clima = () => {
  const [ciudadTexto, setCiudadTexto] = useState("Córdoba,AR");
  const [displayCiudad, setDisplayCiudad] = useState("Córdoba,AR");

  const [daily, setDaily] = useState([]); // días con horas
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedHour, setSelectedHour] = useState(null);

  // ubicación
  const [coords, setCoords] = useState(null); // {lat, lon}
  const { status, coords: geoCoords, request } = useUserLocation();

  // histórico últimos 3 meses
  const [rainDays, setRainDays] = useState([]); // [{date, precip}]
  const [frostDays, setFrostDays] = useState([]); // [{date, tmin}]
  const [loadingHist, setLoadingHist] = useState(false);
  const [histError, setHistError] = useState(null);

  // pestañas
  const [activeTab, setActiveTab] = useState("clima"); // clima | precipitaciones | heladas

  // búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const dropdownRef = useRef(null);

  // === Buscar ciudades (geocoding) ===
  const buscarCiudad = async (query) => {
    if (!query) {
      setResultados([]);
      return;
    }
    setCargandoBusqueda(true);
    setErrorBusqueda(null);
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

  const fetchClimaFromCoords = async (lat, lon) => {
    try {
      // Nombre legible (reverse geocoding)
      let nombre = "Ubicación actual";
      try {
        const rev = await axios.get(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        if (rev.data?.length) {
          const l = rev.data[0];
          nombre = [l.name, l.state, l.country].filter(Boolean).join(", ");
        }
      } catch (e) {
        console.warn("Reverse geocoding falló:", e?.message || e);
      }
      setDisplayCiudad(nombre);
      setCoords({ lat, lon });

      // Clima actual + pronóstico
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`),
      ]);

      // Construir daily
      const diasMap = {};
      forecastRes.data.list.forEach((item) => {
        const fecha = item.dt_txt.split(" ")[0];
        (diasMap[fecha] ||= []).push(item);
      });

      const dailyArr = Object.keys(diasMap).map((fecha) => {
        const horas = diasMap[fecha];
        const resumen =
          horas.find((h) => h.dt_txt.includes("12:00:00")) ||
          horas[Math.floor(horas.length / 2)];
        return { fecha, resumen, horas };
      });

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
      const posteriores = dailyArr.filter((d) => d.fecha !== hoyFecha).slice(0, 4);

      setDaily([hoy, ...posteriores]);
      setSelectedDayIdx(0);
      setSelectedHour(null);
      setActiveTab("clima");

      // Histórico
      fetchHistorico(lat, lon);
    } catch (e) {
      console.error("Error al obtener clima desde coords:", e);
    }
  };

  //si el usuario acepta los permisos de ubicación, se carga su ubicación
  useEffect(() => {
    if (status === "granted" && geoCoords?.lat && geoCoords?.lon) {
      fetchClimaFromCoords(geoCoords.lat, geoCoords.lon);
    }
    // No fuerces el fallback acá. Tu estado inicial ya arranca en Buenos Aires
    // y el otro efecto (dependiente de ciudadTexto) lo carga. Evitamos pisarnos.
  }, [status, geoCoords]);

  // cerrar dropdown si clickeo fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResultados([]);
        setErrorBusqueda(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Fetch clima actual + forecast (gratuitos) ===
  const fetchClima = async (cityText) => {
    try {
      // 1) Geo → lat/lon
      const geo = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityText)}&limit=1&appid=${API_KEY}`
      );
      if (!geo.data?.length) return;
      const g = geo.data[0];
      const { lat, lon } = { lat: g.lat, lon: g.lon };
      setCoords({ lat, lon });
      const nombreDisplay = [g.name, g.state, g.country].filter(Boolean).join(", ");
      setDisplayCiudad(nombreDisplay);

      // 2) Actual + forecast
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
        ),
      ]);

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

      // /forecast ≈ hoy + 4 posteriores
      const posteriores = dailyArr.filter((d) => d.fecha !== hoyFecha).slice(0, 4);
      setDaily([hoy, ...posteriores]);
      setSelectedDayIdx(0);
      setSelectedHour(null);
      setActiveTab("clima");

      // 5) Cargar histórico (precipitaciones + heladas) AHORA
      fetchHistorico(lat, lon);
    } catch (e) {
      console.error("Error al obtener clima:", e);
    }
  };

  useEffect(() => {
    fetchClima(ciudadTexto);
  }, [ciudadTexto]);

  // === Histórico últimos 3 meses (Open-Meteo Archive API)
  const fetchHistorico = async (lat, lon) => {
    if (!lat || !lon) return;
    setLoadingHist(true);
    setHistError(null);
    try {
      const end = new Date(); // hoy
      const start = new Date();
      start.setMonth(end.getMonth() - 3); // últimos 3 meses
      const fmt = (d) => d.toISOString().slice(0, 10);

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fmt(
        start
      )}&end_date=${fmt(end)}&daily=precipitation_sum,temperature_2m_min&timezone=auto`;

      const res = await axios.get(url);
      const { time = [], precipitation_sum = [], temperature_2m_min = [] } = res.data?.daily || {};

      const rDays = [];
      const fDays = [];
      for (let i = 0; i < time.length; i++) {
        const date = time[i];
        const p = precipitation_sum[i];
        const tmin = temperature_2m_min[i];
        if (typeof p === "number" && p > 5) rDays.push({ date, precip: p });
        if (typeof tmin === "number" && tmin <= 0) fDays.push({ date, tmin });
      }

      setRainDays(rDays);
      setFrostDays(fDays);
    } catch (e) {
      console.error(e);
      setHistError("No se pudo cargar el histórico");
    } finally {
      setLoadingHist(false);
    }
  };

  // horas del día seleccionado
  const horasDelDia = useMemo(() => {
    if (!daily.length) return [];
    return daily[selectedDayIdx]?.horas || [];
  }, [daily, selectedDayIdx]);

  // datos del panel principal (sin max/min)
  const panel = useMemo(() => {
    if (activeTab !== "clima") return null;
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
  }, [selectedHour, daily, selectedDayIdx, activeTab]);

  return (
    <div className="clima-card">
      {/* ===== Tabs ===== */}
      <div className="tabs">
        {["clima", "precipitaciones", "heladas"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "clima" ? "Clima" : tab === "precipitaciones" ? "Precipitaciones" : "Heladas"}
          </button>
        ))}
      </div>

      {/* === Buscador === */}
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
              const nombreCiudad = `${r.name}${r.state ? "," + r.state : ""},${r.country}`;
              setCiudadTexto(nombreCiudad);
              setBusqueda("");
              setResultados([]);
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
                  setBusqueda("");
                  setResultados([]);
                  setErrorBusqueda(null);
                }}
              >
                {r.name}
                {r.state ? `, ${r.state}` : ""}, {r.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======== TAB CLIMA ======== */}
      {activeTab === "clima" && panel && (
        <>
          <div className="clima-principal">
            <h4>{displayCiudad}</h4>
            <div className="clima-temp">
              {getWeatherIcon(panel.main, 80)}
              <span>{panel.temp}°C</span>
            </div>
            <p>{panel.desc}</p>
            <div className="clima-detalles">
              <span className="detalle-con-icono">
                <WiHumidity size={40} color="#3b82f6" /> {panel.humidity}% Humedad
              </span>
              <span className="detalle-con-icono">
                <WiStrongWind size={40} color="#9ca3af" /> {panel.wind} m/s Viento
              </span>
            </div>
          </div>

          {/* Horas del día */}
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

          {/* Días */}
          <div className="clima-pronostico">
            {daily.map((d, idx) => {
              const { min, max } = getMinMaxDia(d);
              return (
                <div
                  key={idx}
                  className={`clima-dia ${idx === selectedDayIdx ? "activo" : ""}`}
                  onClick={() => {
                    setSelectedDayIdx(idx);
                    setSelectedHour(null);
                  }}
                >
                  <p>{idx === 0 ? "Hoy" : formatearFechaCorta(d.fecha)}</p>
                  {getWeatherIcon(d.resumen.weather?.[0]?.main ?? "Clear", 50)}
                  <p className="dia-temp">{Math.round(d.resumen.main.temp)}°C</p>
                  <p className="dia-minmax">min {min}°</p>
                  <p className="dia-minmax">max {max}°</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ======== TAB PRECIPITACIONES ======== */}
      {activeTab === "precipitaciones" && (
        <div className="hist-tab">
          <h4>{displayCiudad}</h4>
          <p className="hist-sub">Precipitaciones mayores a 5mm en los últimos 90 días</p>

          {loadingHist && <p>Cargando...</p>}
          {histError && <p className="error">{histError}</p>}

          {!loadingHist && !histError && (
            <>
              {(() => {
                if (rainDays.length === 0)
                  return <p>No hubo días con lluvia por encima del umbral en este período.</p>;

                // Agrupar por mes (YYYY-MM)
                const grupos = rainDays.reduce((acc, d) => {
                  const date = new Date(d.date);
                  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                  (acc[key] ||= []).push(d);
                  return acc;
                }, {});

                // Ordenar de más antiguo a más reciente (ej: julio, agosto, septiembre)
                const mesesOrdenadosAsc = Object.keys(grupos).sort((a, b) => a.localeCompare(b));

                const nombreMes = (key) => {
                  const [y, m] = key.split("-");
                  const f = new Date(Number(y), Number(m) - 1, 1);
                  return f.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
                };

                // Cantidad de meses para clase dinámica (centrado cuando hay 1 o 2)
                const cantMeses = mesesOrdenadosAsc.length;
                const gridClass =
                  cantMeses === 3 ? "meses-3" : cantMeses === 2 ? "meses-2" : "meses-1";

                return (
                  <div className={`months-grid ${gridClass}`}>
                    {mesesOrdenadosAsc.map((mkey) => (
                      <div key={mkey} className="month-col">
                        <h5 className="month-title">{nombreMes(mkey)}</h5>
                        <div className="month-list">
                          {grupos[mkey].map((d, i) => (
                            <div key={i} className="hist-card lluvia fila">
                              <span className="hist-date">
                                {new Date(d.date).toLocaleDateString("es-ES", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                              <span className="hist-value">{d.precip.toFixed(1)} mm</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* ======== TAB HELADAS ======== */}
      {activeTab === "heladas" && (
        <div className="hist-tab">
          <h4>{displayCiudad}</h4>
          <p className="hist-sub">Días con temperatura de 0°C o menos en los últimos 3 meses</p>

          {loadingHist && <p>Cargando...</p>}
          {histError && <p className="error">{histError}</p>}

          {!loadingHist && !histError && (
            <>
              <div className="hist-grid">
                {frostDays.length === 0 && <p>No hubo heladas en este período.</p>}
                {frostDays.map((d, i) => (
                  <div key={i} className="hist-card helada">
                    <p className="hist-date mb-1">{formatearFechaCorta(d.date)}</p>
                    <span className="hist-value">{Math.round(d.tmin)}°C</span>
                  </div>
                ))}
              </div>
              <div className="hist-foot">Total días con heladas: {frostDays.length}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Clima;
