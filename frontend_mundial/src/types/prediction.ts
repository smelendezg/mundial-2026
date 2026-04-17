export type PredictionResult = "PENDING" | "WIN" | "DRAW" | "LOSS"; 

 

export type Prediction = { 

  id: string; 

  poolId: string; 

  userId: string; 

  matchId: string; 

 

  homeScore: number; 

  awayScore: number; 

 

  createdAt: string; 

  updatedAt?: string; 

 

  locked: boolean; 

  lockedAt?: string; 

 

  points?: number; 

  result?: PredictionResult; 

}; 