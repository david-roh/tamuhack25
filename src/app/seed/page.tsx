'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QRCode {
  itemName: string;
  qrCode: string;
  collectionCode: string;
}

export default function SeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);

  const handleSeed = async () => {
    if (!confirm('This will clear all existing data. Are you sure?')) {
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setQrCodes([]);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed database');
      }

      setResult(JSON.stringify({
        message: data.message,
        data: {
          flights: data.data.flights,
          seats: data.data.seats,
          lostItems: data.data.lostItems
        }
      }, null, 2));

      if (data.data.qrCodes) {
        setQrCodes(data.data.qrCodes);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = (qrCode: QRCode) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = `${qrCode.itemName}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Database Seeder
          </h1>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-700">
                Warning: This will clear all existing data and populate the database with sample data.
              </p>
            </div>

            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Seeding...' : 'Seed Database'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {qrCodes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">QR Codes</h2>
                {qrCodes.map((qrCode, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <p className="font-medium text-gray-900">{qrCode.itemName}</p>
                    <p className="text-sm text-gray-500 mb-2">Collection Code: {qrCode.collectionCode}</p>
                    <img src={qrCode.qrCode} alt={`QR code for ${qrCode.itemName}`} className="mb-2" />
                    <button
                      onClick={() => downloadQrCode(qrCode)}
                      className="w-full bg-green-500 text-white py-1 px-2 rounded-md text-sm hover:bg-green-600"
                    >
                      Download QR Code
                    </button>
                  </div>
                ))}
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <pre className="text-sm text-green-700 whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            )}

            <button
              onClick={() => router.push('/staff')}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-gray-600"
            >
              Back to Staff Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 