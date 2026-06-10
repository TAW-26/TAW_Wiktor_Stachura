import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

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
    <html lang="pl">
      <body>
        <Navbar />
        <div className="page-content">{children}</div>
      </body>
    </html>
  );
}
