'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface FormData {
  itemName: string;
  itemDescription: string;
  flightNumber: string;
  seatNumber: string;
  itemImage?: File;
}

export default function SubmitLostItem() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    itemName: '',
    itemDescription: '',
    flightNumber: '',
    seatNumber: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }

      setFormData(prev => ({ ...prev, itemImage: file }));
      
      // Create preview URL using URL.createObjectURL instead of FileReader
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      const response = await fetch('/api/lost-items', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit item');
      }

      toast.success('Item submitted successfully!');
      router.push('/staff');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit item');
      setError(err.message || 'Failed to submit item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Submit Lost Item
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-900">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                required
                placeholder="e.g., Black Laptop"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-900">
                Description
              </label>
              <textarea
                id="itemDescription"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleInputChange}
                rows={3}
                required
                placeholder="Provide details about the item..."
                className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-900">
                Flight Number
              </label>
              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g., BA123"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-900">
                Seat Number
              </label>
              <input
                type="text"
                id="seatNumber"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g., 12A"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-white 
                  shadow-sm transition duration-150 ease-in-out
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-blue-500 
                  hover:border-gray-400 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Item Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
                border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center w-full flex flex-col items-center">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video max-w-md mx-auto">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        className="object-contain rounded-lg"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(imagePreview);
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, itemImage: undefined }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1
                          hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <label
                          htmlFor="itemImage"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 
                            focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="itemImage"
                            name="itemImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center rounded-lg px-4 py-2
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
                    Submitting...
                  </span>
                ) : (
                  'Submit Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 