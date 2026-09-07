import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zola Dimas Firmansyah — Backend Architect & Systems Analyst",
  description:
    "Information Systems portfolio specializing in high-throughput backend architecture, PostgreSQL, system analysis (UML/SRS), and automated cloud infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-obsidian-void text-obsidian-text selection:bg-brand-emerald selection:text-obsidian-void">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
