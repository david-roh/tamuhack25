"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";


export default function LostItems() {

  const router = useRouter(); // Initialize router

  const handleSubmitForm = () => {
    router.push("/customermainpage"); // Navigate to the main page //CHANGE WHERE IT SUBMITS TO
  }
  return (
    <div className="min-h-screen bg-[#1C2632] text-white p-4">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/customermainpage" className="text-[#4A90E2]">
          {" "}
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Lost Items</h1>
      </header>
{/* back arrow mech */}

      <div className="space-y-6">
        <p className="text-gray-300">
          If you've lost an item during your travel with American Airlines, please fill out the form below and we'll do
          our best to help you locate it.
        </p>
{/* Date input */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm text-gray-300">
              Date of Loss
            </label>
            <input type="date" id="date" className="w-full p-2 rounded bg-black/20 border border-gray-700 text-white" />
          </div>
          {/* Put the id=date into the DB */}
{/* Flight number */}
          <div className="space-y-2">
            <label htmlFor="flight" className="block text-sm text-gray-300">
              Flight Number
            </label>
            <input
              type="text"
              id="flight"
              className="w-full p-2 rounded bg-black/20 border border-gray-700 text-white"
              placeholder="Enter flight number"
            />
            {/* Put id=flight into the DB */}
          </div>
{/* Added description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm text-gray-300">
              Item Description
            </label>
            <textarea
              id="description"
              className="w-full p-2 rounded bg-black/20 border border-gray-700 text-white h-32"
              placeholder="Please describe the lost item"
            />
            {/* Put id=description in DB */}
          </div>

        {/* Submit Photos Button */}
        <Button onClick={handleSubmitForm} className="w-full mt-4 bg-[#4A90E2] hover:bg-[#4A90E2]/90">
          Submit Form
        </Button>
          
          {/* Need to link to something else? maybe like a confirmation and then show in the DB*/}
        </form>
      </div>
    </div>
  )
}

