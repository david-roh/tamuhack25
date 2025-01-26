'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface LostItem {
  _id: string;
  itemName: string;
  itemDescription: string;
  itemImageUrl?: string;
  status: string;
  collectionCode: string;
  flight: {
    flightNumber: string;
    originCode: string;
    destinationCode: string;
  };
  seat: {
    seatNumber: string;
    customerEmail?: string;
  };
}

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<LostItem | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/qr/${params.token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch item');
        }

        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item details');
        setError('Failed to fetch item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params.token]);

  const handleVerify = async () => {
    try {
      setError('');
      setVerifying(true);

      const response = await fetch(`/api/qr/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      toast.success('Item verified successfully!');
      setItem(data.item);
      
      setTimeout(() => {
        router.push('/staff');
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Item Not Found</h2>
            <p className="mt-2 text-gray-600">This QR code is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Verify Lost Item Collection
          </h1>

          <div className="space-y-6">
            {item.itemImageUrl && (
              <div className="aspect-square w-full relative rounded-xl overflow-hidden shadow-inner">
                <Image
                  src={item.itemImageUrl}
                  alt={item.itemName}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-xl text-gray-900">{item.itemName}</h3>
              <p className="text-gray-700">{item.itemDescription}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-gray-500 block mb-1">Flight</span>
                  <p className="font-medium text-gray-900">{item.flight.flightNumber}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-gray-500 block mb-1">Seat</span>
                  <p className="font-medium text-gray-900">{item.seat.seatNumber}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-gray-500 block mb-1">Route</span>
                  <p className="font-medium text-gray-900">
                    {item.flight.originCode} → {item.flight.destinationCode}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-gray-500 block mb-1">Status</span>
                  <p className="font-medium text-gray-900 capitalize">{item.status}</p>
                </div>
              </div>
            </div>

            {item.status === 'unclaimed' ? (
              <div className="bg-blue-50 rounded-xl p-6">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Enter Verification Code
                </label>
                <div className="mt-1 flex gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="block w-full rounded-lg border-gray-300 bg-white 
                      shadow-sm transition duration-150 ease-in-out
                      placeholder:text-gray-400 text-gray-900
                      focus:border-blue-500 focus:ring-blue-500 
                      hover:border-gray-400 sm:text-sm"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={!verificationCode || verifying}
                    className={`inline-flex justify-center rounded-lg px-4 py-2
                      text-sm font-semibold shadow-sm transition-all
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${verifying 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : verificationCode
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {verifying ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-green-800">
                    This item has been {item.status}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 