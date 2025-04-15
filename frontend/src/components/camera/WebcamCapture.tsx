'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Function to detect available camera devices
async function detectCameraDevices() {
  try {
    // Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { hasCameras: false, error: 'Your browser does not support camera detection.' };
    }
    
    // Request permission first - this helps trigger the permission dialog
    // before we enumerate devices
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (permissionErr) {
      console.warn('Could not get camera permission:', permissionErr);
      // Continue anyway, enumeration will still give us devices but they might 
      // not have labels if permission was denied
    }
    
    // Enumerate all media devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    console.log('Available video devices:', videoDevices);
    
    return {
      hasCameras: videoDevices.length > 0,
      count: videoDevices.length,
      devices: videoDevices
    };
  } catch (err: any) {
    console.error('Error detecting camera devices:', err);
    return { hasCameras: false, error: err.message || 'Unknown error detecting cameras' };
  }
}

// Function to get the best camera device
async function getBestCamera() {
  try {
    const { devices } = await detectCameraDevices();
    
    if (!devices || devices.length === 0) {
      throw new Error('No camera devices found');
    }
    
    // Prefer the front camera (if we can identify it)
    // Common front camera labels often include 'front', 'user', 'face'
    const frontCameras = devices.filter(device => {
      const label = device.label.toLowerCase();
      return label.includes('front') || label.includes('user') || label.includes('face');
    });
    
    // Return front camera if found, otherwise the first camera
    return frontCameras.length > 0 ? frontCameras[0] : devices[0];
  } catch (err) {
    console.error('Error getting best camera:', err);
    return null;
  }
}

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  width?: number;
  height?: number;
  facingMode?: string;
  btnClassName?: string;
  showGuide?: boolean;
  showTroubleshooting?: boolean;
}

const WebcamCapture = ({
  onCapture,
  width = 640,
  height = 480,
  facingMode = 'user',
  btnClassName = '',
  showGuide = true,
  showTroubleshooting = true,
}: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [cameraInfo, setCameraInfo] = useState<{count: number, current: string | null}>({count: 0, current: null});

  // Function to check camera permissions
  const checkPermissions = useCallback(async () => {
    try {
      // Check if permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as any });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        // Set up listener for permission changes
        result.onchange = () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
          if (result.state === 'granted') {
            startWebcam();
          } else if (result.state === 'denied') {
            setError('Camera permission denied. Please allow camera access in your browser settings.');
            setIsStreaming(false);
          }
        };
      }
    } catch (err) {
      console.warn('Could not query camera permissions:', err);
      // We'll continue without knowing the permission state
    }
  }, []);

  // Start the webcam stream
  const startWebcam = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // First check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support webcam access. Please use a modern browser like Chrome or Firefox.');
      }

      // Check for available camera devices
      const cameraStatus = await detectCameraDevices();
      if (!cameraStatus.hasCameras) {
        throw new Error(cameraStatus.error || 'No camera detected on your device. Please make sure your camera is connected and not used by another application.');
      }
      
      console.log(`Detected ${cameraStatus.count} camera(s)`);
      setCameraInfo({count: cameraStatus.count, current: null});
      
      // Try to get the best camera (if possible)
      const bestCamera = await getBestCamera();
      
      // Start with a more detailed request first
      let stream;
      let cameraLabel = 'Default camera';
      const constraints: MediaStreamConstraints = { audio: false };
      
      try {
        // If we have a specific camera, try to use it
        if (bestCamera && bestCamera.deviceId) {
          console.log('Using camera:', bestCamera.label);
          cameraLabel = bestCamera.label || 'Selected camera';
          
          constraints.video = {
            deviceId: { exact: bestCamera.deviceId },
            width: { ideal: width },
            height: { ideal: height }
          };
        } else {
          // No specific camera found, use facingMode
          constraints.video = {
            width: { ideal: width },
            height: { ideal: height },
            facingMode,
          };
        }
        
        // Try to get the stream with detailed constraints
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (initialError) {
        console.warn('Failed with detailed settings, trying with simplified constraints:', initialError);
        
        // Fallback 1: Try with just facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false
          });
        } catch (facingModeError) {
          console.warn('Failed with facingMode, trying with any camera:', facingModeError);
          
          // Fallback 2: Try with any camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      // Update camera info
      setCameraInfo(prev => ({ ...prev, current: cameraLabel }));
      
      // Permission must be granted at this point
      setCameraPermission('granted');

      // Set up the video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Set up event handlers for the video element
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Error playing video:', e);
              setError(`Error playing video: ${e.message}. Try refreshing the page.`);
            });
          }
        };
        
        videoRef.current.onplaying = () => {
          setIsStreaming(true);
          setError(null);
          setIsInitializing(false);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Video element error:', e);
          setError('Error with video playback. Try refreshing the page.');
          setIsStreaming(false);
          setIsInitializing(false);
        };
      } else {
        throw new Error('Video element not available');
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      
      // Set appropriate error message based on the error
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setError('Camera access denied. Please allow camera access in your browser settings and reload the page.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please connect a camera and reload the page.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Your camera is currently in use by another application. Please close other applications that might be using the camera.');
      } else {
        setError(`Error accessing webcam: ${err.message || 'Unknown error'}. Try refreshing the page or check camera permissions.`);
      }
      
      setIsStreaming(false);
      setIsInitializing(false);
    }
  }, [width, height, facingMode]);

  // Stop the webcam stream
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
          track.stop();
        });

        videoRef.current.srcObject = null;
      } catch (err) {
        console.error('Error stopping webcam:', err);
      }
      
      setIsStreaming(false);
    }
  }, []);

  // Switch camera if multiple cameras are available
  const switchCamera = useCallback(async () => {
    // First stop current camera
    stopWebcam();
    
    // Then try to get all video devices
    try {
      const { devices } = await detectCameraDevices();
      
      if (!devices || devices.length <= 1) {
        // Not enough cameras to switch
        setError('No additional cameras available to switch to');
        // Restart the current camera
        startWebcam();
        return;
      }
      
      // If we're using a specific camera, find the next one
      if (cameraInfo.current) {
        // Find current camera in the list
        const currentIndex = devices.findIndex(d => d.label === cameraInfo.current);
        // Get next camera (wrap around if needed)
        const nextIndex = (currentIndex + 1) % devices.length;
        const nextCamera = devices[nextIndex];
        
        // Try to start with the next camera
        try {
          setIsInitializing(true);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: nextCamera.deviceId } },
            audio: false
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraInfo(prev => ({ ...prev, current: nextCamera.label }));
          }
        } catch (err) {
          console.error('Error switching camera:', err);
          setError('Failed to switch camera. Restarting with default camera.');
          // Fallback to default camera
          startWebcam();
        }
      } else {
        // If no specific camera is set, just restart (it will try to use the best one)
        startWebcam();
      }
    } catch (err) {
      console.error('Error detecting cameras for switch:', err);
      // Restart the current camera
      startWebcam();
    }
  }, [cameraInfo.current, startWebcam, stopWebcam]);

  // Capture a frame from the video
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the current video frame to the canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get the image as a data URL
          const imageSrc = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality for better performance

          // Pass the image to the parent component
          onCapture(imageSrc);
          return true;
        }
      } catch (err) {
        console.error('Error capturing image:', err);
        setError(`Failed to capture image: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return false;
      }
    }
    
    if (!isStreaming) {
      setError('Cannot capture image: Camera is not streaming');
    }
    
    return false;
  }, [isStreaming, onCapture]);

  // Clean up the webcam stream when component unmounts
  useEffect(() => {
    // Small delay to ensure DOM is fully loaded
    const timeoutId = setTimeout(() => {
      startWebcam();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      stopWebcam();
    };
  }, [startWebcam, stopWebcam]);

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="text-red-500 mb-2 p-2 bg-red-50 border border-red-200 rounded">
          <p>{error}</p>
          <p className="text-sm mt-1">Make sure your camera is not being used by another application and that you've allowed camera access in your browser.</p>
        </div>
      )}
      
      <div className="relative w-full max-w-md mb-4">
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-md"
          autoPlay
          playsInline
          muted
          onCanPlay={() => setIsStreaming(true)}
        />
        
        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Camera status indicator */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span>{isStreaming ? 'Camera active' : 'Camera inactive'}</span>
        </div>
        
        {/* Optional overlay for face positioning guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="border-2 border-dashed border-blue-400 rounded-full w-48 h-48 opacity-50" />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={captureImage}
          disabled={!isStreaming}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 ${btnClassName}`}
        >
          Capture
        </button>
        
        {!isStreaming ? (
          <button
            onClick={startWebcam}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopWebcam}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
          >
            Stop Camera
          </button>
        )}
      </div>
      
      {/* Troubleshooting section */}
      {!isStreaming && (
        <div className="mt-4 text-sm text-gray-600 p-2 border border-gray-200 rounded bg-gray-50 max-w-md">
          <h4 className="font-medium text-gray-700">Camera troubleshooting tips:</h4>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Make sure your browser has permission to access the camera</li>
            <li>Close other applications that might be using your camera</li>
            <li>Try refreshing the page</li>
            <li>If using a laptop, check if your camera is physically enabled</li>
            <li>Try a different browser (Chrome or Firefox recommended)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
