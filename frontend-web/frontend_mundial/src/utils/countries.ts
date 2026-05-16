import type { Team } from "../types/match";

const flagByCode: Record<string, string> = {
  ARG: "🇦🇷",
  BRA: "🇧🇷",
  COL: "🇨🇴",
  MEX: "🇲🇽",
  ESP: "🇪🇸",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  ALE: "🇩🇪",
  ITA: "🇮🇹",
  USA: "🇺🇸",
  CAN: "🇨🇦",
  ENG: "🏴",
  KOR: "🇰🇷",
  URU: "🇺🇾",
};

const flagByName: Record<string, string> = {
  argentina: "🇦🇷",
  brasil: "🇧🇷",
  brazil: "🇧🇷",
  colombia: "🇨🇴",
  méxico: "🇲🇽",
  mexico: "🇲🇽",
  españa: "🇪🇸",
  spain: "🇪🇸",
  francia: "🇫🇷",
  france: "🇫🇷",
  alemania: "🇩🇪",
  germany: "🇩🇪",
  italia: "🇮🇹",
  italy: "🇮🇹",
  "estados unidos": "🇺🇸",
  canada: "🇨🇦",
  canadá: "🇨🇦",
  england: "🏴",
  inglaterra: "🏴",
  korea: "🇰🇷",
  corea: "🇰🇷",
  uruguay: "🇺🇾",
};

export function getTeamFlag(team: Team) {
  const code = team.code?.toUpperCase();
  if (code && flagByCode[code]) return flagByCode[code];

  return flagByName[team.name.trim().toLowerCase()] ?? "🏳️";
}

export function formatTeam(team: Team) {
  return `${getTeamFlag(team)} ${team.name}${team.code ? ` (${team.code})` : ""}`;
}

export function getCountryFlag(country: string) {
  return flagByName[country.trim().toLowerCase()] ?? "🏳️";
}
