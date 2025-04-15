# AI-Powered Smart Attendance & Behavior Monitoring System

<div align="center">
  <img src="https://via.placeholder.com/800x400?text=Smart+Attendance+System" alt="Smart Attendance System" width="600px">
  <br>
  <p>
    <em>A comprehensive system for automated attendance tracking and classroom behavior monitoring</em>
  </p>
</div>

## About The Project

The Smart Attendance & Behavior Monitoring System is a modern solution for educational institutions to automate student attendance tracking using facial recognition technology, monitor classroom behavior, and provide insights into student engagement. Built with cutting-edge technologies, it streamlines the attendance process while providing valuable data on student engagement and compliance.

### Built With

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Express.js](https://expressjs.com/), [Node.js](https://nodejs.org/), [MongoDB](https://www.mongodb.com/)
- **ML Services**: [Python](https://www.python.org/), [Flask](https://flask.palletsprojects.com/), [OpenCV](https://opencv.org/), [TensorFlow](https://www.tensorflow.org/)
- **Deployment**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Features

### Core Features

- ✅ **Face Recognition-Based Attendance**: Mark attendance automatically using facial recognition with liveness detection
- ✅ **ID Card Detection**: Monitor student compliance with ID card policies
- ✅ **Mobile Phone Detection**: Detect unauthorized phone usage during classes
- ✅ **Student Engagement Analysis**: Measure attention levels and emotional engagement
- ✅ **Real-Time Monitoring**: Faculty dashboard for live session monitoring
- ✅ **Comprehensive Analytics**: Track attendance patterns and student behavior

### Key Benefits

- **Time Efficiency**: Eliminate manual attendance-taking
- **Accuracy**: Reduce errors and prevent proxy attendance
- **Insights**: Gain visibility into student engagement patterns
- **Compliance**: Monitor and enforce classroom policies
- **Security**: Biometric verification with privacy protections

## Demo

<div align="center">
  <img src="https://via.placeholder.com/800x450?text=System+Demo" alt="Demo" width="600px">
</div>

## Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB
- Docker and Docker Compose (optional)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-attendance-system.git
cd smart-attendance-system

# Start all services
cd docker
docker-compose up -d

# Access the application at http://localhost:3000
```

### Manual Setup

See the [DOCUMENTATION.md](./DOCUMENTATION.md) file for detailed setup instructions.

## Documentation

For comprehensive documentation including setup instructions, user guides, API documentation, and more, please see:

- [System Documentation](./DOCUMENTATION.md): Complete system documentation
- [API Documentation](./DOCUMENTATION.md#api-documentation): API endpoints and usage
- [ML Services Guide](./DOCUMENTATION.md#ml-services): Machine learning services documentation
- [User Guides](./DOCUMENTATION.md#user-guide): Guides for students and faculty

## System Architecture

<div align="center">
  <img src="https://via.placeholder.com/800x500?text=System+Architecture" alt="Architecture" width="600px">
</div>

The system follows a microservices architecture with:

1. **Frontend**: A responsive web app for students and faculty
2. **Backend**: RESTful API server that manages business logic and data
3. **ML Services**: Specialized microservices for computer vision and analysis
4. **Database**: MongoDB for data persistence

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/yourusername/smart-attendance-system](https://github.com/yourusername/smart-attendance-system)

## Acknowledgements

- OpenCV for computer vision capabilities
- TensorFlow for machine learning models
- MongoDB for database storage
- Next.js for the frontend framework
- Express.js for the backend framework