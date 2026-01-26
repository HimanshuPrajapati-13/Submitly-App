import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Submitly - Submit On Time | Never Miss a Deadline",
  description: "Your purpose-built application tracker for managing high-stakes deadlines. Track college admissions, job applications, scholarships, and competitive exams with ease.",
  keywords: ["submitly", "application tracker", "deadline manager", "college applications", "job applications", "scholarship tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
