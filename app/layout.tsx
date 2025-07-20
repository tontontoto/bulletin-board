import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from '../contexts/UserContext';
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "匿名掲示板",
    template: "%s | 匿名掲示板"
  },
  description: "匿名で投稿できる掲示板！★安全で自由な議論の場を提供するよ！★",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <UserProvider>
        <Header />
        {children}
        <Footer />
      </UserProvider>
      </body>
    </html>
  );
}
