// Shared catalog data for UniDoorDash. Edit these arrays to change the
// products, stores, ads and announcements shown across the app.

export type Seller = { name: string; avatar: string };
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  seller: Seller;
};
export type Store = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  owner: Seller;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: `p-amber-noir`,
    name: `Amber Noir Eau de Parfum`,
    price: 68,
    image: `https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80`,
    description: `A warm, resinous amber base with dark plum and cedar. Long-lasting, unisex.`,
    category: `Perfumes`,
    seller: {
      name: `Maison Cherie`,
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `p-citrus-bloom`,
    name: `Citrus Bloom Cologne`,
    price: 52,
    image: `https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80`,
    description: `Bright bergamot and neroli over a soft musk. A fresh everyday signature scent.`,
    category: `Perfumes`,
    seller: {
      name: `Noor Textiles`,
      avatar: `https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `p-velvet-oud`,
    name: `Velvet Oud Intense`,
    price: 94,
    image: `https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80`,
    description: `Rich oud wrapped in rose and saffron. A statement fragrance for evening wear.`,
    category: `Perfumes`,
    seller: {
      name: `Amara House`,
      avatar: `https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `p-sea-salt`,
    name: `Sea Salt & Fig Mist`,
    price: 38,
    image: `https://images.unsplash.com/photo-1615368144592-05505863f379?auto=format&fit=crop&w=1200&q=80`,
    description: `Airy fig leaf and salted driftwood — light enough to layer, easy to wear daily.`,
    category: `Perfumes`,
    seller: {
      name: `Coastal Co.`,
      avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `c-linen-shirt`,
    name: `Oversized Linen Shirt`,
    price: 46,
    image: `https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80`,
    description: `Breathable washed linen, relaxed fit. Pairs with everything, wrinkles on purpose.`,
    category: `Clothing`,
    seller: {
      name: `Field Studio`,
      avatar: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `c-wide-trousers`,
    name: `Wide-Leg Tailored Trousers`,
    price: 58,
    image: `https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80`,
    description: `High-waisted, fluid drape. Cut for movement without losing a sharp silhouette.`,
    category: `Clothing`,
    seller: {
      name: `Noor Textiles`,
      avatar: `https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `c-knit-sweater`,
    name: `Ribbed Knit Sweater`,
    price: 64,
    image: `https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1200&q=80`,
    description: `Soft merino blend, fine ribbing throughout. Made to layer through every season.`,
    category: `Clothing`,
    seller: {
      name: `Field Studio`,
      avatar: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `c-denim-jacket`,
    name: `Cropped Denim Jacket`,
    price: 72,
    image: `https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80`,
    description: `Rigid raw denim that softens with wear. A cropped cut with classic stitching.`,
    category: `Clothing`,
    seller: {
      name: `Amara House`,
      avatar: `https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `a-leather-tote`,
    name: `Structured Leather Tote`,
    price: 89,
    image: `https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80`,
    description: `Full-grain leather with a hidden interior pocket. Ages beautifully with use.`,
    category: `Accessories`,
    seller: {
      name: `Coastal Co.`,
      avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `a-gold-hoops`,
    name: `Fine Gold Hoop Earrings`,
    price: 34,
    image: `https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80`,
    description: `14k gold-plated, lightweight enough for everyday wear. Hypoallergenic posts.`,
    category: `Accessories`,
    seller: {
      name: `Maison Cherie`,
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `a-silk-scarf`,
    name: `Hand-Rolled Silk Scarf`,
    price: 41,
    image: `https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80`,
    description: `100% mulberry silk, hand-finished edges. A small print run, never mass-produced.`,
    category: `Accessories`,
    seller: {
      name: `Amara House`,
      avatar: `https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `h-ceramic-vase`,
    name: `Hand-Thrown Ceramic Vase`,
    price: 48,
    image: `https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1200&q=80`,
    description: `Stoneware with a matte glaze, no two exactly alike. Wheel-thrown in small batches.`,
    category: `Home & Living`,
    seller: {
      name: `Field Studio`,
      avatar: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `h-linen-candle`,
    name: `Linen & Cedar Candle`,
    price: 29,
    image: `https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=80`,
    description: `Soy wax, cotton wick, 45-hour burn. Warm cedar with a faint clean-linen top note.`,
    category: `Home & Living`,
    seller: {
      name: `Coastal Co.`,
      avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80`,
    },
  },
  {
    id: `h-wool-throw`,
    name: `Chunky Wool Throw Blanket`,
    price: 76,
    image: `https://images.unsplash.com/photo-1580301762395-83c8853aef26?auto=format&fit=crop&w=1200&q=80`,
    description: `Undyed merino, hand-knit chunky cable pattern. Heavy, warm, built to last decades.`,
    category: `Home & Living`,
    seller: {
      name: `Noor Textiles`,
      avatar: `https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80`,
    },
  },
];
export const CATEGORIES = [`Perfumes`, `Clothing`, `Accessories`, `Home & Living`];
export const ADS = [
  {
    id: `a1`,
    title: `New: Autumn Fragrance Collection`,
    media: `https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80`,
  },
  {
    id: `a2`,
    title: `Free shipping on orders over $50`,
    media: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80`,
  },
  {
    id: `a3`,
    title: `The Linen Edit — just dropped`,
    media: `https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1600&q=80`,
  },
  {
    id: `a4`,
    title: `Handmade home goods, restocked`,
    media: `https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1600&q=80`,
  },
];
export const FILTER_CHIPS = [`New arrivals`, `Best sellers`, `Top rated`, `On sale`, `This week`];
export const STORES: Store[] = [
  {
    id: `store-maison-cherie`,
    name: `Maison Cherie`,
    specialty: `Perfumes`,
    image: `https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80`,
    owner: {
      name: `Amélie Rousseau`,
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80`,
    },
    description: `Small-batch fragrances blended by hand, one bottle at a time.`,
  },
  {
    id: `store-noor-textiles`,
    name: `Noor Textiles`,
    specialty: `Clothing`,
    image: `https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80`,
    owner: {
      name: `Noor Haddad`,
      avatar: `https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80`,
    },
    description: `Tailored fits and fluid drape, cut in small runs, never mass-produced.`,
  },
  {
    id: `store-field-studio`,
    name: `Field Studio`,
    specialty: `Clothing`,
    image: `https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80`,
    owner: {
      name: `Jonas Weber`,
      avatar: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80`,
    },
    description: `Relaxed everyday staples in natural, breathable fabrics.`,
  },
  {
    id: `store-amara-house`,
    name: `Amara House`,
    specialty: `Accessories`,
    image: `https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80`,
    owner: {
      name: `Amara Osei`,
      avatar: `https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80`,
    },
    description: `Hand-finished leather and silk pieces, made to last decades.`,
  },
  {
    id: `store-coastal-co`,
    name: `Coastal Co.`,
    specialty: `Home & Living`,
    image: `https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1200&q=80`,
    owner: {
      name: `Lena Marlowe`,
      avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80`,
    },
    description: `Warm, coastal-inspired home goods for slow, unhurried living.`,
  },
];
export const UPDATES = [
  {
    id: `u1`,
    title: `You're now Gold tier`,
    src: `https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80`,
  },
  {
    id: `u2`,
    title: `Free shipping unlocked`,
    src: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80`,
  },
  {
    id: `u3`,
    title: `Payment received`,
    src: `https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80`,
  },
  {
    id: `u4`,
    title: `Autumn collection is live`,
    src: `https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80`,
  },
  {
    id: `u5`,
    title: `You earned 120 points`,
    src: `https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1000&q=80`,
  },
  {
    id: `u6`,
    title: `Store credit added`,
    src: `https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1000&q=80`,
  },
];
export const ANNOUNCEMENTS = [
  {
    id: `a1`,
    title: `Scheduled maintenance tonight`,
    description: `The store will be briefly unavailable between 1:00–1:30 AM while we roll out performance improvements.`,
    avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80`,
    date: `2026-08-08`,
    time: `6:12 PM`,
  },
  {
    id: `a2`,
    title: `New payout schedule for sellers`,
    description: `Seller payouts now process every Monday and Thursday instead of weekly, so funds reach your wallet faster.`,
    avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80`,
    date: `2026-08-06`,
    time: `11:45 AM`,
  },
  {
    id: `a3`,
    title: `Wekeza plan now includes early access`,
    description: `Wekeza subscribers can now shop new drops 24 hours before they go live for everyone else.`,
    avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80`,
    date: `2026-08-03`,
    time: `9:00 AM`,
  },
  {
    id: `a4`,
    title: `Fixed an issue with saved favourites`,
    description: `Some users saw favourited stores disappear after switching themes. This has been resolved for everyone.`,
    avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80`,
    date: `2026-07-30`,
    time: `3:20 PM`,
  },
];
