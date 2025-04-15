# Smart Attendance System - ML Services

This directory contains the machine learning microservices that power the Smart Attendance System.

## Services Overview

1. **Face Recognition Service** - Handles face detection, registration, and verification
2. **Object Detection Service** - Detects objects like ID cards and phones in images
3. **API Gateway** - Routes requests to the appropriate services

## Setup Instructions

### Prerequisites
- Python 3.9+ installed
- Windows operating system

### Automated Setup
1. Open Command Prompt as Administrator
2. Navigate to this directory:
   ```
   cd C:\Users\krish\Desktop\smart-attendance-system\ml-services
   ```
3. Run the setup script:
   ```
   setup_and_run.bat
   ```

### Manual Setup

#### Face Recognition Service
1. Create a virtual environment:
   ```
   cd face-recognition
   python -m venv venv
   ```
2. Activate it:
   ```
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements_modified.txt
   ```

#### Object Detection Service
1. Create a virtual environment:
   ```
   cd object-detection
   python -m venv venv
   ```
2. Activate it:
   ```
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements_modified.txt
   ```

## Running the Services

Each service should run in a separate command prompt window:

### Face Recognition Service
```
cd face-recognition
venv\Scripts\activate
python app_modified.py
```
The service will be available at http://localhost:5001

### Object Detection Service
```
cd object-detection
venv\Scripts\activate
python app_modified.py
```
The service will be available at http://localhost:5002

## API Endpoints

### Face Recognition Service (port 5001)

- **Register a face**: POST `/api/face/register`
  - Request body: `{ "studentId": "12345", "image": "base64-image-data" }`

- **Verify a face**: POST `/api/face/verify`
  - Request body: `{ "image": "base64-image-data" }`

- **Analyze a face**: POST `/api/face/analyze`
  - Request body: `{ "image": "base64-image-data" }`

### Object Detection Service (port 5002)

- **Detect ID cards**: POST `/api/object-detection/idcard`
  - Request body: `{ "image": "base64-image-data", "sessionId": "session-id" }`

- **Detect phones**: POST `/api/object-detection/phone`
  - Request body: `{ "image": "base64-image-data", "sessionId": "session-id" }`

## Implementation Notes

- The modified implementations (`app_modified.py`) use OpenCV instead of face_recognition and TensorFlow
- Face recognition uses a simplified approach based on OpenCV's Haar Cascades
- Object detection uses OpenCV's DNN module with YOLO (if available) or falls back to simulated detection
- All data is stored in the `data` directory
- Models are downloaded as needed to the `models` directory
