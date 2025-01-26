'use client';

import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ShippingConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6 text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Shipping Request Processed!
          </h1>
          <p className="mt-2 text-gray-600">
            Your item will be shipped to the provided address. You will receive a tracking number via email once the item is dispatched.
          </p>
          <div className="mt-6">
            <Link
              href="/staff"
              className="inline-flex items-center px-4 py-2 border border-transparent 
                rounded-lg text-sm font-medium text-white bg-blue-600 
                hover:bg-blue-700 transition-colors shadow-sm"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 