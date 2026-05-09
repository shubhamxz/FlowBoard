import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://proud-healing-production-a0ad.up.railway.app";

export const metadata: Metadata = {
  title: "FLOWBOARD",
  description: "Brutalist task management for teams.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: siteUrl,
    title: "FLOWBOARD",
    description: "Brutalist task management for teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
