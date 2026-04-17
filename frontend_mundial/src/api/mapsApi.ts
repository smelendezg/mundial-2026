import { USE_MOCK } from "./config";
import { http } from "./http";

import type { Stadium } from "../types/stadium";

export const stadiumsMock: Stadium[] = [
  {
    id: "azteca",
    name: "Estadio Azteca",
    city: "Ciudad de México",
    country: "México",
    lat: 19.3029,
    lng: -99.1505,
  },
  {
    id: "metlife",
    name: "MetLife Stadium",
    city: "New York/New Jersey",
    country: "Estados Unidos",
    lat: 40.8135,
    lng: -74.0745,
  },
  {
    id: "sofi",
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "Estados Unidos",
    lat: 33.9535,
    lng: -118.3392,
  },
  {
    id: "att",
    name: "AT&T Stadium",
    city: "Dallas",
    country: "Estados Unidos",
    lat: 32.7473,
    lng: -97.0945,
  },
  {
    id: "bmo",
    name: "BMO Field",
    city: "Toronto",
    country: "Canadá",
    lat: 43.6332,
    lng: -79.4186,
  },
];

export async function getStadiums(): Promise<Stadium[]> {
  if (!USE_MOCK) return http.get<Stadium[]>("/maps/stadiums");
  return stadiumsMock;
}
