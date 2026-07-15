import re, requests
from bs4 import BeautifulSoup
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

URL = "https://cac.bcr.com.ar/es/precios-de-pizarra"

LABELS = ["TRIGO", "MAÍZ", "GIRASOL", "SOJA", "SORGO"]
PAT = {
    "TRIGO":   re.compile(r"(?i)trigo"),
    "MAÍZ":    re.compile(r"(?i)ma[ií]z"),
    "GIRASOL": re.compile(r"(?i)girasol"),
    "SOJA":    re.compile(r"(?i)soja"),
    "SORGO":   re.compile(r"(?i)sorgo"),
}

def _ar_num(s):
    if not s: return None
    try: return float(s.replace(".", "").replace(",", "."))
    except: return None

@api_view(["GET"])
@permission_classes([AllowAny])
def cac_pizarra(request):
    try:
        r = requests.get(
            URL, timeout=15, allow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0", "Accept-Language":"es-AR,es;q=0.9"},
        )
        r.raise_for_status()
    except requests.RequestException as e:
        return Response({"error":"fetch_failed","detalle":str(e)}, status=502)

    soup = BeautifulSoup(r.text, "lxml")
    text = soup.get_text(" ", strip=True)

    # Fecha
    m_fecha = re.search(r"Precios\s+Pizarra\s+del\s+d[íi]a\s+(\d{2}/\d{2}/\d{4})", text, re.I)
    fecha = m_fecha.group(1) if m_fecha else None

    # Punto de partida: donde inicia la pizarra
    h = re.search(r"Precios\s+Pizarra\s+del\s+d[íi]a", text, re.I)
    start_idx = h.start() if h else 0

    items = []
    cursor = start_idx

    for i, label in enumerate(LABELS):
        m = PAT[label].search(text, cursor)
        if not m:
            continue
        pos = m.start()

        # Próximo label para cortar el segmento
        if i + 1 < len(LABELS):
            m_next = PAT[LABELS[i+1]].search(text, pos + 1)
            fin = m_next.start() if m_next else pos + 800
        else:
            fin = pos + 800

        segmento = text[pos:fin]

        # Ignorar "(Estimativo) $..." al buscar el precio principal
        segmento_sin_est = re.sub(r"\(Estimativo\)\s*\$?\s*[\d\.\,]+", "", segmento, flags=re.I)

        # Precio principal o S/C (dentro del tramo del producto)
        m_prec = re.search(r"\$\s*([\d\.\,]{3,})", segmento_sin_est)
        hay_sc = re.search(r"\bS/?C\b", segmento_sin_est) is not None

        if m_prec and not hay_sc:
            precio_val = _ar_num(m_prec.group(1))
            precio_txt = f"${m_prec.group(1)}"
        else:
            precio_val = None
            precio_txt = "S/C"

        # Estimativo: solo si aparece en el propio tramo
        m_est = re.search(r"\(Estimativo\)\s*\$?\s*([\d\.\,]+)", segmento, re.I)
        estimativo = _ar_num(m_est.group(1)) if m_est else None

        # Normalizar MAÍZ
        nombre = "MAÍZ" if label.startswith("MA") else label

        items.append({
            "producto": nombre,
            "precio": precio_val,
            "precio_texto": precio_txt,
            "estimativo": estimativo,
        })

        cursor = pos + 1

    # Orden fijo por si faltó alguno
    orden = {n:i for i, n in enumerate(LABELS)}
    items.sort(key=lambda x: orden.get(x["producto"], 999))

    return Response({"fecha": fecha, "items": items}, status=200)
