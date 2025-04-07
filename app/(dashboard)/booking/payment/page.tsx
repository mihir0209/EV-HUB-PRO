"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, Landmark, Wallet } from "lucide-react"
import UPIPayment from "@/components/upi-payment"

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const vehicleId = searchParams.get("vehicleId")
  const providerId = searchParams.get("providerId")
  const slotId = searchParams.get("slotId")

  // Mock booking details
  const bookingDetails = {
    vehicle: "Tata Nexon EV Max",
    provider: "ROHAN JOSHI",
    location: "TATA Station, Akurdi",
    date: "Today",
    time: "2:00 pm - 3:00 pm",
    price: "₹200",
    tax: "₹36",
    total: "₹236",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "upi") {
      // UPI payment is handled by the UPIPayment component
      return
    }

    setLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      // Redirect to success page
      router.push(`/booking/success?bookingId=${Date.now()}`)
    }, 2000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div
                  className={`flex items-center space-x-2 rounded-lg border p-4 ${paymentMethod === "upi" ? "border-primary bg-primary/5" : ""}`}
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5" />
                    UPI Payment
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-2 rounded-lg border p-4 ${paymentMethod === "card" ? "border-primary bg-primary/5" : ""}`}
                >
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    Credit/Debit Card
                  </Label>
                </div>

                <div
                  className={`flex items-center space-x-2 rounded-lg border p-4 ${paymentMethod === "netbanking" ? "border-primary bg-primary/5" : ""}`}
                >
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Landmark className="h-5 w-5" />
                    Net Banking
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "upi" && (
                <div className="space-y-4 mt-6">
                  <UPIPayment
                    amount={Number.parseFloat(bookingDetails.total.replace("₹", ""))}
                    onPaymentComplete={(paymentId) => {
                      // Simulate payment processing
                      setLoading(true)
                      setTimeout(() => {
                        setLoading(false)
                        // Redirect to success page
                        router.push(`/booking/success?bookingId=${Date.now()}`)
                      }, 1000)
                    }}
                    onCancel={() => {
                      // Handle cancellation
                    }}
                  />
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name on Card</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Select Bank</Label>
                    <select
                      id="bank"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>Review your booking details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium">{bookingDetails.vehicle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{bookingDetails.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{bookingDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{bookingDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{bookingDetails.time}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{bookingDetails.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span className="font-medium">{bookingDetails.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{bookingDetails.total}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="bg-primary/10 p-4 rounded-lg w-full">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

