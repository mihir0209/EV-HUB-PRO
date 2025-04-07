import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Zap, Car, Clock, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to EV-Hub</h1>
        <p className="text-xl text-muted-foreground">Book your electric vehicle charging slot</p>
        <div className="flex justify-center mt-6">
          <Link href="/booking/vehicle">
            <Button size="lg" className="text-lg px-8">
              <Zap className="mr-2 h-5 w-5" /> Book Now
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Quick Booking
            </CardTitle>
            <CardDescription>Book a charging slot in just a few steps</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Find the nearest charging station and book a slot for your electric vehicle in minutes.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/booking/vehicle" className="w-full">
              <Button variant="outline" className="w-full">
                Start Booking
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> My Vehicles
            </CardTitle>
            <CardDescription>Manage your electric vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add, edit, or remove your electric vehicles to streamline the booking process.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/my-cars" className="w-full">
              <Button variant="outline" className="w-full">
                View Vehicles
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Booking History
            </CardTitle>
            <CardDescription>View your past and upcoming bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track your booking history and manage your upcoming reservations.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/history" className="w-full">
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card className="bg-card mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile
          </CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Update your personal information, change your password, or manage your account settings.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/profile" className="w-full">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

