from flask import Flask
from flask_cors import CORS
from database.extensions import db, socketio
from database.connection import get_database_uri
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Secret Key for JWT
    app.config['JWT_SECRET_KEY'] = 'hackathon-super-secret-key-123'
    jwt = JWTManager(app)
    
    db.init_app(app)
    socketio.init_app(app)
    
    with app.app_context():
        # Import models here so SQLAlchemy knows about them
        from database.models import UploadSession
        db.create_all()
        
        # Ensure a default session for live streaming exists to prevent FK integrity errors
        if not UploadSession.query.get('live-session-001'):
            live_session = UploadSession(
                id='live-session-001',
                filename='LIVESTREAM_NODELINK',
                file_type='video',
                status='processing',
                label='Neural Node Live Link'
            )
            db.session.add(live_session)
            db.session.commit()
            print("[Backend] Default live session created: live-session-001")
        
    # Register API blueprints
    from api.routes import api_bp
    from api.auth import auth_bp
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
    
    # Register WebSocket events
    import api.websocket
        
    return app

app = create_app()

if __name__ == "__main__":
    import os
    port = int(os.environ.get('PORT', 8000))
    socketio.run(app, debug=True, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)

