from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import datetime

# --- Configuración ---
app = Flask(__name__)
# Habilita CORS para que tu app web (HTML/JS) pueda llamar a esta API
CORS(app)

# --- ¡IMPORTANTE! Reemplaza esto con tus credenciales de AWS RDS ---
DB_CONFIG = {
    'user': 'admin',
    'password': 'Admin1234#!',
    'host': 'instancia-iot.c30ggo88eign.us-east-1.rds.amazonaws.com',
    'database': 'iot_dispositivo'
}


# --- Función Auxiliar para Conectar a la BD ---
def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error al conectar a MySQL: {e}")
        return None


# --- Ruta 1: Recibir un nuevo comando ---
@app.route('/comando', methods=['POST'])
def agregar_comando():
    # Obtener el comando del JSON que envía el frontend
    data = request.get_json()
    if not data or 'command' not in data:
        return jsonify({'error': 'Comando no proporcionado'}), 400

    comando = data['command']

    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

    try:
        cursor = conn.cursor()
        # Insertar el nuevo comando en la base de datos
        query = "INSERT INTO historial_comandos (comando) VALUES (%s)"
        cursor.execute(query, (comando,))
        conn.commit()

        print(f"Comando recibido y guardado: {comando}")
        return jsonify({'status': 'comando recibido', 'comando': comando}), 201

    except Error as e:
        print(f"Error al insertar en la base de datos: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- Ruta 2: Obtener el historial de comandos ---
@app.route('/historial', methods=['GET'])
def obtener_historial():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

    historial = []
    try:
        cursor = conn.cursor(dictionary=True)  # dictionary=True devuelve filas como dicts

        # Obtener los últimos 10 comandos, del más reciente al más antiguo
        query = "SELECT comando, timestamp FROM historial_comandos ORDER BY timestamp DESC LIMIT 10"
        cursor.execute(query)

        rows = cursor.fetchall()

        for row in rows:
            # Formatear la fecha/hora a un string legible
            row['timestamp'] = row['timestamp'].strftime('%H:%M:%S')
            historial.append(row)

        return jsonify(historial)

    except Error as e:
        print(f"Error al consultar la base de datos: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- Iniciar el servidor ---
if __name__ == '__main__':
    # '0.0.0.0' hace que sea accesible en tu red (necesario para AWS)
    # Si solo estás probando en local, puedes usar '127.0.0.1'
    app.run(host='0.0.0.0', port=5000, debug=True)