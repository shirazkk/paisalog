import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toast } from "@/components/Toast";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export const metadata: Metadata = {
  title: "PaisaLog",
  description: "Family money tracker for husband and wife",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PaisaLog",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a56db",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <div className="app-container">
          {children}
          <Toast />
          <PWAInstallBanner />
        </div>
      </body>
    </html>
  );
}
