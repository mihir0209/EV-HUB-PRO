"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

type ToastVariant = "default" | "destructive" | "success"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-md shadow-lg max-w-md transform transition-all duration-300 ease-in-out ${
                toast.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground"
                  : toast.variant === "success"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{toast.title}</h3>
                  {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
                </div>
                <button onClick={() => dismiss(toast.id)} className="ml-4 text-sm hover:opacity-70">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

