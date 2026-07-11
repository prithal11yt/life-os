import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ramu Kaka — Your AI chief of staff",
  description: "Voice-first personal assistant dashboard: capture, organize, and track your life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col gap-[18px] p-5 sm:p-7">{children}</main>
        </div>
      </body>
    </html>
  );
}
