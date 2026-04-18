import { DM_Sans, DM_Serif_Display } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "tailwindcss/tailwind.css"
import "../styles/globals.css"
import StorefrontAuraBuddy from "./StorefrontAuraBuddy"

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body className="bg-bone text-ink font-body">
        <main className="relative">{props.children}</main>
        <StorefrontAuraBuddy />
      </body>
    </html>
  )
}
