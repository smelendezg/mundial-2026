import type { Sticker } from "./sticker"; 

 

export interface User { 

  id: string; 

  name: string; 

  stickers: Sticker[]; 

  repeated: Sticker[]; 

} 

 

export interface PoolMember { 

  user: User; 

  points: number;

} 

 

export interface Pool { 

  id: string; 

  name: string; 

  code: string; 

  matchIds: string[];

  members: PoolMember[]; 

} 
