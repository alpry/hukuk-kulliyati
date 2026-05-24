import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hukuk Külliyatı",
  description: "Türk hukuku mevzuatı ve kişisel notlar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={geist.className}>
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
