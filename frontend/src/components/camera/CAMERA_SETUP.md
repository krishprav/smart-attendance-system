# Camera Setup Guide

This document provides detailed instructions for setting up and troubleshooting the camera component in the Smart Attendance System.

## Initial Setup

The camera component is a critical part of the system, handling:
- Face recognition for attendance
- ID card verification
- Monitoring engagement
- Detecting unauthorized phone usage

## Browser Requirements

For optimal camera functionality, we recommend:

1. **Chrome** (version 80+) - Best overall compatibility
2. **Firefox** (version 78+) - Good alternative
3. **Edge** (Chromium-based, version 80+) - Good alternative

Safari and other browsers may work but have not been fully tested.

## Camera Permissions

To ensure the camera works properly:

1. When prompted, select "Allow" for camera access
2. If you accidentally denied permission:
   - Click the padlock/info icon in address bar
   - Find camera settings and change to "Allow"
   - Refresh the page

## Hardware Requirements

- Any built-in webcam or external USB webcam should work
- Minimum resolution: 640x480 (higher is better for face recognition)
- Proper lighting is essential for accurate recognition

## Testing Your Camera

1. Go to the system health check page (/debug/camera-test)
2. Click "Start Camera" button
3. If your face is detected, you'll see a green bounding box
4. If not, follow the troubleshooting steps below

## Common Issues and Solutions

### No Camera Detected

**Symptoms:**
- "No camera detected" error message
- Camera selection menu is empty

**Solutions:**
- Ensure your device has a functioning camera
- Check if another application is using the camera
- Restart your browser
- For laptops, check if camera has a physical privacy shutter or switch

### Permission Denied

**Symptoms:**
- "Permission denied" error
- Browser shows camera permission dialog but fails afterward

**Solutions:**
- Check browser permissions (padlock icon in address bar)
- Reset site permissions in browser settings
- Try incognito/private browsing mode
- Restart the browser

### Black Screen

**Symptoms:**
- Camera appears to start but shows only black
- No error messages displayed

**Solutions:**
- Check if camera lens is covered
- Try adjusting lighting in your environment
- Test the camera in another application
- Update your browser
- Restart your computer

### Poor Recognition Accuracy

**Symptoms:**
- System fails to recognize faces correctly
- Frequent false positives or negatives

**Solutions:**
- Ensure proper lighting (avoid backlight)
- Position face clearly in the center of the frame
- Re-register your face if needed
- Clean the camera lens
- Try using a higher quality camera

### Camera Freezes or Crashes

**Symptoms:**
- Camera feed starts but then freezes
- Browser tab becomes unresponsive

**Solutions:**
- Close other applications using the camera
- Check system resource usage (CPU/RAM)
- Try using the "Stop Camera" button and restart
- Update your browser
- Check for browser extensions that might interfere with camera access

## Advanced Configuration

For system administrators, the camera component can be customized via environment variables:

```
# In .env.local file
NEXT_PUBLIC_CAMERA_DEFAULT_WIDTH=1280
NEXT_PUBLIC_CAMERA_DEFAULT_HEIGHT=720
NEXT_PUBLIC_CAMERA_FACING_MODE=user  # 'user' for front camera, 'environment' for back camera
```

## Browser-Specific Issues

### Chrome

- If camera stops working after sleep/hibernate, refresh the page
- For persistent issues, try clearing site data: Settings > Privacy and security > Site Settings > Camera
- Hardware acceleration can sometimes cause issues: try disabling it in chrome://settings > Advanced > System

### Firefox

- If camera doesn't initialize, check about:config and search for "media.navigator.permission.disabled"
- Privacy settings might be blocking camera: check Settings > Privacy & Security > Permissions

### Edge

- Edge follows similar patterns to Chrome
- Check edge://settings/content/camera for permission settings

## For Developers

When developing with the camera component:

1. **Testing without HTTPS locally:**
   - Chrome and Edge allow camera on localhost without HTTPS
   - Firefox requires enabling "dom.security.https_first_pbm" to be set to false in about:config

2. **Debugging:**
   - Use browser developer tools > Console for error messages
   - Check Network tab for failed API requests
   - Test with the "DefaultCamera" component for simpler testing

3. **Implementation Details:**
   - Camera component uses MediaDevices API
   - Face detection happens server-side via API calls
   - See WebcamCapture.tsx for implementation details

## Additional Resources

- [MDN Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API)
- [Web Camera API Compatibility](https://caniuse.com/stream)
- [Chrome Camera Permission Guidelines](https://developers.google.com/web/updates/2015/10/chrome-47-webrtc)
