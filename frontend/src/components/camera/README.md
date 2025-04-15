# Camera Component Documentation

## Overview

The `WebcamCapture` component provides camera capture functionality for the Smart Attendance System. It handles webcam access, image capturing, and provides user feedback for camera operations.

## Features

- Real-time webcam preview
- Face positioning guide overlay
- Camera availability detection
- Graceful error handling with user feedback
- Multiple fallback mechanisms for different browser capabilities
- Camera status indicators

## Usage

```tsx
import WebcamCapture from '@/components/camera/WebcamCapture';

// In your component
const handleCapture = (imageSrc: string) => {
  // Do something with the captured image
  console.log('Image captured:', imageSrc);
};

// Render the component
<WebcamCapture 
  onCapture={handleCapture}
  width={640}
  height={480}
  facingMode="user"
  btnClassName="custom-btn-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCapture` | `(imageSrc: string) => void` | Required | Callback function that receives the captured image as a base64 data URL |
| `width` | `number` | 640 | Desired camera width |
| `height` | `number` | 480 | Desired camera height |
| `facingMode` | `string` | "user" | Camera facing mode ("user" for front camera, "environment" for back camera) |
| `btnClassName` | `string` | "" | Additional CSS class for the capture button |

## Troubleshooting Camera Issues

### Common Issues and Solutions

#### 1. Camera Not Detected

**Symptoms:**
- "No camera detected on your device" error message
- Camera selection dropdown is empty

**Solutions:**
- Ensure your device has a working camera
- Check if camera is physically enabled (some laptops have physical switches)
- Verify no other application is using the camera
- Restart your browser or computer

#### 2. Permission Denied

**Symptoms:**
- "Permission denied" error message
- Browser shows camera permission dialog but camera doesn't initialize after allowing

**Solutions:**
- Check browser permissions: Click the padlock icon in the address bar and ensure camera access is allowed
- Reset permissions: Settings > Privacy & Security > Site Settings > Camera
- Try using a different browser (Chrome or Firefox recommended)

#### 3. Camera Initialization Failed

**Symptoms:**
- Camera appears to be detected but doesn't start
- Error about constraints not being satisfied

**Solutions:**
- Try refreshing the page
- Close other applications that might be using the camera
- Try with minimal constraints by clicking the "Start Camera" button
- Check for browser extensions that might be interfering with camera access

#### 4. Black Screen

**Symptoms:**
- Camera appears to start but shows a black screen
- No error messages displayed

**Solutions:**
- Check if camera lens is covered or obstructed
- Try adjusting lighting conditions
- Test the camera in another application to confirm it's working properly
- Update your browser to the latest version

### Browser-Specific Issues

#### Chrome
- Ensure HTTPS is used (camera access requires secure context)
- Check chrome://settings/content/camera for permissions
- Try disabling hardware acceleration in browser settings

#### Firefox
- Check about:preferences#privacy for camera permissions
- Update to latest Firefox version

#### Safari
- Check System Preferences > Security & Privacy > Camera
- Safari requires explicit permission for each site

#### Edge
- Check edge://settings/content/camera for permissions
- Try disabling tracking prevention for the site

### Technical Notes for Developers

If you're experiencing issues with the camera component:

1. Check browser console for specific error messages
2. Verify MediaDevices API compatibility with your browser
3. Ensure proper cleanup when component unmounts
4. Try simplifying constraints if high-resolution requests fail
5. For deployment, ensure your site uses HTTPS as most browsers require it for camera access

## Advanced Features

### Customizing Camera Settings

You can modify the camera settings by adjusting the constraints in the `startWebcam` function:

```tsx
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: width },
    height: { ideal: height },
    facingMode,
    // Add additional constraints here
    frameRate: { ideal: 30 },
    aspectRatio: { ideal: 1.7777777778 }
  },
  audio: false,
});
```

### Adding Face Detection Overlay

For face detection features, you can enhance the component with a face detection library like face-api.js and add overlay feedback for better user experience.
