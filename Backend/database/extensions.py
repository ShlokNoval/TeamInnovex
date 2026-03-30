from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()
# cors_allowed_origins="*" allows ngrok tunnels, mobile browsers, and any external client
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode='threading',
    logger=False,
    engineio_logger=False
)
