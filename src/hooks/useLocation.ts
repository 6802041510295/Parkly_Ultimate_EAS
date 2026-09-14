import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';
import { DEMO_CENTER } from '../data/parkingData';

export function useUserLocation() {
  const [coordinate, setCoordinate] = useState<Coordinate>(DEMO_CENTER);
  const [address, setAddress] = useState('KMUTNB demo center');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setUsingFallback(true);
        setCoordinate(DEMO_CENTER);
        setAddress('Location permission denied — using KMUTNB demo center');
        setError('Location permission was not granted. The app is still usable with demo coordinates.');
        return;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setCoordinate(next);
      setUsingFallback(false);

      try {
        const places = await Location.reverseGeocodeAsync(next);
        const place = places[0];
        const formatted = [place?.name, place?.street, place?.district, place?.city || place?.subregion, place?.region]
          .filter(Boolean)
          .join(', ');
        setAddress(formatted || 'Current location');
      } catch {
        setAddress('Current location');
      }
    } catch {
      setUsingFallback(true);
      setCoordinate(DEMO_CENTER);
      setAddress('KMUTNB demo center');
      setError('Could not read GPS. Using demo coordinates instead.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coordinate, address, loading, usingFallback, error, refresh };
}
