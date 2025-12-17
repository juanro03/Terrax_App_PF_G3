import os
import requests
from django.conf import settings

OPENWEATHER_API_KEY = getattr(settings, "OPENWEATHER_API_KEY", os.getenv("OPENWEATHER_API_KEY"))

# ENDPOINT COMPATIBLE CON PLAN GRATIS
OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def calcular_centroide(coordenadas):
    if not coordenadas:
        return None, None

    lat_sum = 0
    lon_sum = 0
    n = 0

    for punto in coordenadas:
        lat = punto.get("lat")
        lon = punto.get("lng")
        if lat is None or lon is None:
            continue
        lat_sum += lat
        lon_sum += lon
        n += 1

    if n == 0:
        return None, None
    return lat_sum / n, lon_sum / n

print("🔑 OPENWEATHER_API_KEY:", OPENWEATHER_API_KEY)

def obtener_forecast(lat, lon):
    if not OPENWEATHER_API_KEY:
        return None

    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "es",
    }

    try:
        resp = requests.get(OPENWEATHER_FORECAST_URL, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def detectar_alertas_forecast(datos):
    if not datos:
        return []

    alertas_por_dia = {}

    # prioridad de severidad
    prioridad = {
        "crítica": 3,
        "alta": 2,
        "moderada": 1,
    }

    for entry in datos.get("list", []):
        dt_txt = entry.get("dt_txt")
        if not dt_txt:
            continue

        dia = dt_txt.split(" ")[0]  # YYYY-MM-DD

        main = entry.get("main", {})
        weather = entry.get("weather", [{}])[0]
        wind = entry.get("wind", {})

        temp = main.get("temp")
        desc = (weather.get("description") or "").lower()

        alerta = None

        # 🌡 Temperaturas
        if temp is not None:
            if temp <= 5:
                alerta = {
                    "fecha": dt_txt,
                    "tipo": "temp_baja",
                    "mensaje": f"Bajas temperaturas previstas ({temp} °C)",
                    "nivel": "moderada",
                }
            elif temp >= 32:
                alerta = {
                    "fecha": dt_txt,
                    "tipo": "temp_alta",
                    "mensaje": f"Altas temperaturas previstas ({temp} °C)",
                    "nivel": "moderada",
                }

        # ⛈ Tormenta
        if "thunderstorm" in desc or "tormenta" in desc:
            alerta = {
                "fecha": dt_txt,
                "tipo": "tormenta",
                "mensaje": f"Tormenta prevista ({desc})",
                "nivel": "alta",
            }

        # 🌧 Lluvia
        rain = entry.get("rain", {}).get("3h", 0)
        if rain >= 5:
            alerta = {
                "fecha": dt_txt,
                "tipo": "lluvia",
                "mensaje": f"Lluvia prevista: {rain} mm",
                "nivel": "moderada",
            }

        # 💨 Viento (m/s → km/h)
        viento = wind.get("speed")
        if viento:
            kmh = viento * 3.6
            if kmh >= 30:
                alerta = {
                    "fecha": dt_txt,
                    "tipo": "viento_fuerte",
                    "mensaje": f"Vientos fuertes: {int(kmh)} km/h",
                    "nivel": "alta",
                }

        # 🧊 Granizo
        if "hail" in desc or "granizo" in desc:
            alerta = {
                "fecha": dt_txt,
                "tipo": "granizo",
                "mensaje": "Posible caída de granizo",
                "nivel": "crítica",
            }

        if not alerta:
            continue

        # 👉 quedarse con la alerta más grave del día
        actual = alertas_por_dia.get(dia)

        if not actual or prioridad[alerta["nivel"]] > prioridad[actual["nivel"]]:
            alertas_por_dia[dia] = alerta

    # devolver solo una alerta por día
    return list(alertas_por_dia.values())


def obtener_alertas_para_lote(coordenadas):
    lat, lon = calcular_centroide(coordenadas)

    # FIX: permitir latitudes negativas
    if lat is None or lon is None:
        return [], None, None

    datos = obtener_forecast(lat, lon)
    alertas = detectar_alertas_forecast(datos)

    return alertas, lat, lon
