'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode.react';

interface QRCodeGeneratorProps {
  sessionId: string;
  courseCode: string;
  expiryMinutes?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  sessionId, 
  courseCode,
  expiryMinutes = 5
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [expiryTime, setExpiryTime] = useState<Date>(new Date(Date.now() + expiryMinutes * 60 * 1000));
  const [countdown, setCountdown] = useState<number>(expiryMinutes * 60);
  
  // Generate a unique token that includes the session ID and expiry time
  const generateQRValue = () => {
    const token = {
      sessionId,
      courseCode,
      expiry: expiryTime.toISOString(),
      nonce: Math.random().toString(36).substring(2, 15)
    };
    return JSON.stringify(token);
  };
  
  // Refresh QR code
  const refreshQRCode = () => {
    const newExpiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
    setExpiryTime(newExpiryTime);
    setCountdown(expiryMinutes * 60);
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  // Update countdown timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 1000));
      setCountdown(secondsLeft);
      
      if (secondsLeft === 0) {
        refreshQRCode();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiryTime]);
  
  // Format countdown as MM:SS
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode 
          key={refreshKey}
          value={generateQRValue()} 
          size={200}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/logo.png",
            excavate: true,
            height: 24,
            width: 24,
          }}
        />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-1">QR Code expires in:</p>
        <div className="text-xl font-bold text-blue-600">{formatCountdown()}</div>
        <button 
          onClick={refreshQRCode}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          type="button"
        >
          Refresh QR Code
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Students can scan this QR code to mark their attendance</p>
        <p>Session ID: {sessionId}</p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
