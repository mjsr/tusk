import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tusk - Your data, at your fingertips",
  description: "A modern PostgreSQL client with AI-powered queries and built-in product analytics. Stop wondering what your users are doing — take action.",
  keywords: ["PostgreSQL", "database", "SQL", "client", "AI", "analytics", "Postgres"],
  openGraph: {
    title: "Tusk - Your data, at your fingertips",
    description: "A modern PostgreSQL client with AI-powered queries and built-in product analytics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tusk - Your data, at your fingertips",
    description: "A modern PostgreSQL client with AI-powered queries and built-in product analytics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
