from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
import jwt
from datetime import datetime, timedelta
import time

app = Flask(__name__)
CORS(app)

# Configuration
FACE_RECOGNITION_URL = os.environ.get('FACE_RECOGNITION_URL', 'http://localhost:5001')
OBJECT_DETECTION_URL = os.environ.get('OBJECT_DETECTION_URL', 'http://localhost:5002')
SENTIMENT_ANALYSIS_URL = os.environ.get('SENTIMENT_ANALYSIS_URL', 'http://localhost:5003')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your_jwt_secret_key')

# Helper function to verify JWT
def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Middleware to check authentication
def auth_required(f):
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        return f(*args, **kwargs)
    
    # Rename the function to the original name
    decorated.__name__ = f.__name__
    return decorated

# Face Recognition Endpoints
@app.route('/api/face/register', methods=['POST'])
@auth_required
def register_face():
    """Register a face for a student"""
    response = requests.post(f"{FACE_RECOGNITION_URL}/api/face/register", json=request.json)
    return response.json(), response.status_code

@app.route('/api/face/verify', methods=['POST'])
@auth_required
def verify_face():
    """Verify a face against registered faces"""
    response = requests.post(f"{FACE_RECOGNITION_URL}/api/face/verify", json=request.json)
    return response.json(), response.status_code

@app.route('/api/face/analyze', methods=['POST'])
@auth_required
def analyze_face():
    """Analyze face for engagement metrics"""
    response = requests.post(f"{FACE_RECOGNITION_URL}/api/face/analyze", json=request.json)
    return response.json(), response.status_code

# Object Detection Endpoints
@app.route('/api/object-detection/idcard', methods=['POST'])
@auth_required
def detect_idcard():
    """Detect ID cards in the image"""
    response = requests.post(f"{OBJECT_DETECTION_URL}/api/object-detection/idcard", json=request.json)
    return response.json(), response.status_code

@app.route('/api/object-detection/phone', methods=['POST'])
@auth_required
def detect_phone():
    """Detect phones in the image"""
    response = requests.post(f"{OBJECT_DETECTION_URL}/api/object-detection/phone", json=request.json)
    return response.json(), response.status_code

# Sentiment Analysis Endpoints
@app.route('/api/sentiment/analyze', methods=['POST'])
@auth_required
def analyze_sentiment():
    """Analyze sentiment in the image"""
    response = requests.post(f"{SENTIMENT_ANALYSIS_URL}/api/sentiment/analyze", json=request.json)
    return response.json(), response.status_code

# Combined Analysis Endpoint (for convenience)
@app.route('/api/analyze/all', methods=['POST'])
@auth_required
def analyze_all():
    """Perform all analyses on a single image"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json['image']
    session_id = request.json.get('sessionId', 'unknown')
    student_id = request.json.get('studentId', 'unknown')
    
    try:
        # Create payload
        payload = {
            'image': image_data,
            'sessionId': session_id,
            'studentId': student_id
        }
        
        # Verify face
        face_response = requests.post(f"{FACE_RECOGNITION_URL}/api/face/verify", json=payload)
        face_data = face_response.json()
        
        # Check if face verification failed
        if not face_response.ok or not face_data.get('success', False):
            return face_data, face_response.status_code
        
        # Continue with other analyses
        results = {
            'face': face_data
        }
        
        # Detect ID card
        idcard_response = requests.post(f"{OBJECT_DETECTION_URL}/api/object-detection/idcard", json=payload)
        results['idcard'] = idcard_response.json()
        
        # Detect phone
        phone_response = requests.post(f"{OBJECT_DETECTION_URL}/api/object-detection/phone", json=payload)
        results['phone'] = phone_response.json()
        
        # Analyze sentiment
        sentiment_response = requests.post(f"{SENTIMENT_ANALYSIS_URL}/api/sentiment/analyze", json=payload)
        results['sentiment'] = sentiment_response.json()
        
        # Combine results
        combined_result = {
            'success': True,
            'message': 'Combined analysis completed',
            'studentId': student_id,
            'sessionId': session_id,
            'timestamp': datetime.now().isoformat(),
            'analyses': results,
            'summary': {
                'faceVerified': face_data.get('success', False),
                'idCardVisible': results['idcard'].get('idCardVisible', False) if results['idcard'].get('success', False) else False,
                'phoneDetected': results['phone'].get('phoneDetected', False) if results['phone'].get('success', False) else False,
                'engagement': results['sentiment'].get('average_engagement', 0) if results['sentiment'].get('success', False) else 0,
                'attention': results['sentiment'].get('average_attention', 0) if results['sentiment'].get('success', False) else 0,
            }
        }
        
        return jsonify(combined_result)
        
    except Exception as e:
        print(f"Error in combined analysis: {e}")
        return jsonify({'success': False, 'message': f'Error performing combined analysis: {str(e)}'}), 500

# Authentication endpoint (for development and testing)
@app.route('/api/auth/token', methods=['POST'])
def get_token():
    """Get JWT token for testing (in production, use the main auth service)"""
    if not request.json or 'username' not in request.json or 'password' not in request.json:
        return jsonify({'success': False, 'message': 'Missing credentials'}), 400
    
    # In a real system, validate credentials against a database
    # For this example, accept any username/password combination
    username = request.json['username']
    
    # Create token payload
    payload = {
        'sub': username,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=1),
        'role': 'developer'  # For testing purposes
    }
    
    # Generate token
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    return jsonify({
        'success': True,
        'token': token,
        'expires_in': 3600  # 1 hour
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Check all services
    services_status = {}
    
    try:
        face_response = requests.get(f"{FACE_RECOGNITION_URL}/health", timeout=2)
        services_status['face_recognition'] = face_response.ok
    except:
        services_status['face_recognition'] = False
    
    try:
        object_response = requests.get(f"{OBJECT_DETECTION_URL}/health", timeout=2)
        services_status['object_detection'] = object_response.ok
    except:
        services_status['object_detection'] = False
    
    try:
        sentiment_response = requests.get(f"{SENTIMENT_ANALYSIS_URL}/health", timeout=2)
        services_status['sentiment_analysis'] = sentiment_response.ok
    except:
        services_status['sentiment_analysis'] = False
    
    # Check if all services are up
    all_services_up = all(services_status.values())
    
    return jsonify({
        'status': 'ok' if all_services_up else 'degraded',
        'services': services_status,
        'timestamp': datetime.now().isoformat()
    }), 200 if all_services_up else 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
