FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies for each service
COPY ml-services/face-recognition/requirements.txt ./face-recognition-requirements.txt
COPY ml-services/object-detection/requirements.txt ./object-detection-requirements.txt
COPY ml-services/sentiment-analysis/requirements.txt ./sentiment-analysis-requirements.txt
COPY ml-services/api-gateway/requirements.txt ./api-gateway-requirements.txt

RUN pip install --no-cache-dir -r face-recognition-requirements.txt \
    && pip install --no-cache-dir -r object-detection-requirements.txt \
    && pip install --no-cache-dir -r sentiment-analysis-requirements.txt \
    && pip install --no-cache-dir -r api-gateway-requirements.txt

# Copy service code
COPY ml-services/face-recognition ./face-recognition
COPY ml-services/object-detection ./object-detection
COPY ml-services/sentiment-analysis ./sentiment-analysis
COPY ml-services/api-gateway ./api-gateway

# The command will be specified in docker-compose.yml for each service