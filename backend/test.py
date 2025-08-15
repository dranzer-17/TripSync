from sqlalchemy import create_engine
import psycopg2

# Test different connection approaches
test_urls = [
    "postgresql://postgres:ipd123@127.0.0.1:5433/tripsync_db",  # Explicit IPv4
    "postgresql://postgres:ipd123@localhost:5433/tripsync_db",   # Original
]

for url in test_urls:
    print(f"Testing: {url}")
    try:
        engine = create_engine(url)
        connection = engine.connect()
        print("✅ Connection successful!")
        connection.close()
        break
    except Exception as e:
        print(f"❌ Failed: {e}")
        print()

# Also try direct psycopg2 connection
print("Testing direct psycopg2 connection...")
try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5433,
        database="tripsync_db",
        user="postgres",
        password="ipd123"
    )
    print("✅ Direct psycopg2 connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Direct connection failed: {e}")