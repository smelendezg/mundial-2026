export interface Sticker {
  id: string;
  name: string;
  team: string;
  rarity: "common" | "rare" | "legend";
}