'use client'

import React, { ChangeEvent } from 'react';
import { useState } from 'react';

export default function FlightInputPage(): JSX.Element {
  const [flightNumber, setFlightNumber] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFlightNumber(e.target.value);
  };

  const handleSubmit = (): void => {
    alert(`Flight number submitted: ${flightNumber}`);
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center relative">
      {/* Background image using an absolute div */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/landscape.jpg')" }}
      ></div>

      {/* Overlay for content */}
      <div className="z-10 bg-white bg-opacity-80 p-4 rounded-2xl shadow-lg w-4/5 max-w-md">
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
    </div>
  );
}
