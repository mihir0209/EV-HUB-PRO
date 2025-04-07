"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Car, Clock, Zap, LogOut } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useToast } from "./ui/use-toast"

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="sidebar">
      <div className="flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-white text-2xl font-bold">
            <Zap className="h-6 w-6" /> EV-HUB
          </Link>
        </div>
        <div className="mt-10">
          <Link href="/profile" className={`sidebar-link ${pathname === "/profile" ? "active" : ""}`}>
            <User className="h-6 w-6" /> Profile
          </Link>
          <Link href="/my-cars" className={`sidebar-link ${pathname === "/my-cars" ? "active" : ""}`}>
            <Car className="h-6 w-6" /> My Cars
          </Link>
          <Link href="/history" className={`sidebar-link ${pathname === "/history" ? "active" : ""}`}>
            <Clock className="h-6 w-6" /> History
          </Link>
          <Link href="/become-provider" className={`sidebar-link ${pathname === "/become-provider" ? "active" : ""}`}>
            <Zap className="h-6 w-6" /> Become a Provider
          </Link>
        </div>
      </div>
      <div className="p-6">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full flex items-center gap-2 text-white text-xl py-3 px-6 hover:bg-primary/80"
        >
          <LogOut className="h-6 w-6" /> Logout
        </button>
        <p className="text-white mt-4">EV-HUB ©</p>
      </div>
    </div>
  )
}

