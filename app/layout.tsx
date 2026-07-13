import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MASMOVIL — Crédito y tecnología para el ecosistema digital",
  description:
    "Líneas de crédito para proveedores de telefonía, tecnología y microempresas: hardware, software y asesorías. Cursos de marketing digital y desarrollo de software financiero. Guadalajara, desde 2019.",
  openGraph: {
    title: "MASMOVIL — Crédito y tecnología para quienes construyen lo digital",
    description:
      "Financiamos hardware, software y asesorías para el ecosistema tecnológico mexicano. Formación empresarial y software financiero a la medida.",
    type: "website",
    locale: "es_MX",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%2322d3ee'/%3E%3Cstop offset='1' stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='%2304060e'/%3E%3Cpath d='M14 46V20l12 14 6-8 6 8 12-14v26' stroke='url(%23g)' stroke-width='5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#04060e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
