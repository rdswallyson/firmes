import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WatermarkDove } from "./components/WatermarkDove";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Firmes — Sistema de Gestão",
  description: "Plataforma de gestão para igrejas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: "#F5F0EB", margin: 0, padding: 0, minHeight: "100vh" }}
      >
        <WatermarkDove />
        {children}
      </body>
    </html>
  );
}
