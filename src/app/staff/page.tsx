"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useDebounce } from "@/hooks/useDebounce"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, QrCode, Plus, Home, AlignLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {Select} from "@/components/ui/select"

interface LostItem {
  _id: string
  itemName: string
  itemDescription: string
  itemImageUrl?: string
  status: string
  collectionCode: string
  flight: {
    flightNumber: string
  }
  seat: {
    seatNumber: string
  }
  createdAt: string
  claimToken: string
}

export default function StaffDashboard() {
  const [items, setItems] = useState<LostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("unclaimed")
  const [flightFilter, setFlightFilter] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)
  const router = useRouter()

  useEffect(() => {
    fetchItems()
  }, [searchTerm, statusFilter, flightFilter]) // Updated dependency array

  const fetchItems = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (statusFilter) queryParams.append("status", statusFilter)
      if (flightFilter) queryParams.append("flightNumber", flightFilter)
      if (debouncedSearch) queryParams.append("search", debouncedSearch)

      const response = await fetch(`/api/lost-items?${queryParams.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setItems(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const searchMatch =
      !debouncedSearch ||
      item.itemName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.itemDescription?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.flight.flightNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.seat.seatNumber.toLowerCase().includes(debouncedSearch.toLowerCase())

    return searchMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2632] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#4A90E2] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1C2632] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Lost Items Dashboard</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 bg-black/20 p-2 rounded-lg">
            <Button asChild variant="outline" className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/10 py-2 px-1.5 flex items-center">
              <Link href="/staffTeam" className="flex items-center text-lg font-normal">
                <Home className="h-6 w-6 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild className="bg-[#4A90E2] hover:bg-[#4A90E2]/90 py-2 px-1.5 flex items-center">
              <Link href="/staff/submit" className="flex items-center text-lg font-bold">
                <Plus className="h-5 w-5 mr-2" />
                Submit Item
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/10 py-2 px-1.5 flex items-center">
              <Link href="/scan" className="flex items-center text-lg font-normal">
                <QrCode className="h-5 w-5 mr-2" />
                Scan QR Code
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-4 mb-6 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="block w-full border border-gray-300 bg-gray-800 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Status</label>
              <Select
                options={[
                  { label: 'All', value: '' },
                  { label: 'Unclaimed', value: 'unclaimed'},
                  { label: 'Claimed', value: 'claimed' },
                  { label: 'Shipped', value: 'shipped' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Select Status"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Flight Number</label>
              <input
                type="text"
                value={flightFilter}
                onChange={(e) => setFlightFilter(e.target.value)}
                placeholder="Enter flight number"
                className="block w-full border border-gray-300 bg-gray-800 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-md p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-black/20 border border-gray-800 rounded-lg overflow-hidden hover:bg-black/30 transition-colors"
            >
              {item.itemImageUrl && (
                <div className="aspect-video relative">
                  <Image
                    src={item.itemImageUrl || "/placeholder.svg"}
                    alt={item.itemName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-white">{item.itemName}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="font-medium text-gray-300">Flight:</span> {item.flight.flightNumber}
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">Seat:</span> {item.seat.seatNumber}
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">Collection Code:</span>{" "}
                    <span 
                      className="font-mono bg-black/30 px-2 py-1 rounded relative group cursor-pointer 
                        inline-flex items-center"
                    >
                      <span className="relative">
                        <span className="absolute inset-0 bg-black/30 z-10 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                          ••••••
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#4A90E2]">
                          {item.collectionCode}
                        </span>
                      </span>
                      <svg 
                        className="w-4 h-4 ml-1 text-gray-400 opacity-100 group-hover:opacity-0 transition-opacity duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                        />
                      </svg>
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-left">
                  <Button
                    variant="link"
                    asChild
                    className="text-[#4A90E2] hover:text-[#4A90E2]/90 p-0 h-auto font-medium"
                  >
                    <Link href={`/verify/${item.claimToken}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => window.open(`/receipt/${item._id}`, "_blank")}
                    className="text-gray-400 hover:text-white hover:bg-black/20"
                  >
                    Generate Receipt
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
