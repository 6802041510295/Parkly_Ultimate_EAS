import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ParkingSpot, Coordinate } from '../types';
import { getStatus, statusMeta } from '../utils/parking';
import { COLORS, SHADOW } from '../theme';

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F8E9D0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#74564D' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFF7EA' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#F3DDC8' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFDF8' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E7CDBA' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F3D2C1' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#EAD3C3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DDE8E3' }] },
];

export type ParkingMapHandle = MapView;

export default function ParkingMap({
  spots,
  selected,
  user,
  onSelect,
  recenterToken,
}: {
  spots: ParkingSpot[];
  selected: ParkingSpot | null;
  user: Coordinate;
  onSelect: (spot: ParkingSpot) => void;
  recenterToken: number;
}) {
  const ref = useRef<MapView>(null);

  useEffect(() => {
    const target = selected
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : user;
    ref.current?.animateToRegion({ ...target, latitudeDelta: 0.009, longitudeDelta: 0.009 }, 480);
  }, [selected, recenterToken, user.latitude, user.longitude]);

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mapStyle}
      initialRegion={{ ...user, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      loadingEnabled
      loadingBackgroundColor={COLORS.cream}
      loadingIndicatorColor={COLORS.wine}
    >
      {spots.map((spot) => {
        const meta = statusMeta(getStatus(spot));
        const active = selected?.id === spot.id;
        return (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            onPress={() => onSelect(spot)}
          >
            <View style={[styles.markerWrap, active && styles.markerWrapActive]}>
              <View style={[styles.marker, { backgroundColor: meta.color }, active && styles.markerActive]}>
                <Text style={styles.count}>{spot.available}</Text>
                <Text style={styles.p}>P</Text>
              </View>
              <View style={[styles.tip, { borderTopColor: meta.color }]} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerWrap: { alignItems: 'center', ...SHADOW },
  markerWrapActive: { transform: [{ scale: 1.12 }] },
  marker: {
    minWidth: 46, height: 54, borderRadius: 17, paddingHorizontal: 8,
    borderWidth: 3, borderColor: '#FFF9F0', alignItems: 'center', justifyContent: 'center',
  },
  markerActive: { borderColor: COLORS.wineDeep, borderWidth: 3 },
  count: { color: '#FFF', fontSize: 11, fontWeight: '900', lineHeight: 14 },
  p: { color: '#FFF', fontSize: 20, fontWeight: '900', lineHeight: 21 },
  tip: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
});
