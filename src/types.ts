export type VehicleType = 'car' | 'motorcycle' | 'ev';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type ParkingSpot = {
  id: string;
  name: string;
  shortName: string;
  zone: string;
  latitude: number;
  longitude: number;
  total: number;
  available: number;
  vehicles: VehicleType[];
  covered: boolean;
  cctv: boolean;
  accessible: boolean;
  evChargers: number;
  openTime: string;
  closeTime: string;
  description: string;
  accent: string;
};
