import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moggle AI — Premium Facial Analysis",
  description:
    "AI-powered facial structure analysis with personalized grooming, style, and improvement guidance.",
  keywords: ["facial analysis", "face shape", "looksmaxing", "grooming", "AI"],
  authors: [{ name: "Moggle AI" }],
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen antialiased`}
      >
        <AuthProvider>
          <AnalyticsProvider>
            <ErrorBoundary>
              {children}
              <Toaster />
            </ErrorBoundary>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
