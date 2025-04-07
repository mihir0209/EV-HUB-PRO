"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Car, Battery, Zap } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

// Mock data for vehicles
const vehicles = [
  {
    id: 1,
    name: "Tata Nexon EV Max",
    model: "2022",
    batteryCapacity: "40.5 kWh",
    range: "437 km",
    chargeTime: "15 Hours",
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 2,
    name: "MG ZS EV",
    model: "2021",
    batteryCapacity: "44.5 kWh",
    range: "419 km",
    chargeTime: "8 Hours",
    image: "/placeholder.svg?height=100&width=200",
  },
]

export default function MyCarsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Vehicles</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>Enter your electric vehicle details</DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vehicle Name</Label>
                <Input id="name" placeholder="e.g. Tata Nexon EV Max" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model Year</Label>
                  <Input id="model" placeholder="e.g. 2022" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battery">Battery Capacity (kWh)</Label>
                  <Input id="battery" placeholder="e.g. 40.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="range">Range (km)</Label>
                  <Input id="range" placeholder="e.g. 437" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="charge">Charge Time (Hours)</Label>
                  <Input id="charge" placeholder="e.g. 15" />
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Add Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader className="pb-2">
              <CardTitle>{vehicle.name}</CardTitle>
              <CardDescription>Model: {vehicle.model}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={vehicle.image || "/placeholder.svg"}
                  alt={vehicle.name}
                  width={200}
                  height={120}
                  className="rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Battery className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Battery</p>
                    <p className="font-medium">{vehicle.batteryCapacity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Range</p>
                    <p className="font-medium">{vehicle.range}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Charge Time</p>
                    <p className="font-medium">{vehicle.chargeTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

