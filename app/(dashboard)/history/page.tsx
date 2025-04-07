import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Navigation } from "lucide-react"

// Mock data for bookings
const upcomingBookings = [
  {
    id: "B12345",
    vehicle: "Tata Nexon EV Max",
    provider: "ROHAN JOSHI",
    location: "TATA Station, Akurdi",
    date: "Today",
    time: "2:00 pm - 3:00 pm",
    price: "₹236",
  },
]

const pastBookings = [
  {
    id: "B12344",
    vehicle: "MG ZS EV",
    provider: "ROHAN JOSHI",
    location: "TATA Station, Akurdi",
    date: "Yesterday",
    time: "10:00 am - 11:00 am",
    price: "₹236",
    status: "Completed",
  },
  {
    id: "B12343",
    vehicle: "Hyundai Kona Electric",
    provider: "ROHAN JOSHI",
    location: "TATA Station, Akurdi",
    date: "12 Mar 2023",
    time: "1:00 pm - 2:00 pm",
    price: "₹236",
    status: "Completed",
  },
]

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Booking History</h1>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.vehicle}</CardTitle>
                      <CardDescription>Booking ID: {booking.id}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{booking.price}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span>{booking.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span>
                      {booking.date}, {booking.time}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Clock className="mr-2 h-4 w-4" /> Reschedule
                  </Button>
                  <Button size="sm">
                    <Navigation className="mr-2 h-4 w-4" /> Navigate
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming bookings</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.vehicle}</CardTitle>
                      <CardDescription>Booking ID: {booking.id}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{booking.price}</p>
                      <p className="text-xs text-green-500">{booking.status}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span>{booking.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span>
                      {booking.date}, {booking.time}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm">
                    Book Again
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

