import type { Metadata, Viewport } from "next";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3FCFC9",
};

export const metadata: Metadata = {
  title: "Xịt Hạ Sốt Hasobaby 0+ Dr.Maya — 3 giây là mát, bé dễ chịu, mẹ an tâm",
  description:
    "Xịt hạ sốt Hasobaby 0+ Dr.Maya — công thức thảo dược thiên nhiên, tạo cảm giác mát chỉ sau 3 giây, hỗ trợ làm dịu khi con sốt sau tiêm phòng, mọc răng hay nóng người. An toàn cho trẻ sơ sinh từ 0 tháng. Không cồn, không paraben, không phẩm màu.",
  keywords: [
    "xịt hạ sốt",
    "Hasobaby",
    "Dr.Maya",
    "hạ sốt cho bé",
    "sốt sau tiêm phòng",
    "hạ sốt cho bé sau tiêm",
    "xịt hạ sốt thảo dược",
    "hạ sốt trẻ sơ sinh",
  ],
  openGraph: {
    title: "Xịt Hạ Sốt Hasobaby 0+ Dr.Maya",
    description:
      "Con đi tiêm phòng về bị sốt? 3 giây là mát, bé dễ chịu, mẹ an tâm. Công thức thảo dược thiên nhiên, an toàn cho trẻ sơ sinh từ 0 tháng.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
