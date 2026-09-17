import { ParkingSpot } from '../types';

// On-device parking dataset. Coordinates are placed around the KMUTNB area.
// Replace these entries with official parking data if your instructor later provides it.
export const initialParkingData: ParkingSpot[] = [
  {
    id: 'P1', name: 'Engineering Parking', shortName: 'Engineering', zone: 'Zone A',
    latitude: 13.81958, longitude: 100.51488, total: 96, available: 38,
    vehicles: ['car', 'motorcycle', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 4, openTime: '06:00', closeTime: '22:00',
    description: 'Covered parking near the engineering area with CCTV, accessible bays and EV charging.',
    accent: '#B9323C'
  },
  {
    id: 'P2', name: 'Library Parking Deck', shortName: 'Library Deck', zone: 'Zone B',
    latitude: 13.82042, longitude: 100.51416, total: 72, available: 11,
    vehicles: ['car', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 2, openTime: '07:00', closeTime: '21:00',
    description: 'Covered parking deck with easy access to the library and nearby study areas.',
    accent: '#A74A52'
  },
  {
    id: 'P3', name: 'North Gate Parking', shortName: 'North Gate', zone: 'Zone C',
    latitude: 13.82105, longitude: 100.51520, total: 120, available: 54,
    vehicles: ['car', 'motorcycle'], covered: false, cctv: true, accessible: true,
    evChargers: 0, openTime: '05:30', closeTime: '23:00',
    description: 'Large open-air parking area with quick access from the north entrance.',
    accent: '#9B2932'
  },
  {
    id: 'P4', name: 'Innovation Hub Parking', shortName: 'Innovation Hub', zone: 'Zone D',
    latitude: 13.81893, longitude: 100.51605, total: 58, available: 19,
    vehicles: ['car', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 6, openTime: '06:30', closeTime: '22:30',
    description: 'Compact covered parking with convenient EV charging and CCTV coverage.',
    accent: '#C05259'
  },
  {
    id: 'P5', name: 'Student Center Parking', shortName: 'Student Center', zone: 'Zone E',
    latitude: 13.81836, longitude: 100.51458, total: 84, available: 5,
    vehicles: ['car', 'motorcycle'], covered: false, cctv: true, accessible: false,
    evChargers: 0, openTime: '06:00', closeTime: '20:30',
    description: 'Parking near student activity spaces, food areas and common facilities.',
    accent: '#B45D61'
  },
  {
    id: 'P6', name: 'Sports Complex Parking', shortName: 'Sports Complex', zone: 'Zone F',
    latitude: 13.81792, longitude: 100.51562, total: 140, available: 63,
    vehicles: ['car', 'motorcycle'], covered: false, cctv: false, accessible: true,
    evChargers: 0, openTime: '05:00', closeTime: '23:30',
    description: 'Large parking area suited to busy periods when central parking is crowded.',
    accent: '#812128'
  },
  {
    id: 'P7', name: 'Workshop Building Parking', shortName: 'Workshop', zone: 'Zone G',
    latitude: 13.81902, longitude: 100.51364, total: 48, available: 0,
    vehicles: ['car', 'motorcycle'], covered: true, cctv: true, accessible: false,
    evChargers: 0, openTime: '07:00', closeTime: '19:00',
    description: 'Small covered parking area close to workshop and laboratory buildings.',
    accent: '#7A2027'
  },
  {
    id: 'P8', name: 'South Gate Parking', shortName: 'South Gate', zone: 'Zone H',
    latitude: 13.81748, longitude: 100.51390, total: 110, available: 27,
    vehicles: ['car', 'motorcycle', 'ev'], covered: false, cctv: true, accessible: true,
    evChargers: 2, openTime: '05:30', closeTime: '23:00',
    description: 'Flexible parking for cars, motorcycles and EVs near the south entrance.',
    accent: '#A33640'
  },
  {
    id: 'P9', name: 'Research Center Parking', shortName: 'Research Center', zone: 'Zone I',
    latitude: 13.82020, longitude: 100.51642, total: 64, available: 22,
    vehicles: ['car', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 3, openTime: '06:00', closeTime: '21:30',
    description: 'Quiet covered parking with accessible bays, CCTV and EV charging.',
    accent: '#C35B62'
  },
  {
    id: 'P10', name: 'Visitor Parking', shortName: 'Visitor', zone: 'Zone J',
    latitude: 13.82076, longitude: 100.51335, total: 44, available: 14,
    vehicles: ['car'], covered: false, cctv: true, accessible: true,
    evChargers: 0, openTime: '07:00', closeTime: '20:00',
    description: 'Visitor parking with clear access, CCTV coverage and accessible bays.',
    accent: '#963039'
  }
];

export const PARKING_CENTER = { latitude: 13.819552, longitude: 100.514812 };
