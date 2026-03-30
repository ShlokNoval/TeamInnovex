from sqlalchemy import create_engine, text
import os

DATABASE_URL = 'postgresql://neondb_owner:npg_X3qAWk0EefZJ@ep-royal-unit-amm3c46f-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

print(f"Testing connection to: {DATABASE_URL.split('@')[1]}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"Connection SUCCESS: {result.fetchone()}")
except Exception as e:
    print(f"Connection FAILED: {str(e)}")
