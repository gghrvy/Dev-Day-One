import type { Metadata } from "next"
import { Overpass, Overpass_Mono } from "next/font/google"
import "./globals.css"

const overpass = Overpass({ subsets: ["latin"], variable: "--font-overpass" })
const overpassMono = Overpass_Mono({ subsets: ["latin"], variable: "--font-overpass-mono" })

export const metadata: Metadata = {
  title: "Dev Day One — your first day on a codebase, already oriented",
  description:
    "Ask a codebase questions and get answers that cite the files. A working tool, shown here with sample data.",
  openGraph: {
    title: "Dev Day One",
    description: "Ask a codebase questions and get answers that cite the files. A working tool, shown with sample data.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${overpass.variable} ${overpassMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
