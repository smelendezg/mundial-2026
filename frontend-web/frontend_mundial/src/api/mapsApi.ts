
import type { Stadium } from "../types/stadium";
//En los siguientes sprint se le aplicara la logica segun la preferencia del usuario
export const stadiumsMock: Stadium[] = [
  { id: "azteca", name: "Estadio Azteca", city: "Ciudad de México", country: "México", lat: 19.3029, lng: -99.1505 },
  { id: "akron", name: "Estadio Akron", city: "Guadalajara", country: "México", lat: 20.6869, lng: -103.4627 },
  { id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "México", lat: 25.6694, lng: -100.2438 },
  { id: "bmo", name: "BMO Field", city: "Toronto", country: "Canadá", lat: 43.6332, lng: -79.4186 },
  { id: "bcplace", name: "BC Place", city: "Vancouver", country: "Canadá", lat: 49.2767, lng: -123.1116 },
  { id: "sofi", name: "SoFi Stadium", city: "Los Angeles", country: "Estados Unidos", lat: 33.9535, lng: -118.3392 },
  { id: "metlife", name: "MetLife Stadium", city: "East Rutherford", country: "Estados Unidos", lat: 40.8135, lng: -74.0745 },
  { id: "gillette", name: "Gillette Stadium", city: "Boston", country: "Estados Unidos", lat: 42.0909, lng: -71.2643 },
  { id: "nrg", name: "NRG Stadium", city: "Houston", country: "Estados Unidos", lat: 29.6847, lng: -95.4107 },
  { id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", country: "Estados Unidos", lat: 39.9008, lng: -75.1675 },
  { id: "mercedesbenz", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "Estados Unidos", lat: 33.7553, lng: -84.4006 },
  { id: "lumen", name: "Lumen Field", city: "Seattle", country: "Estados Unidos", lat: 47.5952, lng: -122.3316 },
  { id: "hardrock", name: "Hard Rock Stadium", city: "Miami", country: "Estados Unidos", lat: 25.9580, lng: -80.2389 },
  { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "Estados Unidos", lat: 39.0489, lng: -94.4839 },
];

export async function getStadiums(): Promise<Stadium[]> {
  return stadiumsMock;
}