"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

// Mock data for the provider
const providerData = {
  id: 1,
  name: "Mihir Patil",
  phone: "+911234567890",
  address: "PCCoE, Akurdi, Pune, Maharashtra 411044, India.",
  rating: 4,
  price: "200/Hr",
  avatar: "/placeholder.svg?height=60&width=60",
}

// Mock data for time slots
const timeSlots = [
  { id: 1, time: "9:00 am - 10:00 am", available: true },
  { id: 2, time: "10:00 am - 11:00 am", available: true },
  { id: 3, time: "11:00 am - 12:00 pm", available: true },
  { id: 4, time: "12:00 am - 1:00 pm", available: false },
  { id: 5, time: "1:00 am - 2:00 pm", available: true },
  { id: 6, time: "2:00 pm - 3:00 pm", available: true },
]

export default function TimeSlotSelectionPage() {
  const [selectedDate, setSelectedDate] = useState("TODAY")
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicleId")
  const providerId = searchParams.get("providerId")

  const handleProceed = () => {
    if (selectedSlot) {
      router.push(`/booking/payment?vehicleId=${vehicleId}&providerId=${providerId}&slotId=${selectedSlot}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={providerData.avatar || "/placeholder.svg"}
            alt={providerData.name}
            width={60}
            height={60}
            className="rounded-full bg-blue-500"
          />
          <div>
            <h2 className="text-xl font-bold">{providerData.name}</h2>
            <p className="text-muted-foreground">{providerData.phone}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">ADD: {providerData.address}</p>

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500">
                {i < providerData.rating ? "★" : "☆"}
              </span>
            ))}
          </div>

          <p className="text-xl font-semibold">Price : {providerData.price}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center">BOOKING SLOT'S</h3>

          <div className="relative">
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span>FOR: {selectedDate}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                className={`time-slot ${!slot.available ? "disabled" : ""} ${selectedSlot === slot.id ? "selected" : ""}`}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.id)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button size="lg" onClick={handleProceed} disabled={!selectedSlot} className="px-8 bg-primary">
            PROCEED TO PAYMENT
          </Button>
        </div>
      </div>
    </div>
  )
}

