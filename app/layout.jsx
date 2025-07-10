import "./globals.css"

import { Toaster } from "@/components/ui/toaster"
import Image from 'next/image';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "MaskUp - Image Annotation Tool",
  description: "Create masked image datasets for machine learning",
  icons: {
    // icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div>
                  <Image
                    src="/logo.png" // Path to the image in the public folder
                    // alt="Description of the image" // Alt text for accessibility
                    width={50} // Desired width in pixels
                    height={50} // Desired height in pixels
                  />                
                </div>
{/*                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>*/}
                <h1 className="text-2xl font-bold text-gray-900">MaskUp</h1>
              </div>
              <p className="text-sm text-gray-600">Image Dataset Annotation Tool</p>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
