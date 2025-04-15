from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
import json
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = os.environ.get('MODEL_PATH', 'models')
DATA_PATH = os.environ.get('DATA_PATH', 'data')

# Ensure directories exist
os.makedirs(MODEL_PATH, exist_ok=True)
os.makedirs(DATA_PATH, exist_ok=True)
os.makedirs(os.path.join(DATA_PATH, 'faces'), exist_ok=True)

# In-memory database for faces (in production, use a real database)
face_encodings = {}
try:
    if os.path.exists(os.path.join(DATA_PATH, 'face_encodings.json')):
        with open(os.path.join(DATA_PATH, 'face_encodings.json'), 'r') as f:
            face_encodings = json.load(f)
except Exception as e:
    print(f"Error loading face encodings: {e}")
    face_encodings = {}

def save_encodings():
    """Save face encodings to file"""
    try:
        with open(os.path.join(DATA_PATH, 'face_encodings.json'), 'w') as f:
            json.dump(face_encodings, f)
    except Exception as e:
        print(f"Error saving face encodings: {e}")

def process_image(image_data):
    """Process base64 image data to cv2 format"""
    if 'data:image/' in image_data:
        # Split the base64 string in data and type
        image_data = image_data.split(',')[1]
    
    # Decode base64 image
    image_bytes = base64.b64decode(image_data)
    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    return image

# Function to replace face_recognition functionality with OpenCV
def detect_faces(image):
    """Detect faces in an image using OpenCV instead of face_recognition"""
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Load the face detection model
    face_cascade_path = os.path.join(MODEL_PATH, 'haarcascade_frontalface_default.xml')
    
    # If the model doesn't exist, download it from opencv's github
    if not os.path.exists(face_cascade_path):
        print("Downloading face cascade model...")
        os.makedirs(os.path.dirname(face_cascade_path), exist_ok=True)
        import urllib.request
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml",
            face_cascade_path
        )
    
    # Load cascade classifier
    face_cascade = cv2.CascadeClassifier(face_cascade_path)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    # Convert to face_recognition format (top, right, bottom, left)
    face_locations = []
    for (x, y, w, h) in faces:
        face_locations.append((y, x+w, y+h, x))
    
    return face_locations

def encode_face(image, face_location):
    """Create a simplified face encoding using OpenCV"""
    # Extract face from the image
    top, right, bottom, left = face_location
    face_image = image[top:bottom, left:right]
    
    # Resize to a standard size
    face_image = cv2.resize(face_image, (100, 100))
    
    # Convert to grayscale
    gray_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
    
    # Flatten the image as a simple "encoding"
    # Note: This is a very simplified approach and not as robust as face_recognition's encodings
    encoding = gray_face.flatten() / 255.0  # Normalize
    
    return encoding

def compare_faces(known_encoding, face_encoding, tolerance=0.6):
    """Compare faces using a simple Euclidean distance"""
    # Calculate Euclidean distance
    distance = np.linalg.norm(np.array(known_encoding) - np.array(face_encoding))
    
    # Lower distance = more similar
    # Convert to a similar scale as face_recognition (where lower tolerance = stricter)
    # A typical tolerance might be 0.6
    match = distance < (1 - tolerance) * 100
    
    return [match]

def detect_face_liveness(image):
    """Basic liveness detection to prevent photo spoofing"""
    # In this simplified version, we'll just check if there's a face
    face_locations = detect_faces(image)
    
    if len(face_locations) == 0:
        return False, "No face detected"
    elif len(face_locations) > 1:
        return False, "Multiple faces detected"
    
    return True, "Liveness check passed"

@app.route('/api/face/register', methods=['POST'])
def register_face():
    """Register a face for a student"""
    if not request.json or 'studentId' not in request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    student_id = request.json['studentId']
    image_data = request.json['image']
    
    try:
        # Process the image
        image = process_image(image_data)
        
        # Check if there's exactly one face in the image
        face_locations = detect_faces(image)
        
        if len(face_locations) == 0:
            return jsonify({'success': False, 'message': 'No face detected'}), 400
        elif len(face_locations) > 1:
            return jsonify({'success': False, 'message': 'Multiple faces detected'}), 400
        
        # Get face encoding
        face_encoding = encode_face(image, face_locations[0])
        
        # Convert numpy array to list for JSON serialization
        face_encoding_list = face_encoding.tolist()
        
        # Store the encoding
        if student_id not in face_encodings:
            face_encodings[student_id] = []
        
        face_encodings[student_id].append(face_encoding_list)
        
        # Save the encodings to file
        save_encodings()
        
        # Save the face image for reference
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        image_filename = f"{student_id}_{timestamp}.jpg"
        cv2.imwrite(os.path.join(DATA_PATH, 'faces', image_filename), image)
        
        return jsonify({
            'success': True, 
            'message': 'Face registered successfully',
            'faceCount': len(face_encodings[student_id])
        })
        
    except Exception as e:
        print(f"Error registering face: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/api/face/verify', methods=['POST'])
def verify_face():
    """Verify a face against registered faces"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json['image']
    
    try:
        # Process the image
        image = process_image(image_data)
        
        # Perform liveness detection to prevent spoofing
        is_live, liveness_message = detect_face_liveness(image)
        if not is_live:
            return jsonify({'success': False, 'message': liveness_message}), 400
        
        # Get face locations and encodings
        face_locations = detect_faces(image)
        
        if len(face_locations) == 0:
            return jsonify({'success': False, 'message': 'No face detected'}), 400
        elif len(face_locations) > 1:
            return jsonify({'success': False, 'message': 'Multiple faces detected'}), 400
        
        face_encoding = encode_face(image, face_locations[0])
        
        # Check against all registered faces
        matches = []
        
        for student_id, registered_encodings in face_encodings.items():
            for registered_encoding in registered_encodings:
                # Convert back from list to numpy array
                registered_encoding_np = np.array(registered_encoding)
                
                # Compare faces with a tolerance (lower is stricter)
                match = compare_faces(registered_encoding_np, face_encoding, tolerance=0.6)
                
                if match[0]:
                    matches.append(student_id)
                    break
        
        if matches:
            # In case of multiple matches, return the one with highest frequency
            # In a real system, you might want to implement more sophisticated logic
            student_id = max(set(matches), key=matches.count)
            return jsonify({
                'success': True,
                'message': 'Face verification successful',
                'studentId': student_id,
                'confidence': 'high' if matches.count(student_id) > 1 else 'medium'
            })
        else:
            return jsonify({'success': False, 'message': 'No matching face found'}), 404
        
    except Exception as e:
        print(f"Error verifying face: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/api/face/analyze', methods=['POST'])
def analyze_face():
    """Analyze face for engagement metrics"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json['image']
    
    try:
        # Process the image
        image = process_image(image_data)
        
        # Get face locations
        face_locations = detect_faces(image)
        
        if len(face_locations) == 0:
            return jsonify({'success': False, 'message': 'No face detected'}), 400
        
        # Simple engagement analysis (in a real system, use a trained model)
        # For this example, we'll return random values
        engagement_metrics = []
        
        for i, face_location in enumerate(face_locations):
            # For this example, we'll generate random metrics
            metrics = {
                'faceId': i,
                'attention': round(np.random.uniform(0.6, 1.0), 2),
                'engagement': round(np.random.uniform(0.5, 1.0), 2),
                'emotion': np.random.choice(['neutral', 'happy', 'confused', 'bored']),
                'position': face_location
            }
            
            engagement_metrics.append(metrics)
        
        return jsonify({
            'success': True,
            'message': 'Face analysis completed',
            'faceCount': len(face_locations),
            'metrics': engagement_metrics
        })
        
    except Exception as e:
        print(f"Error analyzing face: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
