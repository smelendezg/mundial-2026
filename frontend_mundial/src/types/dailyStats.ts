export type DailyStats = { 

  poolCode: string; 

  userId: string; 

  dayKey: string; // "YYYY-MM-DD" 

  packsOpened: number; 

  tradesDone: number; 

  updatedAt: string; // ISO 

}; 