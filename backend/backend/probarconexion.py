import psycopg2

try:
    conn = psycopg2.connect(
        dbname="terrax_db",
        user="postgres",
        password="admin",  # Cambiá esto si tu contraseña es otra
        host="localhost",
        port="5432"
    )
    print("Conexión exitosa")
    conn.close()
except Exception as e:
    print("Error en la conexión:", e)