'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Country, State, City } from 'country-state-city';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ShippingDetails {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Location {
  name: string;
  code: string;
}

export default function ShippingPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Location search states
  const [countryQuery, setCountryQuery] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  
  // Selected location states
  const [selectedCountry, setSelectedCountry] = useState<Location | null>(null);
  const [selectedState, setSelectedState] = useState<Location | null>(null);
  const [selectedCity, setSelectedCity] = useState<Location | null>(null);

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  // Filter functions for location searches
  const filteredCountries = countryQuery === ''
    ? Country.getAllCountries()
    : Country.getAllCountries().filter((country) =>
        country.name.toLowerCase().includes(countryQuery.toLowerCase())
      );

  const filteredStates = stateQuery === ''
    ? State.getStatesOfCountry(selectedCountry?.code)
    : State.getStatesOfCountry(selectedCountry?.code).filter((state) =>
        state.name.toLowerCase().includes(stateQuery.toLowerCase())
      );

  const filteredCities = cityQuery === ''
    ? City.getCitiesOfState(selectedCountry?.code, selectedState?.code)
    : City.getCitiesOfState(selectedCountry?.code, selectedState?.code).filter((city) =>
        city.name.toLowerCase().includes(cityQuery.toLowerCase())
      );

  // Check item status on page load
  useEffect(() => {
    async function checkItemStatus() {
      console.log('Checking item status for token:', params.token);
      try {
        const response = await fetch(`/api/lost-items/${params.token}`);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Item data:', data);

        if (!response.ok) {
          console.error('Response not OK:', data.error);
          throw new Error(data.error || 'Failed to fetch item status');
        }

        // Check if item exists and has status
        if (!data || !data.status) {
          console.error('Invalid item data:', data);
          toast.error('Invalid item token');
          router.push('/staff');
          return;
        }

        // Log the item status
        console.log('Item status:', data.status);

        // Only redirect for specific statuses
        if (data.status === 'claimed') {
          console.log('Item is already claimed, redirecting...');
          toast.error('This item has already been claimed');
          router.push('/staff');
          return;
        }

        if (data.status === 'shipped') {
          console.log('Item is already shipped, redirecting...');
          toast.error('This item has already been shipped');
          router.push('/staff');
          return;
        }

        console.log('Item is valid and available for shipping');
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking item status:', err);
        toast.error(err.message || 'Failed to check item status');
        router.push('/staff');
      }
    }

    checkItemStatus();
  }, [params.token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate selected locations
      if (!selectedCountry || !selectedState || !selectedCity) {
        throw new Error('Please select country, state, and city');
      }

      const response = await fetch(`/api/shipping/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shippingDetails,
          country: selectedCountry.name,
          state: selectedState.name,
          city: selectedCity.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process shipping');
      }

      toast.success('Shipping request processed successfully!');
      router.push('/shipping/confirmation');
    } catch (err: Error) {
      toast.error(err.message || 'Failed to process shipping');
      setError(err.message || 'Failed to process shipping');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking status
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2632] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-black/20 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-[#4A90E2]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-400">Checking item status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C2632] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-black/20 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-white mb-6">
              Shipping Details
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.name}
                    onChange={(e) => setShippingDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-800 bg-black/30 
                      shadow-sm transition duration-150 ease-in-out
                      placeholder:text-gray-500 text-white
                      focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                      hover:border-gray-700 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingDetails.email}
                    onChange={(e) => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-800 bg-black/30 
                      shadow-sm transition duration-150 ease-in-out
                      placeholder:text-gray-500 text-white
                      focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                      hover:border-gray-700 sm:text-sm"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-800 bg-black/30 
                      shadow-sm transition duration-150 ease-in-out
                      placeholder:text-gray-500 text-white
                      focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                      hover:border-gray-700 sm:text-sm"
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>

                {/* Location Comboboxes */}
                <div className="space-y-4">
                  {/* Country Combobox */}
                  <Combobox value={selectedCountry} onChange={setSelectedCountry}>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Country
                      </label>
                      <div className="relative">
                        <Combobox.Input
                          className="w-full rounded-lg border-gray-800 bg-black/30 
                            shadow-sm transition duration-150 ease-in-out
                            placeholder:text-gray-500 text-white
                            focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                            hover:border-gray-700 sm:text-sm"
                          onChange={(event) => setCountryQuery(event.target.value)}
                          displayValue={(country: Location) => country?.name}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <div className="relative">
                        <Combobox.Options 
                          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto 
                            rounded-md bg-black/90 py-1 text-base shadow-lg ring-1 
                            ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                          {filteredCountries.map((country) => (
                            <Combobox.Option
                              key={country.isoCode}
                              value={{ name: country.name, code: country.isoCode }}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active ? 'bg-[#4A90E2] text-white' : 'text-gray-300'
                                }`
                              }
                            >
                              {country.name}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      </div>
                    </div>
                  </Combobox>

                  {/* State Combobox */}
                  {selectedCountry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        State/Province
                      </label>
                      <Combobox value={selectedState} onChange={setSelectedState}>
                        <div className="relative">
                          <Combobox.Input
                            className="w-full rounded-lg border-gray-800 bg-black/30 
                              shadow-sm transition duration-150 ease-in-out
                              placeholder:text-gray-500 text-white
                              focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                              hover:border-gray-700 sm:text-sm"
                            onChange={(event) => setStateQuery(event.target.value)}
                            displayValue={(state: Location) => state?.name}
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </Combobox.Button>
                        </div>
                        <div className="relative">
                          <Combobox.Options 
                            className="absolute z-10 mt-1 w-full max-h-60 overflow-auto 
                              rounded-md bg-black/90 py-1 text-base shadow-lg ring-1 
                              ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                          >
                            {filteredStates.map((state) => (
                              <Combobox.Option
                                key={state.isoCode}
                                value={{ name: state.name, code: state.isoCode }}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                    active ? 'bg-[#4A90E2] text-white' : 'text-gray-300'
                                  }`
                                }
                              >
                                {state.name}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        </div>
                      </Combobox>
                    </div>
                  )}

                  {/* City Combobox */}
                  {selectedState && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        City
                      </label>
                      <Combobox value={selectedCity} onChange={setSelectedCity}>
                        <div className="relative">
                          <Combobox.Input
                            className="w-full rounded-lg border-gray-800 bg-black/30 
                              shadow-sm transition duration-150 ease-in-out
                              placeholder:text-gray-500 text-white
                              focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                              hover:border-gray-700 sm:text-sm"
                            onChange={(event) => setCityQuery(event.target.value)}
                            displayValue={(city: Location) => city?.name}
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </Combobox.Button>
                        </div>
                        <div className="relative">
                          <Combobox.Options 
                            className="absolute z-10 mt-1 w-full max-h-60 overflow-auto 
                              rounded-md bg-black/90 py-1 text-base shadow-lg ring-1 
                              ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                          >
                            {filteredCities.map((city) => (
                              <Combobox.Option
                                key={city.name}
                                value={{ name: city.name, code: city.name }}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                    active ? 'bg-[#4A90E2] text-white' : 'text-gray-300'
                                  }`
                                }
                              >
                                {city.name}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        </div>
                      </Combobox>
                    </div>
                  )}
                </div>

                {/* Postal Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.postalCode}
                    onChange={(e) => setShippingDetails(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-800 bg-black/30 
                      shadow-sm transition duration-150 ease-in-out
                      placeholder:text-gray-500 text-white
                      focus:border-[#4A90E2] focus:ring-[#4A90E2] 
                      hover:border-gray-700 sm:text-sm"
                    placeholder="12345"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/10 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#4A90E2] hover:bg-[#4A90E2]/90 text-white px-8 font-medium"
                >
                  {loading ? 'Processing...' : 'Ship Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 