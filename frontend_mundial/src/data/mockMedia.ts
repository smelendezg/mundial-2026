export const bannerImages = {
  login:
    "https://assets1.afa.com.ar/media/LUCAS-GAIO/Junio-2025/webfifa26.jpg",
  matches:
    "https://assets.goal.com/images/v3/bltf24ea2da08e49b02/Mbappe_Neymar.jpg",
  home:
    "https://www.faa.gov/sites/faa.gov/files/inline-images/2026-AJO-026_MM865_FIFA%20FAA%20Hero_Banner_SSM04.jpg",
  album:
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&q=80",
  maps:
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
  register:
    "https://assets1.afa.com.ar/media/LUCAS-GAIO/Junio-2025/webfifa26.jpg",
  admin:
    "https://bayareadeportes.com/wp-content/uploads/2025/04/COPA-1024x768.webp",
  operator:
    "https://bayareadeportes.com/wp-content/uploads/2025/04/COPA-1024x768.webp",
  support:
    "https://telemax.com.mx/wp-content/uploads/2025/10/Trionda.jpg",
  store:
    "https://fc-bucket-100.s3.amazonaws.com/wp-content/uploads/2025/10/30133627/Fast-Company-Mexico-historias-Mundial-2026-cortesia.jpg",
  marketplace:
    "https://fc-bucket-100.s3.amazonaws.com/wp-content/uploads/2025/10/30133627/Fast-Company-Mexico-historias-Mundial-2026-cortesia.jpg",
  tickets:
    "https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2250192153.jpg?c=original",
  cart:
    "https://fc-bucket-100.s3.amazonaws.com/wp-content/uploads/2025/10/30133627/Fast-Company-Mexico-historias-Mundial-2026-cortesia.jpg",
  payments:
    "https://cdn.plus.fifa.com/images/public/cms/57/11/2b/93/57112b93-0103-4082-8bf4-c043b47796e1.jpg?width=1958",
  friends:
    "https://cdn.colombia.com/sdi/2025/06/17/copa-mundial-de-la-fifa-2026-seleccion-colombia-1289044.jpg",
  trades:
    "https://hotelesemporio.com/wp-content/uploads/2025/12/Banderas.jpg",
  profile:
    "https://telemax.com.mx/wp-content/uploads/2025/10/Trionda.jpg",
  notifications:
    "https://telemax.com.mx/wp-content/uploads/2025/10/Trionda.jpg",
  pools:
    "https://laud.udistrital.edu.co/sites/default/files/imagen-noticia/2026-01/QSDC5XEFVFCLFNG7DGAEVK2WNM.jpg",
  pollDetail:
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=80",
  checkout:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80",
} as const;

export const souvenirMockups = {
  legoCup:
    "https://img.asmedia.epimg.net/resizer/v2/XF2D2SN4CZEBZEOXUITV5TE2ZU.jpg?auth=cb63db7379b0bf4f4f150445f561a3aa6352aac0f97186d24320b798d51a3019&width=375",
  shirtColombia:
    "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/0a31a4ab232147e0829ef0991151e34d_9366/Camiseta_Visitante_Seleccion_Colombia_26_Version_Jugador_Azul_JL6973_HM5.jpg",
  shirtArgentina:
    "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/8b234227db7c40199d5b1862f81dd514_9366/Camiseta_Visitante_Seleccion_Argentina_26_Negro_KH3940_01_laydown.jpg",
  shirtBrazil:
    "https://www.sportline.com.co/media/catalog/product/i/u/iu1072-417_phsfh001-2000.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=&width=&canvas=:",
  shirtMexico:
    "https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/930b446f5e4a4e6b9ae442d047d34d5c_9366/Camiseta_Local_Seleccion_Nacional_de_Mexico_26_Verde_JL8580_01_laydown.jpg",
  bottle:
    "https://store.fifa.com/cdn/shop/files/image_8c0f66f6-ce69-4372-94d0-b8b953bf21d3.jpg?v=1774372230",
  scarf:
    "https://store.fifa.com/cdn/shop/files/image_1ea42470-c395-4c56-8119-3dd82dabf782.png?v=1774373133&width=1346",
  plush:
    "https://store.fifa.com/cdn/shop/files/image_9b19b228-b955-4c20-ba53-9d5a77f0a3ff.jpg?v=1774373688",
  miniBall:
    "https://http2.mlstatic.com/D_NQ_NP_2X_937154-MLA101900685123_122025-F.webp",
} as const;

export type AlbumShopItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  image?: string;
  packs?: number;
  coins?: number;
};

export const albumShopMockups: AlbumShopItem[] = [
  {
    id: "pack-basic",
    title: "Pack de 3 sobres",
    subtitle: "Tres sobres para seguir la colección",
    amount: 24900,
    packs: 3,
    image:
      "https://images.unsplash.com/photo-1518131678677-a680cd89f463?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pack-premium",
    title: "Pack de 7 sobres",
    subtitle: "Más sobres para completar selecciones rápido",
    amount: 49900,
    packs: 7,
    image:
      "https://images.unsplash.com/photo-1518131678677-a680cd89f463?auto=format&fit=crop&w=1200&q=80&sat=20",
  },
  {
    id: "coins-small",
    title: "Bolsa de 20 monedas",
    subtitle: "Para compras rápidas en el mercado",
    amount: 19900,
    coins: 20,
  },
  {
    id: "coins-big",
    title: "Bolsa de 60 monedas",
    subtitle: "Para publicaciones y compras grandes",
    amount: 49900,
    coins: 60,
  },
];
