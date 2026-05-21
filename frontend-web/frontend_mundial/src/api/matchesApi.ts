import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";
import type { Match } from "../types/match";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type BackendMatch = {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
    venue: { name: string; city: string | null };
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
};

function mapStatus(short: string): Match["status"] {
  const liveStates = ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"];
  const finishedStates = ["FT", "AET", "PEN"];
  if (liveStates.includes(short)) return "LIVE";
  if (finishedStates.includes(short)) return "FINISHED";
  if (short === "NS") return "SCHEDULED";
  return "PENDING_DATA";
}
const estadioCiudad: Record<string, string> = {
  "Estadio Azteca": "Ciudad de México",
  "Estadio Akron": "Guadalajara",
  "Estadio BBVA": "Monterrey",
  "BMO Field": "Toronto",
  "BC Place": "Vancouver",
  "SoFi Stadium": "Los Angeles",
  "MetLife Stadium": "East Rutherford",
  "Gillette Stadium": "Boston",
  "NRG Stadium": "Houston",
  "Lincoln Financial Field": "Philadelphia",
  "Mercedes-Benz Stadium": "Atlanta",
  "Lumen Field": "Seattle",
  "Hard Rock Stadium": "Miami",
  "Arrowhead Stadium": "Kansas City",
};
function toMatch(b: BackendMatch): Match {
  return {
    id: String(b.fixture.id),
    home: {
      id: String(b.teams.home.id),
      name: b.teams.home.name,
      code: b.teams.home.name.slice(0, 3).toUpperCase(),
      logo: b.teams.home.logo,
    },
    away: {
      id: String(b.teams.away.id),
      name: b.teams.away.name,
      code: b.teams.away.name.slice(0, 3).toUpperCase(),
      logo: b.teams.away.logo,
    },
   stadium: b.fixture.venue.name ?? "Por confirmar",
city: b.fixture.venue.city ?? estadioCiudad[b.fixture.venue.name ?? ""] ?? "Por confirmar",
    startTimeISO: b.fixture.date,
    status: mapStatus(b.fixture.status.short),
    score: { home: b.goals.home ?? 0, away: b.goals.away ?? 0 },
    events: [],
  };
}

export async function getMatches(): Promise<Match[]> {
  if (!USE_MOCK) {
    const res = await http.get<BackendMatch[]>("/api/partidos");
    return res.map(toMatch);
  }
  await sleep(200);
  return [...mockDb.matches];
}

export async function getMatchesByDate(fecha: string): Promise<Match[]> {
  if (!USE_MOCK) {
    const res = await http.get<BackendMatch[]>(`/api/partidos/fecha/${fecha}`);
    return res.map(toMatch);
  }
  await sleep(200);
  return [...mockDb.matches];
}

export async function getLiveMatches(): Promise<Match[]> {
  if (!USE_MOCK) {
    const res = await http.get<BackendMatch[]>("/api/partidos/envivo");
    return res.map(toMatch);
  }
  await sleep(200);
  return mockDb.matches.filter((m) => m.status === "LIVE");
}
