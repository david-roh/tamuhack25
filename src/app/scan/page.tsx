'use client';

import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';

interface VideoDevice {
  deviceId: string;
  label: string;
}

interface ScanError extends Error {
  message: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(true);
  const [cameras, setCameras] = useState<VideoDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [claimed, setClaimed] = useState<boolean>(false);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${devices.indexOf(device) + 1}`
          }));

        if (videoDevices.length === 0) {
          setError('No cameras found on this device');
          return;
        }

        setCameras(videoDevices);
        setSelectedCamera(videoDevices[0].deviceId);
      } catch (err: any) {
        console.error('Camera initialization error:', err);
        setError(`Camera access error: ${err.message}`);
      }
    };

    initializeCamera();
  }, []);

  const handleScan = async (result: string | null) => {
    if (!result || !scanning) return;
    
    setScanning(false); // Prevent multiple scans

    try {
      // Extract token from QR code URL
      const token = result.split('/qr/')[1];
      if (!token) throw new Error('Invalid QR code');

      setClaimed(true);
      router.push(`/verify/${token}`);
    } catch (error: ScanError) {
      setError('Invalid QR code format');
      setScanning(true); // Resume scanning
    }
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
    setError(error instanceof Error ? error.message : 'Scanner error occurred');
  };

  const handleBackToStaffPage = () => {
    router.push('/staff');
  };

  interface IDetectedBarcode {
    rawValue: string;
  }

  const handleScanWrapper = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      handleScan(detectedCodes[0].rawValue);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Scan Lost Item QR Code
            </h1>
            {cameras.length > 1 && (
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="aspect-square w-full relative mb-4">
            {selectedCamera ? (
              <Scanner
                onScan={handleScanWrapper}
                onError={handleError}
                constraints={{
                  deviceId: selectedCamera,
                  facingMode: 'environment'
                }}
                containerStyle={{ borderRadius: '0.5rem' }}
              />
            ) : (
              <p className="text-sm text-gray-500">Initializing camera...</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {claimed && (
            <div className="mt-4">
              <button
                onClick={handleBackToStaffPage}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600"
              >
                Back to Staff Page
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Position the QR code within the frame to scan
          </p>
        </div>
      </div>
    </div>
  );
} 