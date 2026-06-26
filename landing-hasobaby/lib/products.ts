// ============================================================
// Nguồn dữ liệu sản phẩm — dùng chung cho landing + form + API.
// ============================================================

export type Combo = {
  id: string;
  qty: number;
  name: string;
  tagline: string;
  price: number;
  original?: number;
  save?: number;
  popular?: boolean;
  gifts: string[];
};

export const COMBOS: Combo[] = [
  {
    id: "combo1",
    qty: 1,
    name: "1 Chai Dùng Thử",
    tagline: "Cho mẹ trải nghiệm lần đầu",
    price: 189000,
    gifts: ['Ebook "Xử lý sốt tại nhà — 9 dấu hiệu phải đưa bé đi viện"'],
  },
  {
    id: "combo2",
    qty: 2,
    name: "2 Chai Tiết Kiệm",
    tagline: "Một chai để nhà, một chai mang theo",
    price: 348000,
    original: 378000,
    save: 30000,
    gifts: [
      'Ebook "Xử lý sốt tại nhà"',
      'Ebook "Cẩm nang chích ngừa an toàn cho bé"',
    ],
  },
  {
    id: "combo3",
    qty: 3,
    name: "3 Chai Gia Đình",
    tagline: "Combo hời nhất — mẹ chọn nhiều nhất",
    price: 497000,
    original: 567000,
    save: 70000,
    popular: true,
    gifts: [
      "2 Ebook chăm con (Xử lý sốt + Chích ngừa an toàn)",
      "Bảng theo dõi nhiệt độ & nhật ký sốt cho bé",
      'Vé vào nhóm kín "Nghiện bầu nghiện con"',
    ],
  },
];

// Hotline in trên bao bì sản phẩm
export const HOTLINE = "0942486825";

// Link Messenger fanpage Hasobaby Dr.Maya
export const MESSENGER_URL = "https://m.me/hasobaby.drmaya";

// Fanpage Facebook
export const FACEBOOK_URL = "https://web.facebook.com/hasobaby.drmaya";

export const STORE_URL = "https://drmayastore.vn/products/hasobaby-0";

export const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";
