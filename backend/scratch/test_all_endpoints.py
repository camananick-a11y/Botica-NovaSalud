import requests
import json

BASE_URL = "http://localhost:8000/api"
TOKEN_URL = "http://localhost:8000/api/token/"

def test_endpoints():
    print("Iniciando Pruebas de Endpoints como Administrador...\n")
    
    # 1. Login con las credenciales correctas
    payload = {
        "usuario": "admin",
        "password": "admin123"
    }
    try:
        response = requests.post(TOKEN_URL, json=payload)
        if response.status_code != 200:
            print("Error en Login: {} - {}".format(response.status_code, response.text))
            return
        
        token = response.json()['access']
        headers = {"Authorization": "Bearer {}".format(token), "Content-Type": "application/json"}
        print("Login Exitoso. Token obtenido.\n")
    except Exception as e:
        print("Error conectando al servidor: {}".format(e))
        return

    # 2. Listar Clientes
    res = requests.get("{}/clientes/".format(BASE_URL), headers=headers)
    print("GET /clientes/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    # 3. Listar Medicamentos
    res = requests.get("{}/medicamentos/".format(BASE_URL), headers=headers)
    print("GET /medicamentos/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    # 4. Listar Stock
    res = requests.get("{}/medicamentos/stock/".format(BASE_URL), headers=headers)
    print("GET /medicamentos/stock/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    # 5. Listar Laboratorios, Categorias, etc.
    for sub in ['laboratorios', 'categorias', 'presentaciones', 'unidades']:
        res = requests.get("{}/medicamentos/{}/".format(BASE_URL, sub), headers=headers)
        print("GET /medicamentos/{}/: {} {}".format(sub, res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    # 6. Listar Comprobantes (Ventas)
    res = requests.get("{}/ventas/comprobantes/".format(BASE_URL), headers=headers)
    print("GET /ventas/comprobantes/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    # 7. Probar Reportes
    res = requests.get("{}/ventas/comprobantes/reporte_ventas_fecha/".format(BASE_URL), headers=headers)
    print("GET /reporte_ventas_fecha/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    res = requests.get("{}/ventas/comprobantes/medicamentos_mas_vendidos/".format(BASE_URL), headers=headers)
    print("GET /medicamentos_mas_vendidos/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    res = requests.get("{}/ventas/comprobantes/stock_bajo/".format(BASE_URL), headers=headers)
    print("GET /stock_bajo/: {} {}".format(res.status_code, "OK" if res.status_code == 200 else "ERROR"))

    print("\nPruebas Finalizadas.")

if __name__ == "__main__":
    test_endpoints()
