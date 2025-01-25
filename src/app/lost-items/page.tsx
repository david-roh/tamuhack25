import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LostItems() {
  return (
    <div className="min-h-screen bg-[#1C2632] text-white p-4">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/mainpage" className="text-[#4A90E2]">
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
          </div>

          <button
            type="submit"
            className="w-full bg-[#4A90E2] text-white py-3 px-4 rounded font-medium hover:bg-[#357ABD] transition-colors"
          >
{/* Need to link to something else? maybe like a confirmation and then show in the DB*/}
            Submit Report
          </button>
        </form>
      </div>
    </div>
  )
}

