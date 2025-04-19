# AI-Powered Smart Attendance & Behavior Monitoring System Documentation

## Overview

The Smart Attendance & Behavior Monitoring System is a comprehensive solution for educational institutions to automate attendance tracking using facial recognition technology, monitor classroom behavior, and provide insights into student engagement. The system combines modern web technologies with machine learning to create a seamless experience for both students and faculty.

![System Architecture](https://via.placeholder.com/800x400?text=System+Architecture)

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Features](#features)
3. [Setup & Installation](#setup--installation)
4. [User Guide](#user-guide)
5. [API Documentation](#api-documentation)
6. [ML Services](#ml-services)
7. [Deployment](#deployment)
8. [Security & Privacy](#security--privacy)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

## System Architecture

The system follows a microservices architecture with three main components:

1. **Frontend**: A responsive web application built with Next.js, React, and TypeScript
2. **Backend**: A RESTful API server built with Express.js, Node.js, and MongoDB
3. **ML Services**: Python-based microservices for facial recognition, object detection, and sentiment analysis

### Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│             │     │             │     │                     │
│  Frontend   │◄───►│  Backend    │◄───►│  Database (MongoDB) │
│  (Next.js)  │     │  (Express)  │     │                     │
│             │     │             │     │                     │
└─────────────┘     └──────┬──────┘     └─────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
        ┌────────────┬─────┴─────┬────────────┐
        │            │           │            │
┌───────▼──────┐ ┌───▼───┐ ┌─────▼─────┐ ┌────▼─────┐
│              │ │       │ │           │ │          │
│    Face      │ │  ID   │ │  Phone    │ │Sentiment │
│Recognition   │ │ Card  │ │ Detection │ │Analysis  │
│              │ │       │ │           │ │          │
└──────────────┘ └───────┘ └───────────┘ └──────────┘
```

## Features

### Core Features

- **Student Registration with College ID Verification**
  - User accounts with role-based access control
  - Email verification workflow
  - College ID integration

- **Face Recognition-Based Attendance**
  - Multi-angle face registration
  - Liveness detection to prevent spoofing
  - Real-time attendance marking

- **ID Card Detection and Compliance Monitoring**
  - Automated ID card visibility checks
  - Compliance tracking and reporting

- **Mobile Phone Usage Detection**
  - Detection of phone usage during lectures
  - Alert system for non-compliance

- **Sentiment Analysis for Student Engagement**
  - Real-time monitoring of student attention
  - Emotion recognition for engagement metrics
  - Aggregated analytics for faculty

- **Real-Time Monitoring Dashboard**
  - Faculty view for active sessions
  - Student statistics and metrics
  - Attendance and compliance reports

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB
- Docker and Docker Compose (optional for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-attendance-system.git
cd smart-attendance-system
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The backend server will run on http://localhost:5000

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3000

#### 4. ML Services Setup

```bash
cd ml-services

# Setup Face Recognition Service
cd face-recognition
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Setup Object Detection Service
cd ../object-detection
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Setup Sentiment Analysis Service
cd ../sentiment-analysis
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Setup API Gateway
cd ../api-gateway
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The ML services will run on:
- Face Recognition: http://localhost:5001
- Object Detection: http://localhost:5002
- Sentiment Analysis: http://localhost:5003
- API Gateway: http://localhost:8080

### Docker Deployment

For a simpler setup, you can use Docker Compose:

```bash
cd docker
docker-compose up -d
```

This will start all components in containers, including:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML API Gateway: http://localhost:8080
- MongoDB database

## User Guide

### Student Flow

#### 1. Registration and Account Setup

1. Navigate to the registration page
2. Enter your details including name, email, and student ID
3. Verify your email through the link sent to your inbox
4. Log in with your credentials

#### 2. Face Registration

1. Navigate to the Face Registration page
2. Follow the on-screen instructions to capture your face from multiple angles
3. Submit the registration for verification
4. Wait for confirmation that your face has been registered

#### 3. Marking Attendance

1. Navigate to the Attendance page
2. Select the active session for your class
3. Click "Start Camera" and position your face in the frame
4. Capture your image and wait for verification
5. Receive confirmation of attendance

#### 4. Viewing Records

1. Navigate to the Attendance History page
2. View your attendance record for each course
3. Check compliance metrics and engagement scores

### Faculty Flow

#### 1. Starting a Class Session

1. Navigate to the Start Session page
2. Select the course, session type, and duration
3. Add any session notes or instructions
4. Click "Start Session" to begin

#### 2. Monitoring Students

1. Navigate to the Monitor page
2. View real-time attendance statistics
3. Check individual student compliance and engagement
4. Manually update attendance status if needed

#### 3. Ending a Session

1. From the Monitor page, click "End Session"
2. Confirm to finalize attendance records
3. View the session summary

#### 4. Analytics and Reports

1. Navigate to the Analytics page
2. View attendance trends and patterns
3. Check compliance statistics
4. Generate reports for specific courses or time periods

## API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/auth/register` | POST | Register a new user | No |
| `/api/auth/verify/:token` | GET | Verify email | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/logout` | GET | Logout user | Yes |
| `/api/auth/forgotpassword` | POST | Request password reset | No |
| `/api/auth/resetpassword/:token` | PUT | Reset password | No |

### Student Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/students` | GET | Get all students | Yes (Admin/Faculty) |
| `/api/students/:id` | GET | Get single student | Yes (Admin/Faculty/Self) |
| `/api/students/:id` | PUT | Update student | Yes (Admin/Self) |
| `/api/students/:id` | DELETE | Delete student | Yes (Admin) |
| `/api/students/:id/face` | POST | Register face | Yes (Self/Admin) |
| `/api/students/:id/face/status` | GET | Get face registration status | Yes (Self/Admin/Faculty) |

### Attendance Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/attendance/sessions` | POST | Start a class session | Yes (Faculty) |
| `/api/attendance/sessions/:id/end` | PUT | End a class session | Yes (Faculty) |
| `/api/attendance/sessions/active` | GET | Get active sessions | Yes (Faculty/Admin) |
| `/api/attendance/sessions/:id` | GET | Get session details | Yes (Faculty/Admin) |
| `/api/attendance/sessions/:id/mark` | POST | Mark attendance | Yes (Student) |
| `/api/attendance/sessions/:id/manual` | POST | Mark attendance manually | Yes (Faculty) |
| `/api/attendance/sessions/:id/attendance` | GET | Get session attendance | Yes (Faculty/Admin) |
| `/api/attendance/history/:studentId` | GET | Get student attendance history | Yes (Faculty/Admin/Self) |

### ML Service Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/face/register` | POST | Register a face | Yes |
| `/api/face/verify` | POST | Verify a face | Yes |
| `/api/face/analyze` | POST | Analyze face for engagement | Yes |
| `/api/object-detection/idcard` | POST | Detect ID cards | Yes |
| `/api/object-detection/phone` | POST | Detect phones | Yes |
| `/api/sentiment/analyze` | POST | Analyze facial expressions | Yes |
| `/api/analyze/all` | POST | Perform all analyses on a single image | Yes |

## ML Services

### Face Recognition Service

The face recognition service uses a combination of:
- Face detection with OpenCV
- Face encoding with face_recognition library
- Custom liveness detection to prevent spoofing

#### Key Features:
- Multi-angle face registration
- High-accuracy face verification
- Liveness detection checks
- Face engagement analysis

### Object Detection Service

The object detection service uses:
- TensorFlow-based object detection models
- Custom training for ID cards and mobile phones
- Real-time detection capabilities

#### Key Features:
- ID card detection and verification
- Mobile phone usage detection
- High confidence scoring
- Real-time processing of camera feeds

### Sentiment Analysis Service

The sentiment analysis service uses:
- Facial expression recognition models
- Attention and engagement metrics
- Emotion classification

#### Key Features:
- Emotion detection (happy, sad, confused, bored, engaged)
- Attention scoring
- Engagement metrics
- Real-time analysis

## Deployment

### Production Deployment

For production deployment, follow these steps:

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the Backend**
   ```bash
   cd backend
   npm run build
   ```

3. **Use Docker for Production**
   ```bash
   cd docker
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Server Requirements

- **Minimum Requirements**:
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 50GB SSD
  - Network: 50Mbps+ connection

- **Recommended Requirements**:
  - CPU: 8 cores
  - RAM: 16GB
  - Storage: 100GB SSD
  - Network: 100Mbps+ connection

- **GPU Support** (optional but recommended for ML services):
  - NVIDIA GPU with CUDA support
  - At least 4GB VRAM

## Security & Privacy

### Data Protection

- All personal data is encrypted at rest and in transit
- Face encodings are stored securely and not as raw images
- JWT-based authentication with token expiration
- Rate limiting to prevent brute force attacks

### Privacy Considerations

- Students can request deletion of their biometric data
- Data processing consent is required during registration
- All camera access requires explicit user permission
- Analysis data is anonymized for analytics purposes

### Compliance

The system is designed with consideration for:
- GDPR principles
- FERPA requirements for educational institutions
- Local data protection regulations

## Troubleshooting

### Common Issues

#### Camera Access Issues
- Ensure browser permissions are granted
- Try using Chrome or Firefox for best compatibility
- Check if another application is using the camera

#### Face Recognition Problems
- Ensure good lighting conditions
- Remove glasses or other face obstructions if possible
- Try registering your face in different lighting conditions

#### Backend Connection Issues
- Check if the backend server is running
- Verify your network connection
- Check environment variables for correct API URLs

### Getting Support

For issues not covered in this documentation, contact the development team at:
- Email: support@smartattendance.edu
- Issue Tracker: [GitHub Issues](https://github.com/yourusername/smart-attendance-system/issues)

## Contributing

We welcome contributions to improve the Smart Attendance System!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style and formatting
- Write tests for new features
- Document your code and update the documentation
- Ensure all tests pass before submitting a PR

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenCV for computer vision capabilities
- TensorFlow for machine learning models
- MongoDB for database storage
- Next.js for the frontend framework
- Express.js for the backend framework
![System Architecture](https://via.placeholder.com/800x400?text=System+Architecture)

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Features](#features)
3. [Setup & Installation](#setup--installation)
4. [User Guide](#user-guide)
5. [API Documentation](#api-documentation)
6. [ML Services](#ml-services)
7. [Deployment](#deployment)
8. [Security & Privacy](#security--privacy)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

## System Architecture

The system follows a microservices architecture with three main components:

1. **Frontend**: A responsive web application built with Next.js, React, and TypeScript
2. **Backend**: A RESTful API server built with Express.js, Node.js, and MongoDB
3. **ML Services**: Python-based microservices for facial recognition, object detection, and sentiment analysis

### Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│             │     │             │     │                     │
│  Frontend   │◄───►│  Backend    │◄───►│  Database (MongoDB) │
│  (Next.js)  │     │  (Express)  │     │                     │
│             │     │             │     │                     │
└─────────────┘     └──────┬──────┘     └─────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
        ┌────────────┬─────┴─────┬────────────┐
        │            │           │            │
┌───────▼──────┐ ┌───▼───┐ ┌─────▼─────┐ ┌────▼─────┐
│              │ │       │ │           │ │          │
│    Face      │ │  ID   │ │  Phone    │ │Sentiment │
│Recognition   │ │ Card  │ │ Detection │ │Analysis  │
│              │ │       │ │           │ │          │
└──────────────┘ └───────┘ └───────────┘ └──────────┘
```

## Features

### Core Features

- **Student Registration with College ID Verification**
  - User accounts with role-based access control
  - Email verification workflow
  - College ID integration

- **Face Recognition-Based Attendance**
  - Multi-angle face registration
  - Liveness detection to prevent spoofing
  - Real-time attendance marking

- **ID Card Detection and Compliance Monitoring**
  - Automated ID card visibility checks
  - Compliance tracking and reporting

- **Mobile Phone Usage Detection**
  - Detection of phone usage during lectures
  - Alert system for non-compliance

- **Sentiment Analysis for Student Engagement**
  - Real-time monitoring of student attention
  - Emotion recognition for engagement metrics
  - Aggregated analytics for faculty

- **Real-Time Monitoring Dashboard**
  - Faculty view for active sessions
  - Student statistics and metrics
  - Attendance and compliance reports

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB
- Docker and Docker Compose (optional for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-attendance-system.git
cd smart-attendance-system
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The backend server will run on http://localhost:5000

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3000

#### 4. ML Services Setup

```bash
cd ml-services

# Setup Face Recognition Service
cd face-recognition
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Setup Object Detection Service
cd ../object-detection
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Setup Sentiment Analysis Service
cd ../sentiment-analysis
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Setup API Gateway
cd ../api-gateway
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The ML services will run on:
- Face Recognition: http://localhost:5001
- Object Detection: http://localhost:5002
- Sentiment Analysis: http://localhost:5003
- API Gateway: http://localhost:8080

### Docker Deployment

For a simpler setup, you can use Docker Compose:

```bash
cd docker
docker-compose up -d
```

This will start all components in containers, including:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML API Gateway: http://localhost:8080
- MongoDB database

## User Guide

### Student Flow

#### 1. Registration and Account Setup

1. Navigate to the registration page
2. Enter your details including name, email, and student ID
3. Verify your email through the link sent to your inbox
4. Log in with your credentials

#### 2. Face Registration

1. Navigate to the Face Registration page
2. Follow the on-screen instructions to capture your face from multiple angles
3. Submit the registration for verification
4. Wait for confirmation that your face has been registered

#### 3. Marking Attendance

1. Navigate to the Attendance page
2. Select the active session for your class
3. Click "Start Camera" and position your face in the frame
4. Capture your image and wait for verification
5. Receive confirmation of attendance

#### 4. Viewing Records

1. Navigate to the Attendance History page
2. View your attendance record for each course
3. Check compliance metrics and engagement scores

### Faculty Flow

#### 1. Starting a Class Session

1. Navigate to the Start Session page
2. Select the course, session type, and duration
3. Add any session notes or instructions
4. Click "Start Session" to begin

#### 2. Monitoring Students

1. Navigate to the Monitor page
2. View real-time attendance statistics
3. Check individual student compliance and engagement
4. Manually update attendance status if needed

#### 3. Ending a Session

1. From the Monitor page, click "End Session"
2. Confirm to finalize attendance records
3. View the session summary

#### 4. Analytics and Reports

1. Navigate to the Analytics page
2. View attendance trends and patterns
3. Check compliance statistics
4. Generate reports for specific courses or time periods

## API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/auth/register` | POST | Register a new user | No |
| `/api/auth/verify/:token` | GET | Verify email | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/logout` | GET | Logout user | Yes |
| `/api/auth/forgotpassword` | POST | Request password reset | No |
| `/api/auth/resetpassword/:token` | PUT | Reset password | No |

### Student Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/students` | GET | Get all students | Yes (Admin/Faculty) |
| `/api/students/:id` | GET | Get single student | Yes (Admin/Faculty/Self) |
| `/api/students/:id` | PUT | Update student | Yes (Admin/Self) |
| `/api/students/:id` | DELETE | Delete student | Yes (Admin) |
| `/api/students/:id/face` | POST | Register face | Yes (Self/Admin) |
| `/api/students/:id/face/status` | GET | Get face registration status | Yes (Self/Admin/Faculty) |

### Attendance Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/attendance/sessions` | POST | Start a class session | Yes (Faculty) |
| `/api/attendance/sessions/:id/end` | PUT | End a class session | Yes (Faculty) |
| `/api/attendance/sessions/active` | GET | Get active sessions | Yes (Faculty/Admin) |
| `/api/attendance/sessions/:id` | GET | Get session details | Yes (Faculty/Admin) |
| `/api/attendance/sessions/:id/mark` | POST | Mark attendance | Yes (Student) |
| `/api/attendance/sessions/:id/manual` | POST | Mark attendance manually | Yes (Faculty) |
| `/api/attendance/sessions/:id/attendance` | GET | Get session attendance | Yes (Faculty/Admin) |
| `/api/attendance/history/:studentId` | GET | Get student attendance history | Yes (Faculty/Admin/Self) |

### ML Service Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/face/register` | POST | Register a face | Yes |
| `/api/face/verify` | POST | Verify a face | Yes |
| `/api/face/analyze` | POST | Analyze face for engagement | Yes |
| `/api/object-detection/idcard` | POST | Detect ID cards | Yes |
| `/api/object-detection/phone` | POST | Detect phones | Yes |
| `/api/sentiment/analyze` | POST | Analyze facial expressions | Yes |
| `/api/analyze/all` | POST | Perform all analyses on a single image | Yes |

## ML Services

### Face Recognition Service

The face recognition service uses a combination of:
- Face detection with OpenCV
- Face encoding with face_recognition library
- Custom liveness detection to prevent spoofing

#### Key Features:
- Multi-angle face registration
- High-accuracy face verification
- Liveness detection checks
- Face engagement analysis

### Object Detection Service

The object detection service uses:
- TensorFlow-based object detection models
- Custom training for ID cards and mobile phones
- Real-time detection capabilities

#### Key Features:
- ID card detection and verification
- Mobile phone usage detection
- High confidence scoring
- Real-time processing of camera feeds

### Sentiment Analysis Service

The sentiment analysis service uses:
- Facial expression recognition models
- Attention and engagement metrics
- Emotion classification

#### Key Features:
- Emotion detection (happy, sad, confused, bored, engaged)
- Attention scoring
- Engagement metrics
- Real-time analysis

## Deployment

### Production Deployment

For production deployment, follow these steps:

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the Backend**
   ```bash
   cd backend
   npm run build
   ```

3. **Use Docker for Production**
   ```bash
   cd docker
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Server Requirements

- **Minimum Requirements**:
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 50GB SSD
  - Network: 50Mbps+ connection

- **Recommended Requirements**:
  - CPU: 8 cores
  - RAM: 16GB
  - Storage: 100GB SSD
  - Network: 100Mbps+ connection

- **GPU Support** (optional but recommended for ML services):
  - NVIDIA GPU with CUDA support
  - At least 4GB VRAM

## Security & Privacy

### Data Protection

- All personal data is encrypted at rest and in transit
- Face encodings are stored securely and not as raw images
- JWT-based authentication with token expiration
- Rate limiting to prevent brute force attacks

### Privacy Considerations

- Students can request deletion of their biometric data
- Data processing consent is required during registration
- All camera access requires explicit user permission
- Analysis data is anonymized for analytics purposes

### Compliance

The system is designed with consideration for:
- GDPR principles
- FERPA requirements for educational institutions
- Local data protection regulations

## Troubleshooting

### Common Issues

#### Camera Access Issues
- Ensure browser permissions are granted
- Try using Chrome or Firefox for best compatibility
- Check if another application is using the camera

#### Face Recognition Problems
- Ensure good lighting conditions
- Remove glasses or other face obstructions if possible
- Try registering your face in different lighting conditions

#### Backend Connection Issues
- Check if the backend server is running
- Verify your network connection
- Check environment variables for correct API URLs

### Getting Support

For issues not covered in this documentation, contact the development team at:
- Email: support@smartattendance.edu
- Issue Tracker: [GitHub Issues](https://github.com/yourusername/smart-attendance-system/issues)

## Contributing

We welcome contributions to improve the Smart Attendance System!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style and formatting
- Write tests for new features
- Document your code and update the documentation
- Ensure all tests pass before submitting a PR

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenCV for computer vision capabilities
- TensorFlow for machine learning models
- MongoDB for database storage
- Next.js for the frontend framework
- Express.js for the backend framework