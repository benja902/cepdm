import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEPREVAL PREP — Plataforma de preparación UNHEVAL",
  description:
    "Entrena para el examen de admisión UNHEVAL con práctica inteligente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-valo-bg" suppressHydrationWarning>{children}</body>
    </html>
  );
}
