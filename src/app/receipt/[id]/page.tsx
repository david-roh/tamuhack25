'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';

interface LostItem {
  _id: string;
  itemName: string;
  itemDescription: string;
  itemImageUrl?: string;
  status: string;
  collectionCode: string;
  claimedAt?: string;
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

export default function ReceiptPage() {
  const { id } = useParams();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(`/api/lost-items/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setItem(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-print when loaded
    if (item && !loading && !error) {
      window.print();
    }
  }, [item, loading, error]);

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
            <p className="mt-2 text-gray-600">Unable to generate receipt.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Lost Item Collection Receipt</h1>
        <p className="text-gray-500">
          {format(new Date(), 'MMMM d, yyyy h:mm a')}
        </p>
      </div>

      {/* Item Details */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Item Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Item:</span> {item.itemName}</p>
              <p><span className="font-medium">Description:</span> {item.itemDescription}</p>
              <p><span className="font-medium">Status:</span> {item.status}</p>
              {item.claimedAt && (
                <p>
                  <span className="font-medium">Collected On:</span>{' '}
                  {format(new Date(item.claimedAt), 'MMMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Flight Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Flight:</span> {item.flight.flightNumber}</p>
              <p>
                <span className="font-medium">Route:</span>{' '}
                {item.flight.originCode} → {item.flight.destinationCode}
              </p>
              <p><span className="font-medium">Seat:</span> {item.seat.seatNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      {item.itemImageUrl && (
        <div className="mb-8">
          <div className="aspect-video relative w-full max-w-md mx-auto">
            <Image
              src={item.itemImageUrl}
              alt={item.itemName}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="border-t pt-4">
          <p className="text-center text-sm text-gray-600">Staff Signature</p>
        </div>
        <div className="border-t pt-4">
          <p className="text-center text-sm text-gray-600">Customer Signature</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>This receipt serves as proof of collection for the lost item.</p>
        <p className="mt-1">Please retain for your records.</p>
      </div>

      {/* Print-only QR Code */}
      <div className="hidden print:block text-center mt-8">
        <Image
          src={`/api/qr/${item._id}`}
          alt="Item QR Code"
          width={100}
          height={100}
          className="mx-auto"
        />
        <p className="text-sm text-gray-500 mt-2">Reference: {item._id}</p>
      </div>
    </div>
  );
} 