"use client"

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useRouter } from "next/navigation";

interface Photo {
  id: string;
  url: string;
  caption: string;
}

interface LostItem {
  _id: string;
  itemName: string;
  itemDescription: string;
  itemImageUrl?: string;
  status: string;
  collectionCode: string;
  flight: {
    flightNumber: string;
    originCode: string;
    destinationCode: string;
  };
  seat: {
    seatNumber: string;
    customerEmail?: string;
  };
}

export default function Gallery() {
  const router = useRouter(); // Initialize route
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  // reference using http://localhost:3000/gallery?flightNumber=1234

  useEffect(() => {
      const fetchItems = async () => {
          const params = new URLSearchParams(window.location.search); 
          const fNum = params.get("flightNumber");
          // console.log("Params flightNumber: ", fNum);
          const res = await fetch(`/api/lost-items-flightNumber/${fNum}`);
  
          if (!res.ok) {
            throw new Error('Failed to fetch item');
          }
  
          const data = await res.json();
          console.log(data)
          setItems(data);
          setLoading(false);
      };
  
      fetchItems();
    }, []);

  // Photo array; will be updated dynamically in production
  // const [photos, setPhotos] = useState<Photo[]>([
  //   { id: "1", url: "/placeholder.svg", caption: "Black Android phone" },
  //   { id: "2", url: "/placeholder.svg", caption: "LLM caption" },
  //   { id: "3", url: "/placeholder.svg", caption: "Item description" },
  //   { id: "4", url: "/placeholder.svg", caption: "Another description" },
  //   { id: "5", url: "/placeholder.svg", caption: "Sample item" },
  //   { id: "6", url: "/placeholder.svg", caption: "Example caption" },
  // ])
 /*I need this to update with each photo taken on the previous page*/
  // State for editing captions
  const [editingCaption, setEditingCaption] = useState<string | null>(null)

  // Function to update photo captions
  const handleCaptionEdit = (id: string, newCaption: string) => {
    // console.log(newCaption);
    setItems((prevItems) => 
      prevItems.map((item) => 
        item._id === id ? { ...item, itemDescription: newCaption } : item
      )
    );
  }

  // Submit photos and navigate to the main page
  const handleSubmitPhotos = () => {
    // console.log("Photos submitted:", items)

    const updateItem = async (item: LostItem) => {
      // console.log(item);
      const response = await fetch(`/api/lost-items/${item._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
    }

    // Submit the new photo descriptions to the database
    items.forEach((item) => {
      // Update description respectively
      updateItem(item);
    })

    router.push("/customermainpage"); // Navigate to the main page
  }
  /* LOOK HERE TO CHANGE THE SUBMIT PHOTO NAVIGATION */

  return (
    <div className="min-h-screen bg-[#1C2632] text-white">
      <div className="p-4">
        <header className="flex items-center gap-4 mb-6">
          <Link href="customermainpage" className="text-[#4A90E2]"> {/* LOOK HERE: LEFT ARROW Link to the previous page */}
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">{items.length} lost items</h1>
        </header>

        {loading && <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        </div>}

        {/* Scrollable Gallery */}
        <ScrollArea className="h-[600px] rounded-md border border-gray-800">
          <div className="grid grid-cols-2 gap-4 p-4">
            {items.map((item) => (
              <div key={item._id} className="space-y-2">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-black/20">
                  <Image src={item.itemImageUrl || "/placeholder.svg"} alt={item.itemDescription} fill className="object-cover" />
                </div>
                {/* For when user is editing */}
                <textarea
                  placeholder="Enter Description"
                  value={item.itemDescription && item.itemDescription}
                  onChange={(e) => handleCaptionEdit(item._id, e.target.value)}
                  rows={5} // Adjust the height with the rows attribute
                  className="w-full p-3 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Submit Photos Button */}
        <Button onClick={handleSubmitPhotos} className="w-full mt-4 bg-[#4A90E2] hover:bg-[#4A90E2]/90">
          Submit Photos
        </Button>
      </div>
    </div>
  )
}