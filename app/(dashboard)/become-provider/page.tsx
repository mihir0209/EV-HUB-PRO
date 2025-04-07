"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Zap, MapPin, Clock, DollarSign } from "lucide-react"

export default function BecomeProviderPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription>Thank you for your interest in becoming an EV-Hub provider</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p>
              We have received your application and our team will review it shortly. You will be notified via email once
              your application is approved.
            </p>
            <p className="text-sm text-muted-foreground">This process usually takes 1-2 business days.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setSubmitted(false)}>Back to Form</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Become a Provider</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Provider Application</CardTitle>
              <CardDescription>Fill out the form below to become an EV-Hub charging station provider</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="station-name">Charging Station Name</Label>
                  <Input id="station-name" placeholder="e.g. Green Energy Charging Station" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact Person</Label>
                    <Input id="contact-name" placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input id="contact-phone" placeholder="Your phone number" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea id="address" placeholder="Complete address of your charging station" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="charger-type">Charger Type</Label>
                    <select
                      id="charger-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select charger type</option>
                      <option value="ac">AC Charger</option>
                      <option value="dc-fast">DC Fast Charger</option>
                      <option value="supercharger">Supercharger</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Hour (₹)</Label>
                    <Input id="price" type="number" placeholder="e.g. 200" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your charging station, facilities available, etc." />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the terms and conditions of EV-Hub
                  </Label>
                </div>

                <Button type="submit">Submit Application</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>Why become an EV-Hub provider?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Additional Income</p>
                  <p className="text-sm text-muted-foreground">
                    Earn money by providing charging services to EV owners
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Increased Visibility</p>
                  <p className="text-sm text-muted-foreground">Get listed on our platform and attract more customers</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Flexible Hours</p>
                  <p className="text-sm text-muted-foreground">Set your own availability and operating hours</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Support Green Energy</p>
                  <p className="text-sm text-muted-foreground">Contribute to the growth of electric mobility</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>What you need to become a provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Valid ID proof and address proof</p>
              <p className="text-sm">• Ownership or permission to use the location</p>
              <p className="text-sm">• EV charging equipment that meets safety standards</p>
              <p className="text-sm">• Reliable internet connection for the booking system</p>
              <p className="text-sm">• Bank account for receiving payments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

