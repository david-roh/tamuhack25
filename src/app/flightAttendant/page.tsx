'use client'

import { useState, useEffect } from 'react';
import React, { ChangeEvent, JSX } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ArrowRight } from 'lucide-react';

export default function FlightInputPage(): JSX.Element {
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [flightDetails, setFlightDetails] = useState<string>('');

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    setFlightNumber(e.target.value);
    const currentDate = new Date().toISOString().split('T')[0];
    const res = await fetch(`https://flight-engine-dr4l.onrender.com/flights?date=${currentDate}`);
    const obj = await res.json();
    // Add guaranteed test values
    obj.unshift(
      {
        flightNumber: "123",
        origin: {
          code: "LHR",
          city: "London"
        },
        destination: {
          code: "CDG",
          city: "Paris"
        }
      },
      {
        flightNumber: "456",
        origin: {
          code: "CDG",
          city: "Paris"
        },
        destination: {
          code: "LHR",
          city: "London"
        }
      }
    );
    // AA1234 -> 1234
    const idx = obj.findIndex((element: any) => String(element.flightNumber) === e.target.value.slice(2));
    if (idx === -1) setFlightDetails('Unknown flight');
    else setFlightDetails(`${obj[idx].origin.code} \u2192 ${obj[idx].destination.code} (${obj[idx].origin.city} \u2192 ${obj[idx].destination.city})`);
  };

  const handleSubmit = (): void => {
    setIsPopupVisible(true);
  };

  const handleConfirm = (): string => {
    return `add-pics/?flightNumber=${flightNumber}`
  };

  const handleCancel = (): void => {
    setIsPopupVisible(false);
  };

  return (
    <div 
      className="h-screen flex flex-col justify-center items-center bg-[#1C2632] relative overflow-hidden"
    >
      
      <motion.div 
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-4/5 max-w-md p-8 border-2 border-[#0078D7]/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 120, 215, 0.25)"
        }}
      >
        <div className="flex items-center justify-center mb-6">
          <Plane className="text-[#0078D7] mr-3" size={36} />
          <h1 className="text-3xl font-bold text-[#0078D7]">FindAir</h1>
        </div>
        
        <input
          type="text"
          placeholder="Enter flight number (e.g., AA1234)"
          value={flightNumber}
          onChange={handleInputChange}
          className="w-full p-4 border-2 border-[#0078D7]/30 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-[#0078D7]/50 text-black transition-all duration-300 hover:border-[#0078D7]/60 text-center text-lg"
        />
        
        <motion.button
          onClick={handleSubmit}
          className="w-full bg-[#0078D7] text-white py-4 rounded-xl hover:bg-[#005A9C] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          Track Flight
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {isPopupVisible && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-lg w-4/5 max-w-md p-6 border border-[#0078D7]/20"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-[#0078D7] text-center">Confirm Flight</h2>
              <p className="mb-6 text-gray-700 flex items-center justify-center">
                Flight Number: <strong className="ml-2 text-[#0078D7]">{flightNumber}</strong>
                <ArrowRight className="mx-2 text-gray-500" size={20} />
                <span className="text-gray-700 text-center">{flightDetails}</span>
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={handleCancel}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <Link href={handleConfirm()}>
                  <motion.button
                    className="px-5 py-2 bg-[#0078D7] text-white rounded-xl hover:bg-[#005A9C] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirm
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  );
}