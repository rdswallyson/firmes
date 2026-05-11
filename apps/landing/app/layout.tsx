import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { WatermarkDove } from "./components/WatermarkDove";
import { ServiceWorkerRegister } from "./components/ServiceWorkerRegister";
import { Toaster } from "./components/Toast";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const viewport: Viewport = {
  themeColor: "#1A3C6E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Firmes — Gestão para Igrejas",
  description: "Plataforma completa de gestão para igrejas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FIRMES",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-180.png",
    other: [
      { rel: "icon", sizes: "48x48",  url: "/icon-48.png" },
      { rel: "icon", sizes: "96x96",  url: "/icon-96.png" },
      { rel: "icon", sizes: "512x512", url: "/icon-512.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={nunito.variable}
        style={{
          background: "#F5F0EB",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      >
        <WatermarkDove />
        <Toaster />
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
