import { souvenirMockups } from "./mockMedia";

export type StoreProduct = {
  id: string;
  sku: string;
  name: string;
  category: "Destacados" | "Camisetas" | "Accesorios" | "Coleccionables";
  team?: string;
  flag?: string;
  price: number;
  sizeLabel: string;
  image: string;
  highlight?: boolean;
  description: string;
};

export const storeCatalog: StoreProduct[] = [
  {
    id: "store-001",
    sku: "COPA-LEGO-2026",
    name: "Copa Mundial 2026 en LEGO",
    category: "Destacados",
    price: 459900,
    sizeLabel: "Edición especial",
    image: souvenirMockups.legoCup,
    highlight: true,
    description: "Pieza de colección con acabado dorado para exhibir en escritorio o vitrina.",
  },
  {
    id: "store-002",
    sku: "CAM-COL-2026",
    name: "Camiseta Colombia 2026",
    category: "Camisetas",
    team: "Colombia",
    flag: "🇨🇴",
    price: 189900,
    sizeLabel: "Unitalla",
    image: souvenirMockups.shirtColombia,
    description: "Tela ligera con caída deportiva para uso diario y días de partido.",
  },
  {
    id: "store-003",
    sku: "CAM-ARG-2026",
    name: "Camiseta Argentina 2026",
    category: "Camisetas",
    team: "Argentina",
    flag: "🇦🇷",
    price: 189900,
    sizeLabel: "Unitalla",
    image: souvenirMockups.shirtArgentina,
    description: "Versión casual inspirada en la selección con cuello suave y ajuste relajado.",
  },
  {
    id: "store-004",
    sku: "CAM-BRA-2026",
    name: "Camiseta Brasil 2026",
    category: "Camisetas",
    team: "Brasil",
    flag: "🇧🇷",
    price: 189900,
    sizeLabel: "Unitalla",
    image: souvenirMockups.shirtBrazil,
    description: "Color vibrante con textura cómoda para usar en calle o estadio.",
  },
  {
    id: "store-005",
    sku: "CAM-MEX-2026",
    name: "Camiseta México 2026",
    category: "Camisetas",
    team: "México",
    flag: "🇲🇽",
    price: 189900,
    sizeLabel: "Unitalla",
    image: souvenirMockups.shirtMexico,
    description: "Modelo urbano con inspiración mundialista y acabado premium.",
  },
  {
    id: "store-006",
    sku: "BOT-THERMO-2026",
    name: "Botella térmica Mundial 2026",
    category: "Accesorios",
    price: 69900,
    sizeLabel: "750 ml",
    image: souvenirMockups.bottle,
    description: "Botella metálica para entrenamiento, oficina o viajes.",
  },
  {
    id: "store-007",
    sku: "BUF-FAN-2026",
    name: "Bufanda de aficionado",
    category: "Accesorios",
    price: 54900,
    sizeLabel: "Talla única",
    image: souvenirMockups.scarf,
    description: "Accesorio suave para completar el look de tribuna.",
  },
  {
    id: "store-008",
    sku: "PEL-MASCOTA-2026",
    name: "Multipack mascota del torneo",
    category: "Coleccionables",
    price: 89900,
    sizeLabel: "25.40 cm",
    image: souvenirMockups.plush,
    description: "Peluches suave para regalo o colección.",
  },
  {
    id: "store-009",
    sku: "MINI-BALON-2026",
    name: "Mini balón edición sede",
    category: "Coleccionables",
    price: 79900,
    sizeLabel: "Mini",
    image: souvenirMockups.miniBall,
    description: "Balón de escritorio con gráfica oficial inspirada en el torneo.",
  },
];

export function formatStorePrice(value: number) {
  return `$${value.toLocaleString("es-CO")} COP`;
}
