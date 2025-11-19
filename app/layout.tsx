import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mermaid Visualizer",
  description: "Generate and visualize Mermaid diagrams easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
