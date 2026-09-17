import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';
import { PARKING_CENTER } from '../data/parkingData';

export function useUserLocation() {
  const [coordinate, setCoordinate] = useState<Coordinate>(PARKING_CENTER);
  const [address, setAddress] = useState('KMUTNB area');
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
        setCoordinate(PARKING_CENTER);
        setAddress('KMUTNB area');
        setError('Location permission is off. Enable it in App settings to use live GPS distance.');
        return;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
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
      setCoordinate(PARKING_CENTER);
      setAddress('KMUTNB area');
      setError('Could not read GPS right now. Parkly is using the default map center.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coordinate, address, loading, usingFallback, error, refresh };
}
