# Installation Guide

This guide provides step-by-step instructions for setting up the AI-Powered Smart Attendance & Behavior Monitoring System on your machine.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Option 1: Docker Installation (Recommended)](#option-1-docker-installation-recommended)
  - [Option 2: Manual Installation](#option-2-manual-installation)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before installation, ensure your system meets the following requirements:

### Hardware Requirements

- **Minimum:**
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 50GB free space
  - Webcam (for testing face recognition features)

- **Recommended:**
  - CPU: 8 cores
  - RAM: 16GB
  - Storage: 100GB SSD
  - Dedicated GPU with CUDA support (for better ML performance)
  - HD Webcam

### Software Requirements

- Operating System: Windows 10/11, macOS 10.15+, or Ubuntu 20.04+
- Docker and Docker Compose (for containerized installation)
- Git
- Node.js v18+ (for manual installation)
- Python 3.9+ (for manual installation)
- MongoDB (for manual installation)

## Installation Methods

### Option 1: Docker Installation (Recommended)

Using Docker provides the simplest setup experience with all components containerized.

1. **Install Docker and Docker Compose**:
   - [Docker Desktop for Windows/Mac](https://www.docker.com/products/docker-desktop)
   - For Linux: [Docker Engine](https://docs.docker.com/engine/install/) + [Docker Compose](https://docs.docker.com/compose/install/)

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/smart-attendance-system.git
   cd smart-attendance-system
   ```

3. **Start the application**:
   ```bash
   cd docker
   docker-compose up -d
   ```

4. **Verify installation**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/health
   - ML API Gateway: http://localhost:8080/health

### Option 2: Manual Installation

For development or customization, you may prefer to install components separately.

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd smart-attendance-system/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database connection and other settings

# Build the application
npm run build

# Start the server
npm start

# For development with hot-reload:
npm run dev
```

#### 2. MongoDB Setup

If you don't have MongoDB running:

```bash
# For Docker users
docker run -d -p 27017:27017 --name mongodb mongo:latest

# For Ubuntu
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb

# For macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd smart-attendance-system/frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URL settings

# Start development server
npm run dev

# For production build
npm run build
npm start
```

#### 4. ML Services Setup

```bash
# Navigate to ML services directory
cd smart-attendance-system/ml-services

# Set up Python virtual environments and dependencies for each service
# Face Recognition Service
cd face-recognition
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Object Detection Service (in a new terminal)
cd ../object-detection
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Sentiment Analysis Service (in a new terminal)
cd ../sentiment-analysis
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# API Gateway (in a new terminal)
cd ../api-gateway
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Environment Configuration

### Backend Configuration (.env)

```plaintext
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=user@example.com
EMAIL_PASS=password
EMAIL_FROM=noreply@attendance.edu

# ML API
ML_API_URL=http://localhost:8080

# Client URL
CLIENT_URL=http://localhost:3000
```

### Frontend Configuration (.env.local)

```plaintext
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_API_URL=http://localhost:8080
```

## Troubleshooting

### Docker Issues

1. **Container fails to start**:
   - Check logs: `docker-compose logs -f [service_name]`
   - Ensure ports are not already in use on your machine
   - Try increasing Docker resource allocation in Docker Desktop settings

2. **Network connectivity issues between containers**:
   - Check if Docker network is created: `docker network ls`
   - Restart Docker: `docker-compose down && docker-compose up -d`

### MongoDB Connection Issues

1. **Can't connect to MongoDB**:
   - Check if MongoDB is running: `mongo` or `mongosh`
   - Verify connection string in .env file
   - Check MongoDB logs: `sudo journalctl -u mongodb`

### ML Services Issues

1. **Python dependency errors**:
   - Make sure you're using Python 3.9+
   - Ensure pip is up-to-date: `pip install --upgrade pip`
   - Try creating a fresh virtual environment

2. **Model loading issues**:
   - Check if model directories exist
   - Ensure sufficient disk space for models
   - Some models may require GPU with CUDA support

### Webcam Access Issues

1. **Browser doesn't detect camera**:
   - Ensure camera permissions are granted in browser settings
   - Try using Google Chrome (most compatible)
   - Check if other applications are using the camera

### If All Else Fails

Reset everything and start fresh:

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove node_modules
rm -rf backend/node_modules frontend/node_modules

# Remove virtual environments
rm -rf ml-services/*/venv

# Start from the beginning
git pull
docker-compose up -d
```

## Post-Installation

After successful installation, you should:

1. Register an admin account through the web interface
2. Set up courses and student records
3. Begin testing facial recognition with sample data

For more information, refer to the [User Guide](./DOCUMENTATION.md#user-guide) in the documentation.