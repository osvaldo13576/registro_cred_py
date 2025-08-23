from flask import request, jsonify
from base_datos import create_connection
from modelos import Credito

"""
Usamos los metodos:
    - GET para obtener todos los créditos o un crédito específico por ID.
    - POST para crear un nuevo crédito.
    - PUT para actualizar un crédito existente.
    - DELETE para eliminar un crédito.
"""

def init_routes(app):
    @app.route('/creditos', methods=['GET'])
    def get_creditos():
        """obtenemos todos los créditos"""
        conn = create_connection()
        if conn is None:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM creditos")
            rows = cursor.fetchall()
            # mapeamos los resultados a objetos Credito
            creditos = []
            for row in rows:
                credito = Credito(
                    id=row[0],
                    cliente=row[1],
                    monto=row[2],
                    tasa_interes=row[3],
                    plazo=row[4],
                    fecha_otorgamiento=row[5]
                )
                creditos.append(credito.to_dict())
            # devolvemos la lista de créditos
            return jsonify(creditos)
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()
    # Obtener un crédito específico por ID
    @app.route('/creditos/<int:credito_id>', methods=['GET'])
    def get_credito(credito_id):
        """Obtener un crédito específico por ID"""
        conn = create_connection()
        if conn is None:
            # manejo de error de conexión en caso de fallo
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        try:
            # Obtener un cursor
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM creditos WHERE id = ?", (credito_id,))
            row = cursor.fetchone()
            
            if row is None:
                # manejo de error en caso de que no se encuentre el crédito
                return jsonify({'error': 'Crédito no encontrado'}), 404
            
            credito = Credito(
                id=row[0],
                cliente=row[1],
                monto=row[2],
                tasa_interes=row[3],
                plazo=row[4],
                fecha_otorgamiento=row[5]
            )
            # devolvemos el crédito encontrado
            return jsonify(credito.to_dict())
        
        except Exception as e:
            # devolvemos un error genérico en caso de excepción
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()
    # Crear un nuevo crédito
    @app.route('/creditos', methods=['POST'])
    def create_credito():
        """Crear un nuevo crédito"""
        data = request.get_json()
        
        # validaciones básicas
        required_fields = ['cliente', 'monto', 'tasa_interes', 'plazo', 'fecha_otorgamiento']
        for field in required_fields:
            if field not in data:
                # se muestra un error si falta algún campo requerido
                return jsonify({'error': f'Campo {field} es requerido'}), 400
        
        try:
            # Creamos un nuevo objeto Credito
            credito = Credito(
                cliente=data['cliente'],
                monto=float(data['monto']),
                tasa_interes=float(data['tasa_interes']),
                plazo=int(data['plazo']),
                fecha_otorgamiento=data['fecha_otorgamiento']
            )
        except ValueError as e:
            return jsonify({'error': 'Datos inválidos'}), 400
        
        conn = create_connection()
        if conn is None:
            # se regresa un error de conexión si no se puede establecer la conexión
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        try:
            cursor = conn.cursor()
            # Insertar el nuevo crédito en la base de datos
            cursor.execute('''
                INSERT INTO creditos (cliente, monto, tasa_interes, plazo, fecha_otorgamiento)
                VALUES (?, ?, ?, ?, ?)
            ''', (credito.cliente, credito.monto, credito.tasa_interes, credito.plazo, credito.fecha_otorgamiento))
            
            conn.commit()
            credito.id = cursor.lastrowid
            
            return jsonify(credito.to_dict()), 201
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()
    # Actualizar un crédito existente con la función PUT
    @app.route('/creditos/<int:credito_id>', methods=['PUT'])
    def update_credito(credito_id):
        """Actualizar un crédito existente"""
        data = request.get_json()
        
        conn = create_connection()
        if conn is None:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        try:
            cursor = conn.cursor()
            
            # verificamod si el crédito existe
            cursor.execute("SELECT * FROM creditos WHERE id = ?", (credito_id,))
            if cursor.fetchone() is None:
                return jsonify({'error': 'Crédito no encontrado'}), 404
            
            # se construye la consulta
            update_fields = []
            values = []
            # se verifica si el campo 'cliente' está presente
            if 'cliente' in data:
                update_fields.append("cliente = ?")
                values.append(data['cliente'])
            # se verifica si el campo 'monto' está presente
            if 'monto' in data:
                update_fields.append("monto = ?")
                values.append(float(data['monto']))
            # se verifica si el campo 'tasa_interes' está presente
            if 'tasa_interes' in data:
                update_fields.append("tasa_interes = ?")
                values.append(float(data['tasa_interes']))
            # se verifica si el campo 'plazo' está presente
            if 'plazo' in data:
                update_fields.append("plazo = ?")
                values.append(int(data['plazo']))
            # se verifica si el campo 'fecha_otorgamiento' está presente
            if 'fecha_otorgamiento' in data:
                update_fields.append("fecha_otorgamiento = ?")
                values.append(data['fecha_otorgamiento'])
            # se verifica si el campo 'estado' está presente
            if 'estado' in data:
                update_fields.append("estado = ?")
                values.append(data['estado'])
            # se verifica si no se proporcionaron campos para actualizar
            if not update_fields:
                return jsonify({'error': 'No se proporcionaron campos para actualizar'}), 400
            
            values.append(credito_id)
            query = f"UPDATE creditos SET {', '.join(update_fields)} WHERE id = ?"
            
            cursor.execute(query, values)
            conn.commit()
            
            return jsonify({'message': 'Credito actualizado correctamente'})
        
        except ValueError as e:
            return jsonify({'error': 'Datos invalidos'}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()
    # Eliminar un crédito con el método DELETE
    @app.route('/creditos/<int:credito_id>', methods=['DELETE'])
    def delete_credito(credito_id):
        """Eliminar un crédito"""
        conn = create_connection()
        if conn is None:
            return jsonify({'error': 'Error de conexion a la base de datos'}), 500
        
        try:
            cursor = conn.cursor()

            # se verifica si el crédito existe y se ejecuta la consulta
            cursor.execute("SELECT * FROM creditos WHERE id = ?", (credito_id,))
            if cursor.fetchone() is None:
                return jsonify({'error': 'Credito no encontrado'}), 404
            # se ejecuta la consulta de eliminación
            cursor.execute("DELETE FROM creditos WHERE id = ?", (credito_id,))
            conn.commit()
            
            return jsonify({'message': 'Credito eliminado correctamente'})
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()

