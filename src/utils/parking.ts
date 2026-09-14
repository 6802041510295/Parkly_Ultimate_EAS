import { COLORS } from '../theme';
import { Coordinate, ParkingSpot } from '../types';
import { distanceKm } from './distance';

export type ParkingStatus = 'AVAILABLE' | 'LIMITED' | 'FULL';

export function getStatus(spot: ParkingSpot): ParkingStatus {
  if (spot.available <= 0) return 'FULL';
  const ratio = spot.available / Math.max(1, spot.total);
  if (ratio <= 0.2) return 'LIMITED';
  return 'AVAILABLE';
}

export function statusMeta(status: ParkingStatus) {
  if (status === 'FULL') return { label: 'FULL', color: COLORS.danger, soft: '#FBE1E0' };
  if (status === 'LIMITED') return { label: 'ALMOST FULL', color: COLORS.amber, soft: '#FFF0D4' };
  return { label: 'AVAILABLE', color: COLORS.green, soft: '#DFF4E8' };
}

export function occupancyPercent(spot: ParkingSpot) {
  return Math.round(((spot.total - spot.available) / Math.max(1, spot.total)) * 100);
}

export function recommendationScore(spot: ParkingSpot, user: Coordinate) {
  if (spot.available <= 0) return -999;
  const km = distanceKm(user, { latitude: spot.latitude, longitude: spot.longitude });
  const availabilityRatio = spot.available / Math.max(1, spot.total);
  const distanceScore = 1 / (1 + km * 3.4);
  const facilityBonus = (spot.covered ? 0.05 : 0) + (spot.cctv ? 0.03 : 0) + (spot.evChargers > 0 ? 0.02 : 0);
  return availabilityRatio * 0.55 + distanceScore * 0.45 + facilityBonus;
}
