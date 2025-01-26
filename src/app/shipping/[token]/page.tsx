'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Country, State, City } from 'country-state-city';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Checking item status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Shipping Details
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.name}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                    shadow-sm transition duration-150 ease-in-out
                    placeholder:text-gray-400 text-gray-900
                    focus:border-blue-500 focus:ring-blue-500 
                    hover:border-gray-400 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={shippingDetails.email}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                    shadow-sm transition duration-150 ease-in-out
                    placeholder:text-gray-400 text-gray-900
                    focus:border-blue-500 focus:ring-blue-500 
                    hover:border-gray-400 sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>

              {/* Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                    shadow-sm transition duration-150 ease-in-out
                    placeholder:text-gray-400 text-gray-900
                    focus:border-blue-500 focus:ring-blue-500 
                    hover:border-gray-400 sm:text-sm"
                  placeholder="123 Main St, Apt 4B"
                />
              </div>

              {/* Country Combobox */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Country
                </label>
                <Combobox value={selectedCountry} onChange={setSelectedCountry}>
                  <div className="relative mt-1">
                    <Combobox.Input
                      className="w-full rounded-lg border-gray-300 bg-white 
                        shadow-sm transition duration-150 ease-in-out
                        placeholder:text-gray-400 text-gray-900
                        focus:border-blue-500 focus:ring-blue-500 
                        hover:border-gray-400 sm:text-sm"
                      onChange={(event) => setCountryQuery(event.target.value)}
                      displayValue={(country: Location) => country?.name}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto 
                      rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black 
                      ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredCountries.map((country) => (
                        <Combobox.Option
                          key={country.isoCode}
                          value={{ name: country.name, code: country.isoCode }}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-600 text-white' : 'text-gray-900'
                            }`
                          }
                        >
                          {country.name}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              {/* State Combobox */}
              {selectedCountry && (
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    State/Province
                  </label>
                  <Combobox value={selectedState} onChange={setSelectedState}>
                    <div className="relative mt-1">
                      <Combobox.Input
                        className="w-full rounded-lg border-gray-300 bg-white 
                          shadow-sm transition duration-150 ease-in-out
                          placeholder:text-gray-400 text-gray-900
                          focus:border-blue-500 focus:ring-blue-500 
                          hover:border-gray-400 sm:text-sm"
                        onChange={(event) => setStateQuery(event.target.value)}
                        displayValue={(state: Location) => state?.name}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto 
                        rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black 
                        ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredStates.map((state) => (
                          <Combobox.Option
                            key={state.isoCode}
                            value={{ name: state.name, code: state.isoCode }}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
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
                  <label className="block text-sm font-medium text-gray-900">
                    City
                  </label>
                  <Combobox value={selectedCity} onChange={setSelectedCity}>
                    <div className="relative mt-1">
                      <Combobox.Input
                        className="w-full rounded-lg border-gray-300 bg-white 
                          shadow-sm transition duration-150 ease-in-out
                          placeholder:text-gray-400 text-gray-900
                          focus:border-blue-500 focus:ring-blue-500 
                          hover:border-gray-400 sm:text-sm"
                        onChange={(event) => setCityQuery(event.target.value)}
                        displayValue={(city: Location) => city?.name}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto 
                        rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black 
                        ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredCities.map((city) => (
                          <Combobox.Option
                            key={city.name}
                            value={{ name: city.name, code: city.name }}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
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

              {/* Postal Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Postal Code
                </label>
                <input
                  type="text"
                  required
                  value={shippingDetails.postalCode}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                    shadow-sm transition duration-150 ease-in-out
                    placeholder:text-gray-400 text-gray-900
                    focus:border-blue-500 focus:ring-blue-500 
                    hover:border-gray-400 sm:text-sm"
                  placeholder="12345"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
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

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-lg px-4 py-2
                  text-sm font-semibold shadow-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Process Shipping ($9.99)'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 