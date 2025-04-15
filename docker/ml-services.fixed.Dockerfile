FROM python:3.9-slim

WORKDIR /app

# Install system dependencies including CMake
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    pkg-config \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# For face-recognition-service (without dlib - will use a different approach)
COPY ml-services/face-recognition/requirements.txt ./face-recognition-requirements.txt
# Install without dlib for now
RUN grep -v "dlib==19.24.2" ./face-recognition-requirements.txt > ./modified-face-reqs.txt && \
    grep -v "face-recognition==1.3.0" ./modified-face-reqs.txt > ./final-face-reqs.txt && \
    pip install --no-cache-dir -r ./final-face-reqs.txt

# For other services
COPY ml-services/object-detection/requirements.txt ./object-detection-requirements.txt
COPY ml-services/sentiment-analysis/requirements.txt ./sentiment-analysis-requirements.txt 
COPY ml-services/api-gateway/requirements.txt ./api-gateway-requirements.txt

# Install other requirements
RUN pip install --no-cache-dir -r object-detection-requirements.txt && \
    pip install --no-cache-dir -r sentiment-analysis-requirements.txt && \
    pip install --no-cache-dir -r api-gateway-requirements.txt

# Install face_recognition via pip (this uses a pre-built wheel)
RUN pip install face_recognition

# Copy service code
COPY ml-services/face-recognition ./face-recognition
COPY ml-services/object-detection ./object-detection
COPY ml-services/sentiment-analysis ./sentiment-analysis
COPY ml-services/api-gateway ./api-gateway

# The command will be specified in docker-compose.yml for each service