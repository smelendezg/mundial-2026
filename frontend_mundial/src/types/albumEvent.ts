import type { Sticker } from "./sticker"; 

 

export type AlbumEventType = 

  | "PACK_OPENED" 

  | "STICKER_NEW" 

  | "STICKER_DUPLICATE" 

  | "COINS_EARNED" 

  | "COINS_SPENT" 

  | "MARKET_LISTED" 

  | "MARKET_BOUGHT" 

  | "MARKET_CANCELLED" 

  | "TRADE_CREATED" 

  | "TRADE_ACCEPTED" 

  | "TRADE_REJECTED"; 

 

export type AlbumEvent = { 

  id: string; 

  poolCode: string; 

  userId: string; 

  type: AlbumEventType; 

  createdAt: string; // ISO 

  data?: { 

    sticker?: Sticker; 

    stickerId?: string; 

    coins?: number; 

    pack?: Sticker[]; 

    note?: string; 

    [k: string]: unknown; 

  }; 

}; 