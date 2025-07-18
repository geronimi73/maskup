import "./globals.css"

import { Analytics } from "@vercel/analytics/next"
import { ToastProvider } from "./components/ToastProvider"

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
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
