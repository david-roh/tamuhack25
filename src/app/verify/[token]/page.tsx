'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import Link from 'next/link';

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
  shipping?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    trackingNumber?: string;
  };
}

function ShippingLabel({ shipping }: { shipping: NonNullable<LostItem['shipping']> }) {
  const labelRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadLabel = async () => {
    if (!labelRef.current || downloading) return;
    
    try {
      setDownloading(true);
      const content = labelRef.current;
      
      const canvas = await html2canvas(content, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        removeContainer: true
      });

      // Convert to blob instead of using toDataURL
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });

      // Create URL from blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `shipping-label-${shipping.trackingNumber || 'untracked'}.png`;
      
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(url);
      
      toast.success('Shipping label downloaded successfully');
    } catch (error) {
      console.error('Error downloading shipping label:', error);
      toast.error('Failed to download shipping label');
    } finally {
      setDownloading(false);
    }
  };

  const generateBarcode = () => {
    const bars = [];
    // Pattern for creating groups of bars
    const patterns = [
      [1,1,2,2,1], // Thin-Thin-Thick-Thick-Thin
      [2,1,1,1,2], // Thick-Thin-Thin-Thin-Thick
      [1,2,1,2,1], // Thin-Thick-Thin-Thick-Thin
    ];
    
    let patternIndex = 0;
    for (let i = 0; i < 48; i++) {
      const pattern = patterns[patternIndex % patterns.length];
      const width = pattern[i % pattern.length];
      
      bars.push(
        <div
          key={i}
          className="bg-black"
          style={{
            width: `${width}px`,
            height: '100%',
            margin: '0 0.5px'
          }}
        />
      );
      
      if (i % pattern.length === pattern.length - 1) {
        patternIndex++;
      }
    }
    return bars;
  };

  return (
    <div className="space-y-4">
      <div 
        ref={labelRef}
        className="bg-white border-2 border-gray-900 p-6 rounded-lg w-[400px] mx-auto text-black"
      >
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-4 mb-4">
          <div className="text-center mb-4">
            <div className="text-2xl font-black tracking-wider">PRIORITY MAIL</div>
            <div className="text-sm font-bold">UNITED STATES POSTAL SERVICE</div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <div>FROM: Lost & Found Department</div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="space-y-6">
          {/* To Address */}
          <div className="border-2 border-gray-900 p-3">
            <div className="text-xs font-black mb-2">SHIP TO:</div>
            <div className="text-base font-black">{shipping.address}</div>
            <div className="text-base font-black">
              {shipping.city}, {shipping.state} {shipping.postalCode}
            </div>
            <div className="text-base font-black">{shipping.country}</div>
          </div>

          {/* Barcode Section */}
          <div className="space-y-3">
            {/* Main Barcode */}
            <div className="flex flex-col items-center">
              <div className="h-[80px] flex justify-center items-center bg-white">
                <div className="relative w-[280px]">
                  {/* Top section */}
                  <div className="h-[50px] flex justify-center">
                    {generateBarcode()}
                  </div>
                  {/* Bottom section */}
                  <div className="h-[30px] flex justify-center mt-[-1px]">
                    {generateBarcode()}
                  </div>
                </div>
              </div>
              {shipping.trackingNumber && (
                <div className="text-center font-mono text-sm font-black mt-1">
                  {shipping.trackingNumber}
                </div>
              )}
            </div>
            
            {/* Smaller Barcode */}
            <div className="flex flex-col items-center">
              <div className="h-[40px] w-[200px] flex justify-center bg-white">
                <div className="w-full flex justify-center">
                  {generateBarcode()}
                </div>
              </div>
            </div>
          </div>

          {/* USPS Branding */}
          <div className="flex items-center justify-between border-t-2 border-gray-900 pt-4">
            <div className="text-xs font-black">USPS TRACKING #</div>
            <div className="text-xs font-black">PRIORITY MAIL 2-DAY™</div>
          </div>
        </div>

        {/* Warning Text */}
        <div className="mt-4 text-[10px] text-center font-black">
          FOR DOMESTIC AND INTERNATIONAL USE
        </div>
      </div>

      <button
        onClick={downloadLabel}
        disabled={downloading}
        className={`w-full py-2 px-4 rounded-lg 
          flex items-center justify-center gap-2 transition-colors duration-200
          ${downloading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gray-900 hover:bg-gray-800'
          } text-white`}
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Label...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Shipping Label
          </>
        )}
      </button>
    </div>
  );
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

        console.log('Fetched item:', {
          status: data.status,
          shipping: data.shipping,
          shippingDetails: data.shippingDetails
        });
        
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
      <div className="min-h-screen bg-[#1C2632] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#1C2632] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-black/20 border border-gray-800 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-400">Item Not Found</h2>
            <p className="mt-2 text-gray-400">This QR code is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-4">
      <Link href="/staff"><button>Go Back</button></Link>
    </div>
    <div className="min-h-screen bg-[#1C2632] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-black/20 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
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

            <div className="bg-black/30 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-xl text-white">{item.itemName}</h3>
              <p className="text-gray-300">{item.itemDescription}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-black/20 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block mb-1">Flight</span>
                  <p className="font-medium text-white">{item.flight.flightNumber}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block mb-1">Seat</span>
                  <p className="font-medium text-white">{item.seat.seatNumber}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block mb-1">Route</span>
                  <p className="font-medium text-white">
                    {item.flight.originCode} → {item.flight.destinationCode}
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block mb-1">Status</span>
                  <p className="font-medium text-white capitalize">{item.status}</p>
                </div>
              </div>
            </div>

            {item.status === 'unclaimed' ? (
              <div className="bg-[#4A90E2]/10 border border-[#4A90E2]/20 rounded-xl p-6">
                <label className="block text-sm font-medium text-[#4A90E2] mb-2">
                  Enter Verification Code
                </label>
                <div className="mt-1 flex gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="block w-full rounded-lg border-gray-800 bg-black/30 
                      shadow-sm transition duration-150 ease-in-out
                      placeholder:text-gray-500 text-white px-3
                      focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                      hover:border-gray-700"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={!verificationCode || verifying}
                    className={`inline-flex justify-center rounded-lg px-4 py-2
                      text-sm font-semibold shadow-sm transition-all
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1C2632]
                      ${verifying 
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        : verificationCode
                          ? 'bg-[#4A90E2] text-white hover:bg-[#4A90E2]/90 focus:ring-[#4A90E2]'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
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
            ) : item.status === 'shipped' && item.shipping ? (
              <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-6">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h4a1 1 0 011 1v6h-1.05a2.5 2.5 0 00-4.9 0H10a1 1 0 01-1-1V7a1 1 0 011-1h4z" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm font-medium text-purple-300">
                      This item has been shipped
                    </p>
                  </div>

                  <ShippingLabel shipping={item.shipping} />
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-green-300">
                    This item has been {item.status}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm font-medium text-red-300">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div></>
  );
} 