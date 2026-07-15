import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Barlow } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

const siteUrl = "https://kupaacademy-ten.vercel.app";
const siteDescription =
  "Kupa Coffee'nin dijital operasyon ve eğitim platformu. Eğitimler, reçeteler, günlük şube denetimleri ve performans yönetimi tek merkezde.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kupa Academy — Dijital Operasyon & Eğitim Platformu",
    template: "%s | Kupa Academy",
  },
  description: siteDescription,
  applicationName: "Kupa Academy",
  keywords: ["Kupa Coffee", "Kupa Academy", "barista eğitimi", "şube denetimi", "operasyon yönetimi", "kahve"],
  authors: [{ name: "Kupa Coffee Co." }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Kupa Academy",
    title: "Kupa Academy — Dijital Operasyon & Eğitim Platformu",
    description: siteDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kupa Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kupa Academy — Dijital Operasyon & Eğitim Platformu",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kupa Academy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1729" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
