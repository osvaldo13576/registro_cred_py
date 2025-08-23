import pandas as pd
import numpy as np
# repositorio de los nombres: github.com/eduardofv/mexican-names
# leemos los archivos CSV de los nombres y apellidos
directorio = r'/run/media/osvaldo13576/Disk500MX/GitHub/prueba_tecnica/code/genDatabase/'
# descartamos el encabezado inicial
Nhombres = pd.read_csv(directorio + 'hombres.csv', header=None,skiprows=1)[0].values
Nmujeres = pd.read_csv(directorio + 'mujeres.csv', header=None,skiprows=1)[0].values
Apellidos = pd.read_csv(directorio + 'apellidos.csv', header=None,skiprows=1)[0].values
# obtenemos el numero de nombres y apellidos
num_hombres = Nhombres.shape[0]
num_mujeres = Nmujeres.shape[0]
num_apellidos = Apellidos.shape[0]
numero_total = 3000
numero_de_personas = 300
# creamos una lista aleatoria de nombres de hombre y mujer + 2 apellidos
nombres_aleatorios = []
for _ in range(numero_de_personas):
    apellido1 = np.random.choice(Apellidos)
    apellido2 = np.random.choice(Apellidos)
    if pd.isnull(apellido1):
        apellido1 = 'NaN'
    if pd.isnull(apellido2):
        apellido2 = 'NaN'
    if np.random.rand() < 0.5:
        nombre = np.random.choice(Nhombres)
    else:
        nombre = np.random.choice(Nmujeres)
    nombres_aleatorios.append(nombre + ' ' + apellido1 + ' ' + apellido2)
#
# generamos una lista aleatoria de los años 2020 a 2025
year_aleatorios = np.random.choice([2020, 2021, 2022, 2023, 2024, 2025], size=numero_total)
# generamos una lista aleatoria de meses
mes_aleatorios = np.random.choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], size=numero_total)
# generamos una lista aleatoria de días del 1 al 28, ignorando año bisiesto o numero de dias por mes variable
dia_aleatorios = np.random.choice(range(1, 29), size=numero_total)
# generamos una lista aleatoria de montos de creditos de 1000 a 800,000 en paso de 500
montos_aleatorios = np.random.choice(range(1000, 800001, 500), size=numero_total)
# generamos una lista aleatoria de tasa de interes anual del 5% al 55% en paso de 5
tasa_interes_aleatoria = np.random.choice(range(5, 56, 5), size=numero_total)
# generamos una lista aleatoria de plazos de 3 a 18 meses en pasos de 3
plazo_aleatorio = np.random.choice(range(3, 19, 3), size=numero_total)
## creamos la base de datos
import requests
def solicitar_credito(nombre, monto, tasa_interes, plazo, fecha_otorgamiento):
    url = "http://localhost:5000/creditos"
    
    datos = {
        "cliente": nombre,
        "monto": monto,
        "tasa_interes": tasa_interes,
        "plazo": plazo,
        "fecha_otorgamiento": fecha_otorgamiento
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        respuesta = requests.post(url, json=datos, headers=headers)
        respuesta.raise_for_status()  # Lanza excepción si hay error HTTP
        
        print("[OK] Solicitud exitosa:")
        print(f"Código de estado: {respuesta.status_code}")
        print(f"Respuesta: {respuesta.json()}")
        
    except requests.exceptions.RequestException as e:
        print(f"[X] Error en la solicitud: {e}")

# creamos la base de datos
for i in range(numero_total):
    solicitar_credito(
        nombre=np.random.choice(nombres_aleatorios),
        monto=float(montos_aleatorios[i]),
        tasa_interes=float(tasa_interes_aleatoria[i]),
        plazo=int(plazo_aleatorio[i]),
        # formato YYYY-MM-DD
        fecha_otorgamiento=str(year_aleatorios[i]) + '-' + str(mes_aleatorios[i]) + '-' + str(dia_aleatorios[i])
    )