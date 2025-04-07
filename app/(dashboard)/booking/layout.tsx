import type React from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Booking | EV-Hub",
  description: "Book your electric vehicle charging slot",
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="main-content">
        <Header showBackButton />
        {children}
      </div>
    </div>
  )
}

