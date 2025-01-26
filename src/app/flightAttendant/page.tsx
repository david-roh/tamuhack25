'use client'

import React, { ChangeEvent, JSX } from 'react';
import { useState } from 'react';
import Link from 'next/link';

export default function FlightInputPage(): JSX.Element {
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFlightNumber(e.target.value);
  };

  const handleSubmit = (): void => {
    setIsPopupVisible(true);
  };

  const handleConfirm = (): string => {
    // Handle Preprocessing here for flight number
    return "/add-pics";
  };

  const handleCancel = (): void => {
    setIsPopupVisible(false);
  };

  return (
    <div 
      className="h-screen flex flex-col justify-center items-center bg-cover bg-center" 
      style={{ backgroundImage: "url('/landscape.jpg')" }}
    >
      <div className="bg-white bg-opacity-80 p-4 rounded-2xl shadow-lg w-4/5 max-w-md">
        <h1 className="text-center text-2xl font-bold mb-4" style={{ color: '#36495A' }}>Let Good Take Flight</h1>
        <input
          type="text"
          placeholder="Enter flight number"
          value={flightNumber}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </div>

      {isPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-md">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#36495A' }}>Confirm Flight Number</h2>
            <p className="mb-6" style={{ color: '#36495A' }}>Is this the correct flight number? <strong>{flightNumber}</strong></p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <Link href={handleConfirm()}>
                <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                Confirm
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
