import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Desert Air HVAC",
  description: "HVAC service intake",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
