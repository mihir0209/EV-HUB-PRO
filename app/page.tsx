"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-primary text-4xl font-bold mb-4">
        <Zap className="h-12 w-12" /> EV-HUB
      </div>
      <div className="animate-pulse text-primary text-xl">Loading...</div>
    </div>
  )
}

