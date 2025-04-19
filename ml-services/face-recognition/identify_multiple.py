import cv2
import numpy as np
import os
import json
from datetime import datetime
from flask import jsonify

# Load face encodings from file
def load_encodings():
    encodings_file = os.path.join(DATA_PATH, 'encodings.json')
    if os.path.exists(encodings_file):
        with open(encodings_file, 'r') as f:
            return json.load(f)
    return {}

# Save face encodings to file
def save_encodings():
    encodings_file = os.path.join(DATA_PATH, 'encodings.json')
    with open(encodings_file, 'w') as f:
        json.dump(face_encodings, f)

# Process base64 image
def process_image(image_data):
    """Process base64 image data"""
    # Remove header if present
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Decode base64 image
    import base64
    image_bytes = base64.b64decode(image_data)
    
    # Convert to numpy array
    import numpy as np
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # Decode image
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image

# Detect faces in an image
def detect_faces(image):
    """Detect faces in an image using OpenCV"""
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

# Create a face encoding
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
    encoding = gray_face.flatten() / 255.0  # Normalize
    
    return encoding

# Compare faces
def compare_faces(known_encoding, face_encoding, tolerance=0.6):
    """Compare faces using a simple Euclidean distance"""
    # Calculate Euclidean distance
    distance = np.linalg.norm(np.array(known_encoding) - np.array(face_encoding))
    
    # Lower distance = more similar
    # Convert to a similar scale as face_recognition (where lower tolerance = stricter)
    # A typical tolerance might be 0.6
    match = distance < (1 - tolerance) * 100
    
    return match, distance

# Identify multiple faces in an image
def identify_multiple_faces(image_data, encodings_data):
    """Identify multiple faces in an image"""
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
                    is_match, distance = compare_faces(known_encoding, face_encoding, tolerance=0.6)
                    
                    if is_match and distance < best_distance:
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
        
        return {
            'success': True,
            'message': f'Identified {len(matches)} faces',
            'matches': matches,
            'totalFaces': len(face_locations)
        }
        
    except Exception as e:
        print(f"Error identifying faces: {e}")
        return {'success': False, 'message': f'Error processing image: {str(e)}'}

# Add this to your Flask routes
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
    
    # Identify faces
    result = identify_multiple_faces(image_data, encodings_data)
    
    return jsonify(result)
