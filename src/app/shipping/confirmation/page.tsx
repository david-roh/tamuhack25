'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ShippingConfirmation() {
  return (
    <div className="min-h-screen bg-[#1C2632] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-black/20 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-8 sm:p-8 text-center">
            <div className="bg-green-900/20 w-16 h-16 rounded-full mx-auto flex items-center justify-center border border-green-800">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">
              Shipping Request Processed!
            </h1>
            <p className="mt-3 text-gray-400 max-w-md mx-auto">
              Your item will be shipped to the provided address. You will receive a tracking number via email once the item is dispatched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 