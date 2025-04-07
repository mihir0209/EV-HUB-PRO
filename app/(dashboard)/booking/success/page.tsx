"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Booking Successful!</CardTitle>
          <CardDescription>Your booking has been confirmed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-center text-sm">
              Booking ID: <span className="font-bold">{bookingId}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-center">
              Thank you for booking with EV-Hub. Your booking details have been sent to your email.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              You can view your booking details in the History section.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/history" className="w-full">
            <Button className="w-full">View Booking</Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

