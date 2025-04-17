from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_gateway.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api_gateway")

# Service configurations
FACE_RECOGNITION_SERVICE = os.getenv("FACE_RECOGNITION_SERVICE", "http://localhost:5001")
OBJECT_DETECTION_SERVICE = os.getenv("OBJECT_DETECTION_SERVICE", "http://localhost:5002")
SENTIMENT_ANALYSIS_SERVICE = os.getenv("SENTIMENT_ANALYSIS_SERVICE", "http://localhost:5003")

# Rate limiting configuration
REQUEST_LIMITS = {
    "face_recognition": 10,  # requests per minute
    "object_detection": 10,  # requests per minute
    "sentiment_analysis": 10,  # requests per minute
}

# Simple in-memory request counter for rate limiting
request_counter = {
    "face_recognition": {"count": 0, "reset_time": time.time() + 60},
    "object_detection": {"count": 0, "reset_time": time.time() + 60},
    "sentiment_analysis": {"count": 0, "reset_time": time.time() + 60},
}

# Authentication middleware (in a real app, use JWT or similar)
def require_auth():
    # For now, a very simple authentication check
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != os.getenv("API_KEY", "test_key"):
        return jsonify({"success": False, "message": "Authentication required"}), 401
    return None

# Rate limiting middleware
def check_rate_limit(service_name):
    global request_counter
    
    # Reset counter if the time has passed
    current_time = time.time()
    if current_time > request_counter[service_name]["reset_time"]:
        request_counter[service_name]["count"] = 0
        request_counter[service_name]["reset_time"] = current_time + 60
    
    # Check if over limit
    if request_counter[service_name]["count"] >= REQUEST_LIMITS[service_name]:
        return jsonify({
            "success": False, 
            "message": f"Rate limit exceeded for {service_name} service. Try again later."
        }), 429
    
    # Increment counter
    request_counter[service_name]["count"] += 1
    return None

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    # Check all services
    services_status = {}
    
    try:
        response = requests.get(f"{FACE_RECOGNITION_SERVICE}/health", timeout=2)
        services_status["face_recognition"] = "up" if response.status_code == 200 else "down"
    except Exception as e:
        services_status["face_recognition"] = "down"
        logger.error(f"Face recognition service health check failed: {str(e)}")
    
    try:
        response = requests.get(f"{OBJECT_DETECTION_SERVICE}/health", timeout=2)
        services_status["object_detection"] = "up" if response.status_code == 200 else "down"
    except Exception as e:
        services_status["object_detection"] = "down"
        logger.error(f"Object detection service health check failed: {str(e)}")
    
    try:
        response = requests.get(f"{SENTIMENT_ANALYSIS_SERVICE}/health", timeout=2)
        services_status["sentiment_analysis"] = "up" if response.status_code == 200 else "down"
    except Exception as e:
        services_status["sentiment_analysis"] = "down"
        logger.error(f"Sentiment analysis service health check failed: {str(e)}")
    
    all_services_up = all(status == "up" for status in services_status.values())
    
    return jsonify({
        "status": "ok" if all_services_up else "degraded",
        "services": services_status
    }), 200

# Face Recognition Endpoints
@app.route('/api/face/register', methods=['POST'])
def register_face():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check rate limit
    rate_limit_error = check_rate_limit("face_recognition")
    if rate_limit_error:
        return rate_limit_error
    
    # Forward the request
    try:
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/face/register",
            json=request.json,
            headers={"Content-Type": "application/json"}
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        logger.error(f"Error calling face registration service: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Face registration service unavailable"
        }), 503

@app.route('/api/face/verify', methods=['POST'])
def verify_face():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check rate limit
    rate_limit_error = check_rate_limit("face_recognition")
    if rate_limit_error:
        return rate_limit_error
    
    # Forward the request
    try:
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/face/verify",
            json=request.json,
            headers={"Content-Type": "application/json"}
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        logger.error(f"Error calling face verification service: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Face verification service unavailable"
        }), 503

@app.route('/api/face/analyze', methods=['POST'])
def analyze_face():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check rate limit
    rate_limit_error = check_rate_limit("face_recognition")
    if rate_limit_error:
        return rate_limit_error
    
    # Forward the request
    try:
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/face/analyze",
            json=request.json,
            headers={"Content-Type": "application/json"}
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        logger.error(f"Error calling face analysis service: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Face analysis service unavailable"
        }), 503

# Object Detection Endpoints
@app.route('/api/object-detection/idcard', methods=['POST'])
def detect_id_card():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check rate limit
    rate_limit_error = check_rate_limit("object_detection")
    if rate_limit_error:
        return rate_limit_error
    
    # Forward the request
    try:
        response = requests.post(
            f"{OBJECT_DETECTION_SERVICE}/api/object-detection/idcard",
            json=request.json,
            headers={"Content-Type": "application/json"}
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        logger.error(f"Error calling ID card detection service: {str(e)}")
        return jsonify({
            "success": False,
            "message": "ID card detection service unavailable"
        }), 503

@app.route('/api/object-detection/phone', methods=['POST'])
def detect_phone():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check rate limit
    rate_limit_error = check_rate_limit("object_detection")
    if rate_limit_error:
        return rate_limit_error
    
    # Forward the request
    try:
        response = requests.post(
            f"{OBJECT_DETECTION_SERVICE}/api/object-detection/phone",
            json=request.json,
            headers={"Content-Type": "application/json"}
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        logger.error(f"Error calling phone detection service: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Phone detection service unavailable"
        }), 503

# Sentiment Analysis Endpoints
@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check rate limit
    rate_limit_error = check_rate_limit("sentiment_analysis")
    if rate_limit_error:
        return rate_limit_error
    
    # Forward the request
    try:
        response = requests.post(
            f"{SENTIMENT_ANALYSIS_SERVICE}/api/sentiment/analyze",
            json=request.json,
            headers={"Content-Type": "application/json"}
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        logger.error(f"Error calling sentiment analysis service: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Sentiment analysis service unavailable"
        }), 503

# Analyze All (Combined Analysis)
@app.route('/api/analyze/all', methods=['POST'])
def analyze_all():
    # Check auth
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Check all rate limits
    for service in ["face_recognition", "object_detection", "sentiment_analysis"]:
        rate_limit_error = check_rate_limit(service)
        if rate_limit_error:
            return rate_limit_error
    
    # Get the image data
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json.get('image')
    session_id = request.json.get('sessionId', 'unknown')
    student_id = request.json.get('studentId', 'unknown')
    
    # Prepare payload for each service
    face_payload = {
        'image': image_data,
        'studentId': student_id,
        'sessionId': session_id
    }
    
    object_payload = {
        'image': image_data,
        'sessionId': session_id
    }
    
    sentiment_payload = {
        'image': image_data,
        'studentId': student_id,
        'sessionId': session_id
    }
    
    # Function to call each service
    def call_service(service_url, payload):
        try:
            response = requests.post(
                service_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            return response.json() if response.status_code == 200 else {'success': False, 'error': f"Status code: {response.status_code}"}
        except Exception as e:
            logger.error(f"Error calling service {service_url}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # Call all services in parallel
    results = {}
    services = [
        (f"{FACE_RECOGNITION_SERVICE}/api/face/verify", face_payload, "face_verification"),
        (f"{OBJECT_DETECTION_SERVICE}/api/object-detection/idcard", object_payload, "id_card_detection"),
        (f"{OBJECT_DETECTION_SERVICE}/api/object-detection/phone", object_payload, "phone_detection"),
        (f"{SENTIMENT_ANALYSIS_SERVICE}/api/sentiment/analyze", sentiment_payload, "sentiment_analysis")
    ]
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all tasks
        future_to_service = {
            executor.submit(call_service, url, payload): service_name
            for url, payload, service_name in services
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_service):
            service_name = future_to_service[future]
            results[service_name] = future.result()
    
    # Extract results and combine them
    analysis_result = {'success': True}
    
    # Face verification result
    face_result = results.get('face_verification', {})
    if face_result.get('success'):
        analysis_result['faceVerified'] = face_result.get('verified', False)
        analysis_result['faceConfidence'] = face_result.get('confidence', 0)
    else:
        analysis_result['faceVerified'] = False
        analysis_result['faceError'] = face_result.get('error', 'Unknown error')
    
    # ID card detection result
    id_card_result = results.get('id_card_detection', {})
    if id_card_result.get('success'):
        analysis_result['idCardVisible'] = id_card_result.get('idCardVisible', False)
        analysis_result['idCardConfidence'] = id_card_result.get('confidence', 0)
    else:
        analysis_result['idCardVisible'] = False
        analysis_result['idCardError'] = id_card_result.get('error', 'Unknown error')
    
    # Phone detection result
    phone_result = results.get('phone_detection', {})
    if phone_result.get('success'):
        analysis_result['phoneDetected'] = phone_result.get('phoneDetected', False)
        analysis_result['phoneConfidence'] = phone_result.get('confidence', 0)
    else:
        analysis_result['phoneDetected'] = False
        analysis_result['phoneError'] = phone_result.get('error', 'Unknown error')
    
    # Sentiment analysis result
    sentiment_result = results.get('sentiment_analysis', {})
    if sentiment_result.get('success'):
        analysis_result['sentimentAnalyzed'] = True
        analysis_result['dominantEmotion'] = sentiment_result.get('face_analyses', [{}])[0].get('dominant_emotion', 'neutral')
        analysis_result['engagement'] = sentiment_result.get('average_engagement', 0)
        analysis_result['attention'] = sentiment_result.get('average_attention', 0)
    else:
        analysis_result['sentimentAnalyzed'] = False
        analysis_result['sentimentError'] = sentiment_result.get('error', 'Unknown error')
    
    # Add timestamp and metadata
    analysis_result['timestamp'] = time.time()
    analysis_result['sessionId'] = session_id
    analysis_result['studentId'] = student_id
    
    return jsonify(analysis_result), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'message': 'Method not allowed'
    }), 405

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 8080))
    debug = os.getenv("DEBUG", "False").lower() in ['true', '1', 't']
    
    logger.info(f"Starting API Gateway on port {port}")
    logger.info(f"Face Recognition Service: {FACE_RECOGNITION_SERVICE}")
    logger.info(f"Object Detection Service: {OBJECT_DETECTION_SERVICE}")
    logger.info(f"Sentiment Analysis Service: {SENTIMENT_ANALYSIS_SERVICE}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)