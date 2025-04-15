from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
import base64
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = os.environ.get('MODEL_PATH', 'models')
DATA_PATH = os.environ.get('DATA_PATH', 'data')

# Ensure directories exist
os.makedirs(MODEL_PATH, exist_ok=True)
os.makedirs(DATA_PATH, exist_ok=True)
os.makedirs(os.path.join(DATA_PATH, 'sentiment'), exist_ok=True)

# Load models (in a real system, load actual trained models)
# For this example, we'll simulate model predictions
print("Initializing sentiment analysis models...")

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

def detect_faces(image):
    """Detect faces in the image"""
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Use OpenCV's built-in face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    face_regions = []
    for (x, y, w, h) in faces:
        face_regions.append((x, y, x+w, y+h))
    
    return face_regions

def analyze_sentiment(face_image):
    """Analyze sentiment in a face image"""
    # In a real system, use a trained emotion recognition model
    # For this example, we'll simulate sentiment analysis
    
    # Define possible emotions and their probabilities
    emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'confused', 'bored', 'engaged']
    
    # Generate random probabilities (in a real system, use model predictions)
    probabilities = np.random.dirichlet(np.ones(len(emotions)) * 2, size=1)[0]
    
    # Create emotion dictionary
    emotion_dict = {emotion: float(prob) for emotion, prob in zip(emotions, probabilities)}
    
    # Get the dominant emotion
    dominant_emotion = max(emotion_dict, key=emotion_dict.get)
    
    # Calculate engagement score (simplified)
    # In a real system, use more sophisticated metrics
    if dominant_emotion in ['happy', 'surprised', 'engaged']:
        engagement = np.random.uniform(0.7, 1.0)
    elif dominant_emotion in ['neutral']:
        engagement = np.random.uniform(0.4, 0.7)
    else:
        engagement = np.random.uniform(0.1, 0.4)
    
    # Calculate attention score
    attention = np.random.uniform(0.5, 1.0)
    
    return {
        'dominant_emotion': dominant_emotion,
        'emotions': emotion_dict,
        'engagement': round(float(engagement), 2),
        'attention': round(float(attention), 2)
    }

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze():
    """Analyze sentiment in the image"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json['image']
    session_id = request.json.get('sessionId', 'unknown')
    student_id = request.json.get('studentId', 'unknown')
    
    try:
        # Process the image
        image = process_image(image_data)
        
        # Detect faces
        face_regions = detect_faces(image)
        
        if not face_regions:
            return jsonify({
                'success': False,
                'message': 'No faces detected in the image'
            }), 400
        
        results = []
        
        # Analyze each face
        for i, (x1, y1, x2, y2) in enumerate(face_regions):
            # Extract face region
            face_image = image[y1:y2, x1:x2]
            
            # Skip if face is too small
            if face_image.shape[0] < 20 or face_image.shape[1] < 20:
                continue
            
            # Analyze sentiment
            sentiment = analyze_sentiment(face_image)
            
            # Add face region
            sentiment['face_region'] = [int(x1), int(y1), int(x2), int(y2)]
            sentiment['face_id'] = i
            
            results.append(sentiment)
            
            # Draw bounding box and emotion on image
            cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(image, f"{sentiment['dominant_emotion']}", 
                       (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
        
        # Save the analysis image for reference
        if results:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            image_filename = f"sentiment_{student_id}_{session_id}_{timestamp}.jpg"
            cv2.imwrite(os.path.join(DATA_PATH, 'sentiment', image_filename), image)
        
        # Calculate average engagement and attention
        avg_engagement = np.mean([r['engagement'] for r in results]) if results else 0
        avg_attention = np.mean([r['attention'] for r in results]) if results else 0
        
        # Return results
        return jsonify({
            'success': True,
            'message': 'Sentiment analysis completed',
            'face_count': len(results),
            'face_analyses': results,
            'average_engagement': round(float(avg_engagement), 2),
            'average_attention': round(float(avg_attention), 2)
        })
        
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)
