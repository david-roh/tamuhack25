import { Bell, ChevronRight, MessageSquare, Clock, Search, Plane } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1C2632] text-white">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
        </div>
        <div className="flex gap-4">
          <button className="text-white">
            <MessageSquare className="h-6 w-6" />
          </button>
          <button className="text-white relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-yellow-400 rounded-full" />
          </button>
        </div>
      </header>
{/* American airlines logo */}
      <div className="p-4">
        <div className="bg-black/40 rounded-lg p-4 mb-6">
        <Image
            src="/American_Airlines-Logo.wine.png" // Update with the actual path to your PNG
            alt="American Airlines" // Add an appropriate alt text
            width={200} // Adjust the width of the image as needed
            height={20} // Adjust the height of the image as needed
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link href="/flight-status" className="flex flex-col items-center gap-2">
            <div className="bg-[#4A90E2] p-4 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-[#4A90E2] text-sm">Flight status</span>
          </Link>
          <Link href="/find-trip" className="flex flex-col items-center gap-2">
            <div className="bg-[#4A90E2] p-4 rounded-full">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-[#4A90E2] text-sm">Find trip</span>
          </Link>
          <Link href="/book-flights" className="flex flex-col items-center gap-2">
            <div className="bg-[#4A90E2] p-4 rounded-full">
              <Plane className="h-6 w-6" />
            </div>
            <span className="text-[#4A90E2] text-sm">Book flights</span>
          </Link>
        </div>

        <nav className="space-y-4">
          {[
            { title: "Track your bags", href: "/track-bags" },
            { title: "I lost something", href: "/lost-items" },
            { title: "Wi-Fi and free entertainment", href: "/wifi" },
            { title: "Airport maps", href: "/maps" },
            { title: "Admirals Club® locations", href: "/admirals-club" },
            { title: "Log in", href: "/login" },
            { title: "Join AAdvantage®", href: "/join" },
            { title: "AAdvantage® program", href: "/advantage" },
            { title: "General information", href: "/info" },
            { title: "Privacy policy", href: "/privacy" },
            { title: "Contact American", href: "/contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-4 bg-black/20 rounded-lg text-[#4A90E2] hover:bg-black/30 transition-colors"
            >
              <span>{item.title}</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          ))}
        </nav>
        <Link
          href="/page2"
          className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-white shadow transition-colors hover:bg-black/90"
        >
          Deploy now
        </Link>
      </div>
    </div>
  )
}

