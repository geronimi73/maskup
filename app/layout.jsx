import "./globals.css"

import { Toaster } from "@/components/ui/toaster"
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
        <main>{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
