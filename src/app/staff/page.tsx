'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
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
  };
  seat: {
    seatNumber: string;
  };
  createdAt: string;
  claimToken: string;
}

export default function StaffDashboard() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('unclaimed');
  const [flightFilter, setFlightFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const router = useRouter();

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
      toast.error(err.message || 'Failed to fetch items');
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

  const handleViewDetails = (item: LostItem) => {
    router.push(`/verify/${item.claimToken}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Lost Items Dashboard
          </h1>
          <div className="space-x-4">
            <Link
              href="/staff/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent 
                rounded-lg text-sm font-medium text-white bg-green-600 
                hover:bg-green-700 transition-colors shadow-sm"
            >
              Submit Item
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center px-4 py-2 border border-transparent 
                rounded-lg text-sm font-medium text-white bg-blue-600 
                hover:bg-blue-700 transition-colors shadow-sm"
            >
              Scan QR Code
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by item name, flight, or seat..."
                className="block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  text-gray-900 focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              >
                <option value="unclaimed">Unclaimed</option>
                <option value="claimed">Claimed</option>
                <option value="shipped">Shipped</option>
                <option value="">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Flight Number
              </label>
              <input
                type="text"
                value={flightFilter}
                onChange={(e) => setFlightFilter(e.target.value)}
                placeholder="Enter flight number..."
                className="block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
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

        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm 
                  hover:shadow-md transition-shadow"
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
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {item.itemName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-900">Flight:</span>{' '}
                      {item.flight.flightNumber}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Seat:</span>{' '}
                      {item.seat.seatNumber}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Collection Code:</span>{' '}
                      <span 
                        className="font-mono px-2 py-1 rounded relative group cursor-pointer 
                          inline-flex items-center bg-gray-100"
                      >
                        <span className="relative">
                          <span className="absolute inset-0 bg-gray-100 z-10 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                            ••••••
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {item.collectionCode}
                          </span>
                        </span>
                        <svg 
                          className="w-4 h-4 ml-1 text-gray-500 opacity-100 group-hover:opacity-0 transition-opacity duration-200" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                          />
                        </svg>
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      href={`/verify/${item.claimToken}`}
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