"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"

export default function HelpPopup({ title, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 items-center hover:text-gray-600 transition-colors"
        title="Show help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Popup */}
          <div className="absolute right-0 top-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900">{title}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-2">{children}</div>
          </div>
        </>
      )}
    </div>
  )
}
