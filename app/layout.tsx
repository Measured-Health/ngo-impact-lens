import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Montserrat } from "next/font/google";
import "./globals.css";

// Display: a heavy, tightly tracked grotesque. Text: Montserrat, Pehtrah Foundation's own text face.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-display" });
const text = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "NGO Strategy & Impact Lens",
  description:
    "A chat advisor that stress-tests an NGO's mission, theory of change, strategy, funding model and accountability from a chosen stakeholder's perspective, then writes an alignment report.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
