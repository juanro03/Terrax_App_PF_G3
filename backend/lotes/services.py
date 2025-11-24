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

    alertas = []

    for entry in datos.get("list", []):
        dt_txt = entry.get("dt_txt")
        main = entry.get("main", {})
        weather = entry.get("weather", [{}])[0]
        wind = entry.get("wind", {})

        temp = main.get("temp")
        desc = (weather.get("description") or "").lower()

        # Temperaturas
        if temp is not None:
            if temp <= 0:
                alertas.append({
                    "fecha": dt_txt,
                    "tipo": "temp_baja",
                    "mensaje": f"Heladas posibles ({temp} °C)",
                    "nivel": "alta",
                })
            elif temp >= 35:
                alertas.append({
                    "fecha": dt_txt,
                    "tipo": "temp_alta",
                    "mensaje": f"Temperaturas extremas ({temp} °C)",
                    "nivel": "moderada",
                })

        # Tormentas
        if "tormenta" in desc or "storm" in desc:
            alertas.append({
                "fecha": dt_txt,
                "tipo": "tormenta",
                "mensaje": f"Tormenta prevista ({desc})",
                "nivel": "alta",
            })

        # Lluvia fuerte
        if "lluvia" in desc:
            rain = entry.get("rain", {}).get("3h", 0)
            if rain >= 10:
                alertas.append({
                    "fecha": dt_txt,
                    "tipo": "lluvia_fuerte",
                    "mensaje": f"Lluvia intensa: {rain} mm",
                    "nivel": "moderada",
                })

        # Viento fuerte
        viento = wind.get("speed")
        if viento and viento >= 40:
            alertas.append({
                "fecha": dt_txt,
                "tipo": "viento_fuerte",
                "mensaje": f"Vientos fuertes: {viento} km/h",
                "nivel": "alta",
            })

        # Granizo
        if "hail" in desc or "granizo" in desc:
            alertas.append({
                "fecha": dt_txt,
                "tipo": "granizo",
                "mensaje": "Posible caída de granizo",
                "nivel": "crítica",
            })

    return alertas


def obtener_alertas_para_lote(coordenadas):
    lat, lon = calcular_centroide(coordenadas)

    # FIX: permitir latitudes negativas
    if lat is None or lon is None:
        return [], None, None

    datos = obtener_forecast(lat, lon)
    alertas = detectar_alertas_forecast(datos)

    return alertas, lat, lon
