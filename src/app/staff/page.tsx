'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';

interface LostItem {
  _id: string;
  itemName: string;
  itemDescription: string;
  itemImageUrl?: string;
  status: string;
  collectionCode: string;
  flight: {
    flightNumber: string;
  };
  seat: {
    seatNumber: string;
  };
  createdAt: string;
}

export default function StaffDashboard() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('unclaimed');
  const [flightFilter, setFlightFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchItems();
  }, [debouncedSearch, statusFilter, flightFilter]);

  const fetchItems = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (flightFilter) queryParams.append('flightNumber', flightFilter);
      if (debouncedSearch) queryParams.append('search', debouncedSearch);

      const response = await fetch(`/api/lost-items?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const searchMatch = !debouncedSearch || 
      item.itemName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.itemDescription?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.flight.flightNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.seat.seatNumber.toLowerCase().includes(debouncedSearch.toLowerCase());

    return searchMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Lost Items Dashboard
          </h1>
          <div className="space-x-3">
            <Link
              href="/staff/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Submit Item
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Scan QR Code
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="unclaimed">Unclaimed</option>
                <option value="claimed">Claimed</option>
                <option value="shipped">Shipped</option>
                <option value="">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flight Number
              </label>
              <input
                type="text"
                value={flightFilter}
                onChange={(e) => setFlightFilter(e.target.value)}
                placeholder="Enter flight number"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {item.itemImageUrl && (
                  <div className="aspect-video relative">
                    <Image
                      src={item.itemImageUrl}
                      alt={item.itemName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.itemName}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Flight:</span>{' '}
                      {item.flight.flightNumber}
                    </p>
                    <p>
                      <span className="font-medium">Seat:</span>{' '}
                      {item.seat.seatNumber}
                    </p>
                    <p>
                      <span className="font-medium">Collection Code:</span>{' '}
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {item.collectionCode}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      href={`/verify/${item._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                    <button
                      onClick={() => window.open(`/receipt/${item._id}`, '_blank')}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Generate Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 