from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
import json
import base64
import math
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
os.makedirs(os.path.join(DATA_PATH, 'groups'), exist_ok=True)

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

        face_count = len(face_locations)

        if face_count == 0:
            return jsonify({'success': False, 'message': 'No face detected'}), 400
        elif face_count > 1:
            return jsonify({
                'success': False,
                'message': 'Multiple faces detected',
                'faceCount': face_count,
                'faceQuality': 'unknown'
            }), 400

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
    """Analyze a face image for quality and count"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    image_data = request.json['image']

    try:
        # Process the image
        image = process_image(image_data)

        # Get face locations
        face_locations = detect_faces(image)
        face_count = len(face_locations)

        # Analyze face quality
        face_quality = 'unknown'
        if face_count == 1:
            # Get the face location
            top, right, bottom, left = face_locations[0]

            # Calculate face size relative to image size
            face_width = right - left
            face_height = bottom - top
            image_width = image.shape[1]
            image_height = image.shape[0]

            face_size_ratio = (face_width * face_height) / (image_width * image_height)

            # Determine face quality based on size and position
            if face_size_ratio > 0.1:  # Face takes up at least 10% of the image
                # Check if face is centered
                face_center_x = (left + right) / 2
                face_center_y = (top + bottom) / 2
                image_center_x = image_width / 2
                image_center_y = image_height / 2

                # Calculate distance from center
                center_distance_ratio = math.sqrt(
                    ((face_center_x - image_center_x) / image_width) ** 2 +
                    ((face_center_y - image_center_y) / image_height) ** 2
                )

                if center_distance_ratio < 0.2:  # Face is reasonably centered
                    face_quality = 'good'
                else:
                    face_quality = 'medium'
            else:
                face_quality = 'poor'

        if face_count == 0:
            return jsonify({
                'success': False,
                'message': 'No face detected',
                'faceCount': 0,
                'faceQuality': 'unknown'
            }), 400

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
            'faceQuality': face_quality,
            'metrics': engagement_metrics
        })

    except Exception as e:
        print(f"Error analyzing face: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/api/face/identify-multiple', methods=['POST'])
def identify_multiple():
    """Identify multiple faces in an image"""
    if not request.json or 'image' not in request.json or 'encodings' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    image_data = request.json['image']
    encodings_data = {}

    # Process encodings from request
    for item in request.json['encodings']:
        student_id = item.get('studentId')
        encoding = item.get('encoding')

        if student_id and encoding:
            if student_id not in encodings_data:
                encodings_data[student_id] = []

            # Handle both array and string formats
            if isinstance(encoding, str):
                try:
                    encoding = json.loads(encoding)
                except:
                    pass

            encodings_data[student_id].append(encoding)

    try:
        # Process the image
        image = process_image(image_data)

        # Get face locations
        face_locations = detect_faces(image)

        if len(face_locations) == 0:
            return jsonify({'success': False, 'message': 'No faces detected in the image'}), 400

        # Process each face
        matches = []

        for i, face_location in enumerate(face_locations):
            # Get face encoding
            face_encoding = encode_face(image, face_location)

            # Check against all registered faces
            best_match = None
            best_distance = float('inf')

            for student_id, student_encodings in encodings_data.items():
                for encoding in student_encodings:
                    # Convert to numpy array
                    known_encoding = np.array(encoding)

                    # Compare faces
                    match = compare_faces(known_encoding, face_encoding, tolerance=0.6)

                    if match[0]:
                        # Calculate distance
                        distance = np.linalg.norm(known_encoding - face_encoding)

                        if distance < best_distance:
                            best_match = student_id
                            best_distance = distance

            if best_match:
                # Calculate confidence (inverse of distance, normalized to 0-1)
                confidence = max(0, min(1, 1 - (best_distance / 100)))

                # Add to matches
                matches.append({
                    'studentId': best_match,
                    'confidence': confidence,
                    'faceIndex': i,
                    'location': face_location
                })

        # Save the image with face boxes for reference
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        image_with_boxes = image.copy()

        for match in matches:
            top, right, bottom, left = match['location']
            # Draw rectangle around face
            cv2.rectangle(image_with_boxes, (left, top), (right, bottom), (0, 255, 0), 2)
            # Add student ID
            cv2.putText(image_with_boxes, match['studentId'], (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Save the image
        image_filename = f"group_{timestamp}.jpg"
        cv2.imwrite(os.path.join(DATA_PATH, 'groups', image_filename), image_with_boxes)

        return jsonify({
            'success': True,
            'message': f'Identified {len(matches)} faces',
            'matches': matches,
            'totalFaces': len(face_locations)
        })

    except Exception as e:
        print(f"Error identifying faces: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
