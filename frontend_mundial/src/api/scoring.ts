import type { Prediction } from "../types/prediction"; 

import type { Match } from "../types/match"; 

 

export function scorePrediction(pred: Prediction, match: Match): number { 

  if (!match.score) return 0; 

 

  const ph = pred.homeScore; 

  const pa = pred.awayScore; 

  const mh = match.score.home; 

  const ma = match.score.away; 

 

  if (ph === mh && pa === ma) return 3; 

 

  const predOutcome = outcome(ph, pa); 

  const matchOutcome = outcome(mh, ma); 

 

  return predOutcome === matchOutcome ? 1 : 0; 

} 

 

function outcome(h: number, a: number): "WIN" | "DRAW" | "LOSS" { 

  if (h > a) return "WIN"; 

  if (h < a) return "LOSS"; 

  return "DRAW"; 

} 