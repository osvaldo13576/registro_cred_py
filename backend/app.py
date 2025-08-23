from flask import Flask
from base_datos import create_table
from rutas import init_routes
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # Habilitar CORS para evitar problemas de acceso
    CORS(app)

    # Configuración
    app.config['JSON_SORT_KEYS'] = False
    
    # Inicializar base de datos
    create_table()
    
    # Inicializar rutas
    init_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)