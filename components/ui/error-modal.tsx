"use client"

import { X } from "lucide-react"
import { Button } from "./button"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export function ErrorModal({ isOpen, onClose, title = "Error", message }: ErrorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-600">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="default">
            Entendido
          </Button>
        </div>
      </div>
    </div>
  )
}