import type React from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import type { Metadata } from "next"
import ProtectedRoute from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Dashboard | EV-Hub",
  description: "Book your electric vehicle charging slot",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="main-content">
          <Header />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}

