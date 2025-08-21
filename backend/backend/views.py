import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response



@api_view(['GET'])
def cotizacion_dolar(request):
    url = "https://api.bcr.com.ar/gix/v1/dolar"
    headers = {
        "accept": "application/json",
        "x-api-key": "TU_API_KEY_ACÁ"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return Response(response.json())  # devuelvo la lista de cotizaciones
    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)}, status=500)
    
