"use client"

import { useState } from "react";
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

export default function Gallery() {
  const router = useRouter(); // Initialize router

  // Photo array; will be updated dynamically in production
  const [photos, setPhotos] = useState<Photo[]>([
    { id: "1", url: "/placeholder.svg", caption: "Black Android phone" },
    { id: "2", url: "/placeholder.svg", caption: "LLM caption" },
    { id: "3", url: "/placeholder.svg", caption: "Item description" },
    { id: "4", url: "/placeholder.svg", caption: "Another description" },
    { id: "5", url: "/placeholder.svg", caption: "Sample item" },
    { id: "6", url: "/placeholder.svg", caption: "Example caption" },
  ])
 /*I need this to update with each photo taken on the previous page*/
  // State for editing captions
  const [editingCaption, setEditingCaption] = useState<string | null>(null)

  // Function to update photo captions
  const handleCaptionEdit = (id: string, newCaption: string) => {
    setPhotos(photos.map((photo) => (photo.id === id ? { ...photo, caption: newCaption } : photo)))
  }

  // Submit photos and navigate to the main page
  const handleSubmitPhotos = () => {
    console.log("Photos submitted:", photos)
    router.push("/mainpage"); // Navigate to the main page
  }
  /* LOOK HERE TO CHANGE THE SUBMIT PHOTO NAVIGATION */

  return (
    <div className="min-h-screen bg-[#1C2632] text-white">
      <div className="p-4">
        <header className="flex items-center gap-4 mb-6">
          <Link href="/mainpage" className="text-[#4A90E2]"> {/* LOOK HERE: LEFT ARROW Link to the previous page */}
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">{photos.length} lost items</h1>
        </header>

        {/* Scrollable Gallery */}
        <ScrollArea className="h-[600px] rounded-md border border-gray-800">
          <div className="grid grid-cols-2 gap-4 p-4">
            {photos.map((photo) => (
              <div key={photo.id} className="space-y-2">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-black/20">
                  <Image src={photo.url || "/placeholder.svg"} alt={photo.caption} fill className="object-cover" />
                </div>
                {editingCaption === photo.id ? (
                  <Input
                    value={photo.caption}
                    onChange={(e) => handleCaptionEdit(photo.id, e.target.value)}
                    onBlur={() => setEditingCaption(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingCaption(null)}
                    className="bg-black/20 border-gray-700"
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-sm text-gray-300 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCaption(photo.id)
                    }}
                  >
                    {photo.caption}
                  </p>
                )}
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
