import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoveLink Studio",
  description: "Create beautiful animated surprise pages with photos, text, and a shareable URL."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
