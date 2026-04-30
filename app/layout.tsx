import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SportBook — Rezerwacja Boisk i Obiektów Sportowych",
  description:
    "Zarezerwuj boisko lub obiekt sportowy w kilka sekund. Sprawdź dostępność, wybierz termin i graj bez kolejek.",
  keywords: ["rezerwacja boisk", "boiska sportowe", "sport", "rezerwacja online"],
  authors: [{ name: "Wiktor Stachura" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={inter.variable}>
      <body>
        <Navbar />
        <div className="page-content">{children}</div>
      </body>
    </html>
  );
}
