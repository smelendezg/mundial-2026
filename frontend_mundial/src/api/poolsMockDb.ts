import type { Pool } from "../types/pool"; 

import { mockDb } from "./mockDb"; 

 

export const poolsMock: Pool[] = [ 

  { 

    id: "p1", 

    name: "Polla Amigos", 

    code: "AMIGOS2026", 

    matchIds: mockDb.matches.map((m) => m.id), 

    members: [ 

      { user: { id: "u1", name: "Sara", stickers: [], repeated: [] }, points: 0 }, 

      { user: { id: "u2", name: "Juan", stickers: [], repeated: [] }, points: 0 }, 

    ], 

  }, 

]; 