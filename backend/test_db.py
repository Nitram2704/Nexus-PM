import psycopg2
try:
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres.iotfyanhfasaukushinz",
        password="nuevacontrase",
        host="aws-1-us-west-2.pooler.supabase.com",
        port="6543"
    )
    print("Success!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
