from main import create_app
from database.connection import db
from database.models import User
from werkzeug.security import generate_password_hash

def seed_admin():
    app = create_app()
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            print("Creating admin user...")
            new_admin = User(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(new_admin)
            db.session.commit()
            print("Admin user created successfully: admin / admin123")
        else:
            print("Admin user already exists.")

if __name__ == "__main__":
    seed_admin()
