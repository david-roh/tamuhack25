'use client';

import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

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
        // Request camera permission with more flexible constraints
        await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: 'environment',
            width: { ideal: 1080 },
            height: { ideal: 1080 }
          } 
        });
        
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

        // Prefer back camera if available
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        setCameras(videoDevices);
        setSelectedCamera(backCamera?.deviceId || videoDevices[0].deviceId);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'OverconstrainedError') {
            // Try again with minimal constraints
            try {
              await navigator.mediaDevices.getUserMedia({ video: true });
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videoDevices = devices
                .filter(device => device.kind === 'videoinput')
                .map(device => ({
                  deviceId: device.deviceId,
                  label: device.label || `Camera ${devices.indexOf(device) + 1}`
                }));
              if (videoDevices.length > 0) {
                setCameras(videoDevices);
                setSelectedCamera(videoDevices[0].deviceId);
                setError('');
                return;
              }
            } catch (retryErr) {
              setError('Camera not compatible. Please try a different device.');
            }
          } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Camera access denied. Please grant permission to use the camera.');
          } else if (err.name === 'NotFoundError') {
            setError('No camera found on this device.');
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setError('Camera is in use by another application.');
          } else {
            setError(`Camera error: ${err.message}`);
          }
        } else {
          setError('Failed to initialize camera');
        }
        console.error('Camera initialization error:', err);
      }
    };

    initializeCamera();

    // Cleanup function
    return () => {
      // Stop any active media tracks
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {});
    };
  }, []);

  const handleScan = async (result: string | null) => {
    if (!result || !scanning) return;
    
    setScanning(false); // Prevent multiple scans

    try {
      // Extract token from QR code URL - handle both formats
      const token = result.split('/qr/')[1]?.split('/api/qr/')[0];
      if (!token) throw new Error('Invalid QR code');

      setClaimed(true);
      router.push(`/verify/${token}`);
    } catch (err) {
      setError('Invalid QR code format');
      setScanning(true); // Resume scanning
    }
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
    setError(error instanceof Error ? error.message : 'Scanner error occurred');
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
    <div className="min-h-screen bg-[#1C2632] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/5 py-2 px-3 
              flex items-center text-lg font-normal"
          >
            <Link href="/staff">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Staff
            </Link>
          </Button>
        </div>

        <div className="bg-black/20 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">
                Scan Lost Item QR Code
              </h1>
              {cameras.length > 1 && (
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="block rounded-lg border-gray-800 bg-black/30 
                    shadow-sm transition duration-150 ease-in-out
                    text-white focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                    hover:border-gray-700 sm:text-sm px-3 py-2"
                >
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="aspect-square w-full relative mb-4 rounded-lg overflow-hidden">
              {selectedCamera && !error ? (
                <Scanner
                  onScan={handleScanWrapper}
                  onError={handleError}
                  constraints={{
                    deviceId: selectedCamera,
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/30 rounded-lg border border-gray-800">
                  <p className="text-sm text-gray-400">
                    {error || 'Initializing camera...'}
                  </p>
                </div>
              )}
            </div>

            {claimed && (
              <div className="mt-4">
                <Button
                  asChild
                  className="w-full bg-[#4A90E2] hover:bg-[#4A90E2]/90 text-white"
                >
                  <Link href="/staff">
                    Back to Staff Page
                  </Link>
                </Button>
              </div>
            )}

            <p className="text-sm text-gray-400 mt-4">
              Position the QR code within the frame to scan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 