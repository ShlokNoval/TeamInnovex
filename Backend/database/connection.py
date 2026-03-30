import os
from flask_sqlalchemy import SQLAlchemy

from database.extensions import db

def get_database_uri():
    # NeonDB PostgreSQL - Production Database
    return os.environ.get(
        'DATABASE_URL',
        'postgresql://neondb_owner:npg_X3qAWk0EefZJ@ep-royal-unit-amm3c46f-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
    )
