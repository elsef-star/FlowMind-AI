import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual AI Workflow",
  description:
    "Build and run visual AI decision workflows with YES/NO branching",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}