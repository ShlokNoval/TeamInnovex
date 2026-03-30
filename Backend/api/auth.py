from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from database.connection import db
from database.models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Simple sign up for judges/admins."""
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400
        
    new_user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Simple login generating JWT token."""
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Bad username or password"}), 401
        
    access_token = create_access_token(identity=user.username)
    return jsonify({
        "access_token": access_token,
        "username": user.username,
        "role": user.role
    }), 200
