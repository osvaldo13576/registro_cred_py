import sqlite3
from sqlite3 import Error

def create_connection():
    # creamos la conexión a la base de datos SQLite
    conn = None
    try:
        conn = sqlite3.connect('creditos.db')
        print("Conexión a SQLite exitosa")
        return conn
    except Error as e:
        print(f"Error al conectar a SQLite: {e}")
    return conn

def create_table():
    # Creamos la tabla de créditos si no existe
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS creditos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cliente TEXT NOT NULL,
                    monto REAL NOT NULL,
                    tasa_interes REAL NOT NULL,
                    plazo INTEGER NOT NULL,
                    fecha_otorgamiento TEXT NOT NULL
                )
            ''')
            conn.commit()
            print("Tabla 'creditos' creada o ya existe")
        except Error as e:
            print(f"Error al crear tabla: {e}")
        finally:
            conn.close()