import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cẩm nang Chích Ngừa MIỄN PHÍ cho mẹ bỉm | Dr.Maya",
  description:
    "Tặng mẹ ebook chích ngừa an toàn cho bé 0-24 tháng. Hoặc nhận combo 2 ebook + xịt hạ sốt Hasobaby chỉ 189K.",
  openGraph: {
    title: "Cẩm nang Chích Ngừa MIỄN PHÍ cho mẹ bỉm | Dr.Maya",
    description:
      "Tặng mẹ ebook chích ngừa an toàn cho bé 0-24 tháng. Hoặc nhận combo 2 ebook + xịt hạ sốt Hasobaby chỉ 189K.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function EbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
