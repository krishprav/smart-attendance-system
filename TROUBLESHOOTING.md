# Troubleshooting Guide

This guide provides solutions to common issues you might encounter while setting up or running the Smart Attendance & Behavior Monitoring System.

## Table of Contents

1. [System Startup Issues](#system-startup-issues)
2. [Camera Problems](#camera-problems)
3. [Face Recognition Issues](#face-recognition-issues)
4. [Backend API Issues](#backend-api-issues)
5. [Frontend Issues](#frontend-issues)
6. [Database Issues](#database-issues)
7. [Docker Deployment Issues](#docker-deployment-issues)
8. [Performance Problems](#performance-problems)

## System Startup Issues

### All Components Won't Start

**Problem**: The entire system fails to start when running the startup script.

**Solutions**:
- Ensure all prerequisites are installed (Node.js, Python, MongoDB)
- Check that required ports (3000, 5000, 5001, 5002, 5003, 8080, 27017) are not already in use
- Run each component individually to identify the specific issue
- Check log files for specific error messages

### Specific Component Won't Start

**Problem**: Only one component (backend, frontend, or ML service) fails to start.

**Solutions**:
- Check the specific error in the command window or log file of that component
- Ensure all dependencies are properly installed
- Verify that configuration files (.env, .env.local) exist and have correct values
- Check network connectivity if services need to communicate with each other

### Port Already in Use

**Problem**: Error message indicating a port is already in use.

**Solutions**:
- Identify which process is using the port:
  - Windows: `netstat -ano | findstr :PORT_NUMBER`
  - macOS/Linux: `lsof -i :PORT_NUMBER`
- Kill the process or change the port in the configuration files
- Use Task Manager (Windows) or Activity Monitor (macOS) to end processes

## Camera Problems

### Camera Not Detected

**Problem**: The system cannot detect a camera on the device.

**Solutions**:
- Verify the camera works in other applications
- Check if camera is physically enabled (some laptops have switches)
- Ensure no other application is using the camera
- Try using a different browser (Chrome or Firefox recommended)
- Update your device drivers

### Permission Denied

**Problem**: Browser shows "Permission denied" when trying to access the camera.

**Solutions**:
- Check browser permissions (click the padlock icon in the address bar)
- Reset camera permissions in browser settings
- Ensure the site is using HTTPS (required for camera access in some browsers)
- Try using an incognito/private window to rule out extension issues

### Black Screen in Camera Feed

**Problem**: Camera initializes but shows a black screen.

**Solutions**:
- Check if camera lens is covered or obstructed
- Restart the browser
- Try different lighting conditions
- Update browser to the latest version
- Disable hardware acceleration in browser settings
- Check the camera connection if using an external webcam

### Camera Freezes

**Problem**: Camera feed initializes but then freezes.

**Solutions**:
- Close other applications that might be using the camera
- Refresh the page
- Check system resources (CPU/RAM usage)
- Try lowering the camera resolution in settings
- Restart your computer

## Face Recognition Issues

### Face Not Detected

**Problem**: The system doesn't detect faces in the camera feed.

**Solutions**:
- Ensure adequate lighting (avoid backlighting)
- Position your face clearly in the frame
- Remove obstacles (masks, sunglasses, etc.)
- Try different angles
- Check face-recognition service logs for specific errors

### False Recognition

**Problem**: System recognizes the wrong person or fails to recognize correctly.

**Solutions**:
- Re-register your face under better lighting conditions
- Register multiple angles of your face
- Ensure database of face encodings is up to date
- Check confidence threshold settings in the ML service
- Try cleaning the camera lens

### Liveness Detection Problems

**Problem**: System flags a real person as a photo or spoofing attempt.

**Solutions**:
- Ensure proper lighting (not too bright or too dark)
- Avoid rapid movements
- Position face at an appropriate distance from camera
- Try different facial expressions
- Check if ML service components are properly running

## Backend API Issues

### API Endpoints Not Responding

**Problem**: API calls return 404 or don't respond at all.

**Solutions**:
- Verify the backend server is running
- Check API URLs for typos
- Ensure correct port is being used
- Check network connectivity between frontend and backend
- Verify API gateway settings if using microservices

### Authentication Failures

**Problem**: Authentication-related API calls fail with 401/403 errors.

**Solutions**:
- Check if JWT tokens are properly configured
- Verify token expiration settings
- Clear browser cookies and try logging in again
- Check user roles and permissions
- Look for CORS issues in browser console

### Database Connection Errors

**Problem**: Backend reports database connection issues.

**Solutions**:
- Verify MongoDB is running
- Check connection string in .env file
- Ensure network allows connection to database
- Check MongoDB logs for errors
- Verify database credentials

## Frontend Issues

### Pages Not Loading

**Problem**: Frontend pages show blank or fail to load.

**Solutions**:
- Check browser console for JavaScript errors
- Verify API endpoints are correctly configured in environment files
- Clear browser cache and cookies
- Check if required assets are loading correctly
- Ensure compatible browser version (latest Chrome/Firefox recommended)

### UI Component Glitches

**Problem**: UI components display incorrectly or behave unexpectedly.

**Solutions**:
- Clear browser cache
- Try a different browser
- Check screen resolution and responsive design
- Verify CSS is loading correctly
- Check for JavaScript errors in the console

### Slow Frontend Performance

**Problem**: Frontend is sluggish or unresponsive.

**Solutions**:
- Check network latency to backend services
- Monitor browser memory usage
- Disable browser extensions temporarily
- Try performance mode in browser (if available)
- Check if large amounts of data are being loaded unnecessarily

## Database Issues

### MongoDB Connection Failures

**Problem**: Cannot connect to MongoDB database.

**Solutions**:
- Verify MongoDB service is running
- Check MongoDB logs for errors
- Ensure correct connection string in configuration
- Check firewall settings
- Verify network connectivity to MongoDB server

### Data Inconsistency

**Problem**: Data appears incorrect, missing, or duplicated.

**Solutions**:
- Check database schema validation
- Verify API endpoints are properly handling data
- Look for error handling issues in database operations
- Check for race conditions in concurrent operations
- Verify indexes are properly set up for performance

### Database Performance Issues

**Problem**: Database operations are slow.

**Solutions**:
- Check database indexes
- Monitor MongoDB performance metrics
- Verify query patterns for efficiency
- Consider database scaling if under heavy load
- Check disk space and I/O performance

## Docker Deployment Issues

### Container Build Failures

**Problem**: Docker containers fail to build.

**Solutions**:
- Check Docker build logs for specific errors
- Verify Dockerfile syntax
- Ensure necessary build dependencies are available
- Check network connectivity for downloading dependencies
- Increase Docker resource allocation if needed

### Container Communication Issues

**Problem**: Docker containers cannot communicate with each other.

**Solutions**:
- Verify Docker network configuration
- Check container names and service discovery
- Ensure ports are correctly exposed and mapped
- Check Docker Compose network settings
- Verify DNS resolution between containers

### Resource Constraints

**Problem**: Containers crash due to resource limitations.

**Solutions**:
- Increase Docker resource allocation (CPU/memory)
- Optimize container resource usage
- Monitor container resource usage with Docker stats
- Consider using resource limits in Docker Compose
- Split services across multiple hosts if necessary

## Performance Problems

### High CPU Usage

**Problem**: System components consume excessive CPU.

**Solutions**:
- Profile the code to identify bottlenecks
- Check for infinite loops or inefficient algorithms
- Optimize ML model inference
- Consider using worker threads for CPU-intensive tasks
- Scale horizontally with multiple instances if possible

### Memory Leaks

**Problem**: Memory usage grows over time until service crashes.

**Solutions**:
- Check for proper resource cleanup in code
- Monitor memory usage trends
- Restart services periodically as a temporary measure
- Look for memory leaks in third-party libraries
- Implement proper garbage collection strategies

### Network Bottlenecks

**Problem**: System is slow due to network latency or bandwidth issues.

**Solutions**:
- Optimize payload sizes in API requests
- Implement caching strategies
- Use compression for large data transfers
- Consider using websockets for real-time data instead of polling
- Monitor network traffic patterns

### ML Service Performance

**Problem**: ML services (face recognition, object detection) are slow.

**Solutions**:
- Check model complexity and consider using lighter models
- Optimize image sizes before processing
- Implement batching for multiple detections
- Consider hardware acceleration (GPU) for ML workloads
- Profile Python code for performance bottlenecks

## Logging and Debugging

### Enabling Debug Logs

For more detailed troubleshooting, you can enable debug logs:

#### Backend:
```
# In .env file
LOG_LEVEL=debug
```

#### Frontend:
```
# In .env.local file
NEXT_PUBLIC_LOG_LEVEL=debug
```

#### ML Services:
Modify the Python logging configuration in the respective services.

### Checking Logs

- **Backend**: Check logs in the command window or in `logs/` directory
- **Frontend**: Check browser console (F12)
- **ML Services**: Check logs in the command windows or in `ml-services/*/logs/` directories
- **Docker**: Use `docker logs [container_name]` to view container logs

## Getting Additional Help

If you've tried the solutions in this guide but still experience issues:

1. Check the GitHub repository issues section for similar problems
2. Create a detailed bug report with:
   - System specifications
   - Error messages
   - Steps to reproduce
   - Log files
3. Contact the development team with the information collected
4. Join the community forum or chat for community assistance

## Preventive Measures

To prevent common issues:

1. Regularly update all dependencies
2. Implement a CI/CD pipeline for testing
3. Monitor system performance and resource usage
4. Create automated health checks
5. Perform regular backups of the database
6. Document custom changes to the codebase
7. Follow the principle of least privilege for security
