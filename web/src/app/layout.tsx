import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobJar",
  description: "Household job jar for recurring room-based tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
