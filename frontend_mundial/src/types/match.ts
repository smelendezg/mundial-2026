export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "PENDING_DATA";

export interface Team {
  id: string;
  name: string;
  code?: string; // COL, ARG, etc
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: "GOAL" | "CARD" | "SUB" | "OTHER";
  description: string;
}

export interface Match {
  id: string;
  home: Team;
  away: Team;
  stadium: string;
  city: string;
  startTimeISO: string;
  status: MatchStatus;
  score?: { home: number; away: number };
  events?: MatchEvent[];
}