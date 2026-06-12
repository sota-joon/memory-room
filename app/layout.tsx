import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 기억 인터뷰",
  description: "가족에게 남기는 편지를 만드는 따뜻한 기억 인터뷰 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
