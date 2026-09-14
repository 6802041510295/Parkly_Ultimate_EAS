import { ParkingSpot } from '../types';

// Demo data for the mini project. Coordinates are placed around the KMUTNB area
// so the map is easy to demonstrate. Replace any item here with your real data later.
export const initialParkingData: ParkingSpot[] = [
  {
    id: 'P1', name: 'Engineering Parking', shortName: 'Engineering', zone: 'Zone A',
    latitude: 13.81958, longitude: 100.51488, total: 96, available: 38,
    vehicles: ['car', 'motorcycle', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 4, openTime: '06:00', closeTime: '22:00',
    description: 'Premium demo parking near the engineering area with covered bays and EV charging.',
    accent: '#B9323C'
  },
  {
    id: 'P2', name: 'Library Parking Deck', shortName: 'Library Deck', zone: 'Zone B',
    latitude: 13.82042, longitude: 100.51416, total: 72, available: 11,
    vehicles: ['car', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 2, openTime: '07:00', closeTime: '21:00',
    description: 'Covered parking deck with easy access to the library and study areas.',
    accent: '#A74A52'
  },
  {
    id: 'P3', name: 'North Gate Parking', shortName: 'North Gate', zone: 'Zone C',
    latitude: 13.82105, longitude: 100.51520, total: 120, available: 54,
    vehicles: ['car', 'motorcycle'], covered: false, cctv: true, accessible: true,
    evChargers: 0, openTime: '05:30', closeTime: '23:00',
    description: 'Large open-air demo lot with fast access from the north entrance.',
    accent: '#9B2932'
  },
  {
    id: 'P4', name: 'Innovation Hub Parking', shortName: 'Innovation Hub', zone: 'Zone D',
    latitude: 13.81893, longitude: 100.51605, total: 58, available: 19,
    vehicles: ['car', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 6, openTime: '06:30', closeTime: '22:30',
    description: 'Compact smart parking area with the highest number of EV demo chargers.',
    accent: '#C05259'
  },
  {
    id: 'P5', name: 'Student Center Parking', shortName: 'Student Center', zone: 'Zone E',
    latitude: 13.81836, longitude: 100.51458, total: 84, available: 5,
    vehicles: ['car', 'motorcycle'], covered: false, cctv: true, accessible: false,
    evChargers: 0, openTime: '06:00', closeTime: '20:30',
    description: 'Busy demo parking near student activity spaces and food areas.',
    accent: '#B45D61'
  },
  {
    id: 'P6', name: 'Sports Complex Parking', shortName: 'Sports Complex', zone: 'Zone F',
    latitude: 13.81792, longitude: 100.51562, total: 140, available: 63,
    vehicles: ['car', 'motorcycle'], covered: false, cctv: false, accessible: true,
    evChargers: 0, openTime: '05:00', closeTime: '23:30',
    description: 'The largest demo parking area, ideal when central parking is crowded.',
    accent: '#812128'
  },
  {
    id: 'P7', name: 'Workshop Building Parking', shortName: 'Workshop', zone: 'Zone G',
    latitude: 13.81902, longitude: 100.51364, total: 48, available: 0,
    vehicles: ['car', 'motorcycle'], covered: true, cctv: true, accessible: false,
    evChargers: 0, openTime: '07:00', closeTime: '19:00',
    description: 'Small covered demo lot currently marked full to demonstrate status logic.',
    accent: '#7A2027'
  },
  {
    id: 'P8', name: 'South Gate Parking', shortName: 'South Gate', zone: 'Zone H',
    latitude: 13.81748, longitude: 100.51390, total: 110, available: 27,
    vehicles: ['car', 'motorcycle', 'ev'], covered: false, cctv: true, accessible: true,
    evChargers: 2, openTime: '05:30', closeTime: '23:00',
    description: 'Flexible demo parking for cars, motorcycles and EVs near the south entrance.',
    accent: '#A33640'
  },
  {
    id: 'P9', name: 'Research Center Parking', shortName: 'Research Center', zone: 'Zone I',
    latitude: 13.82020, longitude: 100.51642, total: 64, available: 22,
    vehicles: ['car', 'ev'], covered: true, cctv: true, accessible: true,
    evChargers: 3, openTime: '06:00', closeTime: '21:30',
    description: 'Quiet covered demo parking with accessible bays and EV charging.',
    accent: '#C35B62'
  },
  {
    id: 'P10', name: 'Visitor Parking', shortName: 'Visitor', zone: 'Zone J',
    latitude: 13.82076, longitude: 100.51335, total: 44, available: 14,
    vehicles: ['car'], covered: false, cctv: true, accessible: true,
    evChargers: 0, openTime: '07:00', closeTime: '20:00',
    description: 'Simple demo visitor parking with clear access and CCTV coverage.',
    accent: '#963039'
  }
];

export const DEMO_CENTER = { latitude: 13.819552, longitude: 100.514812 };
