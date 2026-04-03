import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { WatermarkDove } from "./components/WatermarkDove";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Firmes — Gestão para Igrejas",
  description: "Plataforma de gestão para igrejas",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-180.png",
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
          background: "#F0EBE1",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      >
        <WatermarkDove />
        {children}
      </body>
    </html>
  );
}
