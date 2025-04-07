"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, QrCode, Smartphone } from "lucide-react"

interface UPIPaymentProps {
  amount: number
  onPaymentComplete: (paymentId: string) => void
  onCancel: () => void
}

export default function UPIPayment({ amount, onPaymentComplete, onCancel }: UPIPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<"upi-id" | "upi-qr">("upi-id")
  const [upiId, setUpiId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)

  const handleProceed = () => {
    if (!upiId) return

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setShowVerification(true)
    }, 1500)
  }

  const handleVerify = () => {
    if (!verificationCode) return

    setIsProcessing(true)

    // Simulate verification
    setTimeout(() => {
      setIsProcessing(false)
      // Generate a random payment ID
      const paymentId = `UPI${Date.now()}${Math.floor(Math.random() * 1000)}`
      onPaymentComplete(paymentId)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {!showVerification ? (
        <>
          <div className="space-y-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "upi-id" | "upi-qr")}
              className="space-y-4"
            >
              <div
                className={`flex items-center space-x-2 rounded-lg border p-4 ${
                  paymentMethod === "upi-id" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="upi-id" id="upi-id" />
                <Label htmlFor="upi-id" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Smartphone className="h-5 w-5" />
                  Pay via UPI ID
                </Label>
              </div>

              <div
                className={`flex items-center space-x-2 rounded-lg border p-4 ${
                  paymentMethod === "upi-qr" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="upi-qr" id="upi-qr" />
                <Label htmlFor="upi-qr" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5" />
                  Pay via QR Code
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "upi-id" && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="upi-id-input">Enter UPI ID</Label>
                  <Input
                    id="upi-id-input"
                    placeholder="username@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Example: yourname@okicici, yourname@okaxis, etc.</p>
                </div>
              </div>
            )}

            {paymentMethod === "upi-qr" && (
              <div className="mt-4 flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  {/* Simulated QR code */}
                  <div className="w-48 h-48 bg-[url('/placeholder.svg?height=200&width=200')] bg-center bg-no-repeat bg-contain"></div>
                </div>
                <p className="text-sm text-center">Scan this QR code with any UPI app to pay ₹{amount.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleProceed} disabled={isProcessing || (paymentMethod === "upi-id" && !upiId)}>
              {isProcessing ? "Processing..." : "Proceed to Pay"}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Payment Request Sent</h3>
                <p className="text-sm text-muted-foreground">
                  Check your UPI app for a payment request of ₹{amount.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-code">Enter Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="Enter the 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the verification code shown in your UPI app after completing the payment
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={isProcessing || verificationCode.length < 6}>
              {isProcessing ? "Verifying..." : "Verify Payment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

