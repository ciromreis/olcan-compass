import type { Metadata } from "next";
import { Merriweather_Sans, Source_Sans_3 } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import StyledJsxRegistry from "@/lib/styled-jsx-registry";
import "./globals.css";

const merriweatherSans = Merriweather_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Olcan Compass — Mobilidade Global Inteligente",
    template: "%s | Olcan Compass",
  },
  description:
    "Plataforma de inteligência para mobilidade internacional. Planeje, execute e conquiste sua jornada global com confiança.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://compass.olcan.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Olcan Compass",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${merriweatherSans.variable} ${sourceSans.variable}`}
    >
      <body className="font-body antialiased bg-surface-bg text-text-primary">
        <StyledJsxRegistry>
          <QueryProvider>{children}</QueryProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
