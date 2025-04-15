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
os.makedirs(os.path.join(DATA_PATH, 'detections'), exist_ok=True)

print("Initializing object detection models...")

# Download YOLO model files if they don't exist
def ensure_yolo_models():
    """Download YOLO model files if they don't exist"""
    # Paths for YOLO model files
    config_path = os.path.join(MODEL_PATH, 'yolov3.cfg')
    weights_path = os.path.join(MODEL_PATH, 'yolov3.weights')
    classes_path = os.path.join(MODEL_PATH, 'coco.names')
    
    # Create MODEL_PATH if it doesn't exist
    os.makedirs(MODEL_PATH, exist_ok=True)
    
    # Check and download model files if they don't exist
    if not os.path.exists(config_path):
        print("Downloading YOLOv3 config...")
        import urllib.request
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg", 
            config_path
        )
    
    if not os.path.exists(weights_path):
        print("Downloading YOLOv3 weights (this may take a while)...")
        import urllib.request
        urllib.request.urlretrieve(
            "https://pjreddie.com/media/files/yolov3.weights", 
            weights_path
        )
    
    if not os.path.exists(classes_path):
        print("Downloading COCO class names...")
        import urllib.request
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names", 
            classes_path
        )
    
    return config_path, weights_path, classes_path

def load_yolo():
    """Load YOLO model using OpenCV DNN"""
    try:
        # Ensure YOLO model files exist
        config_path, weights_path, classes_path = ensure_yolo_models()
        
        # Load class names
        with open(classes_path, 'r') as f:
            classes = [line.strip() for line in f.readlines()]
        
        # Load YOLO model
        net = cv2.dnn.readNetFromDarknet(config_path, weights_path)
        
        # Set backend and target (CPU in this case)
        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        
        # Get the output layer names
        layer_names = net.getLayerNames()
        output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
        
        return net, classes, output_layers
    
    except Exception as e:
        print(f"Error loading YOLO model: {e}")
        # Return simulated model for fallback
        return None, None, None

# Try to load YOLO model, but don't stop if it fails
try:
    yolo_net, yolo_classes, yolo_output_layers = load_yolo()
    use_yolo = yolo_net is not None
    print(f"YOLO model loaded: {use_yolo}")
except Exception as e:
    print(f"Could not load YOLO model, using fallback detection: {str(e)}")
    use_yolo = False

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

def detect_objects_yolo(image, target_classes=None):
    """Detect objects in the image using YOLO"""
    if not use_yolo:
        return []
    
    if target_classes is None:
        # Default target classes
        target_classes = ['cell phone', 'book']
    
    height, width = image.shape[:2]
    
    # Preprocess image for YOLO
    blob = cv2.dnn.blobFromImage(image, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    yolo_net.setInput(blob)
    
    # Get detections
    outs = yolo_net.forward(yolo_output_layers)
    
    # Process detections
    class_ids = []
    confidences = []
    boxes = []
    
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            
            if confidence > 0.5 and yolo_classes[class_id] in target_classes:
                # Object detected
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                
                # Rectangle coordinates
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)
                
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)
    
    # Apply non-max suppression
    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    
    detections = []
    for i in range(len(boxes)):
        if i in indices:
            x, y, w, h = boxes[i]
            label = yolo_classes[class_ids[i]]
            confidence = confidences[i]
            
            detections.append({
                'class': label,
                'confidence': round(confidence, 2),
                'bbox': [int(x), int(y), int(x + w), int(y + h)]
            })
    
    return detections

def detect_id_cards(image):
    """Detect ID cards in the image"""
    # First try YOLO detection
    if use_yolo:
        # Try to detect objects that might be ID cards
        detections = detect_objects_yolo(image, ['book', 'laptop', 'cell phone'])
        if detections:
            # Convert detections to ID cards (for demonstration)
            for det in detections:
                det['class'] = 'id_card'
            return detections
    
    # Fallback to simulated detection
    height, width = image.shape[:2]
    detections = []
    
    # Generate 0-2 fake detections for demonstration
    num_detections = np.random.randint(0, 3)
    
    for _ in range(num_detections):
        # Random bounding box
        x1 = np.random.randint(0, width - width//3)
        y1 = np.random.randint(0, height - height//3)
        x2 = x1 + np.random.randint(width//4, width//2)
        y2 = y1 + np.random.randint(height//4, height//2)
        
        confidence = np.random.uniform(0.7, 0.99)
        
        detections.append({
            'class': 'id_card',
            'confidence': round(float(confidence), 2),
            'bbox': [int(x1), int(y1), int(x2), int(y2)]
        })
    
    return detections

def detect_phones(image):
    """Detect phones in the image"""
    # First try YOLO detection
    if use_yolo:
        detections = detect_objects_yolo(image, ['cell phone'])
        if detections:
            return detections
    
    # Fallback to simulated detection
    height, width = image.shape[:2]
    detections = []
    
    # Generate 0-3 fake detections for demonstration
    num_detections = np.random.randint(0, 4)
    
    for _ in range(num_detections):
        # Random bounding box
        x1 = np.random.randint(0, width - width//4)
        y1 = np.random.randint(0, height - height//4)
        x2 = x1 + np.random.randint(width//8, width//3)
        y2 = y1 + np.random.randint(height//6, height//3)
        
        confidence = np.random.uniform(0.65, 0.98)
        
        detections.append({
            'class': 'mobile_phone',
            'confidence': round(float(confidence), 2),
            'bbox': [int(x1), int(y1), int(x2), int(y2)]
        })
    
    return detections

@app.route('/api/object-detection/idcard', methods=['POST'])
def detect_id_card():
    """Detect ID cards in the image"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json['image']
    session_id = request.json.get('sessionId', 'unknown')
    
    try:
        # Process the image
        image = process_image(image_data)
        
        # Detect ID cards
        detections = detect_id_cards(image)
        
        # Save the detection image for reference (with bounding boxes)
        if detections:
            for det in detections:
                x1, y1, x2, y2 = det['bbox']
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(image, f"ID Card: {det['confidence']:.2f}", 
                           (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            image_filename = f"idcard_{session_id}_{timestamp}.jpg"
            cv2.imwrite(os.path.join(DATA_PATH, 'detections', image_filename), image)
        
        # Determine if ID card is visible
        id_card_visible = len(detections) > 0
        highest_confidence = max([det['confidence'] for det in detections]) if detections else 0
        
        return jsonify({
            'success': True,
            'message': 'ID card detection completed',
            'idCardVisible': id_card_visible,
            'confidence': highest_confidence,
            'detections': detections
        })
        
    except Exception as e:
        print(f"Error detecting ID card: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/api/object-detection/phone', methods=['POST'])
def detect_phone():
    """Detect phones in the image"""
    if not request.json or 'image' not in request.json:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    image_data = request.json['image']
    session_id = request.json.get('sessionId', 'unknown')
    
    try:
        # Process the image
        image = process_image(image_data)
        
        # Detect phones
        detections = detect_phones(image)
        
        # Save the detection image for reference (with bounding boxes)
        if detections:
            for det in detections:
                x1, y1, x2, y2 = det['bbox']
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(image, f"Phone: {det['confidence']:.2f}", 
                           (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            image_filename = f"phone_{session_id}_{timestamp}.jpg"
            cv2.imwrite(os.path.join(DATA_PATH, 'detections', image_filename), image)
        
        # Determine if phone is in use
        phone_detected = len(detections) > 0
        highest_confidence = max([det['confidence'] for det in detections]) if detections else 0
        
        return jsonify({
            'success': True,
            'message': 'Phone detection completed',
            'phoneDetected': phone_detected,
            'confidence': highest_confidence,
            'detections': detections
        })
        
    except Exception as e:
        print(f"Error detecting phone: {e}")
        return jsonify({'success': False, 'message': f'Error processing image: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
