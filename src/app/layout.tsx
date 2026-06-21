import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSHA Compass — AI Compliance Assistant",
  description:
    "AI-powered compliance assistant for regulated industries. Get instant answers on OSHA regulations, safety standards, and workplace compliance requirements.",
  keywords: "OSHA, compliance, safety, regulations, AI assistant, workplace safety",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
