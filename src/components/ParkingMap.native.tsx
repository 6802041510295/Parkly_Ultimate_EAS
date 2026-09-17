import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const loadedRef = useRef(false);
  const [showLoadHelp, setShowLoadHelp] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const target = selected
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : user;
    ref.current?.animateToRegion({ ...target, latitudeDelta: 0.009, longitudeDelta: 0.009 }, 480);
  }, [selected, recenterToken, user.latitude, user.longitude]);

  useEffect(() => {
    loadedRef.current = false;
    setMapLoaded(false);
    setShowLoadHelp(false);
    const timer = setTimeout(() => {
      if (!loadedRef.current) setShowLoadHelp(true);
    }, 6500);
    return () => clearTimeout(timer);
  }, [reloadKey]);

  const retry = () => {
    setReloadKey((value) => value + 1);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        key={reloadKey}
        ref={ref}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={{ ...user, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
        showsUserLocation
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass
        showsScale={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingBackgroundColor={COLORS.cream}
        loadingIndicatorColor={COLORS.wine}
        moveOnMarkerPress={false}
        onMapLoaded={() => { loadedRef.current = true; setMapLoaded(true); setShowLoadHelp(false); }}
        onMapReady={() => setShowLoadHelp(false)}
        mapPadding={{ top: 110, right: 12, bottom: 180, left: 12 }}
      >
        {spots.map((spot) => {
          const meta = statusMeta(getStatus(spot));
          const active = selected?.id === spot.id;
          return (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              onPress={() => onSelect(spot)}
              tracksViewChanges={false}
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

      {!mapLoaded && !showLoadHelp ? (
        <View pointerEvents="none" style={styles.loadingCard}>
          <ActivityIndicator size="small" color={COLORS.wine} />
          <Text style={styles.loadingText}>Loading Google Maps…</Text>
        </View>
      ) : null}

      {showLoadHelp ? (
        <View style={styles.helpCard}>
          <View style={styles.helpIcon}><Ionicons name="map-outline" size={20} color={COLORS.wine} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>Map tiles are taking too long</Text>
            <Text style={styles.helpText}>Retry now. If you are testing in Expo Go, also test the EAS APK because your Android-restricted Google Maps key is applied to the built app.</Text>
          </View>
          <Pressable onPress={retry} style={styles.retry}><Ionicons name="refresh" size={18} color="#FFF" /></Pressable>
        </View>
      ) : null}
    </View>
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
  loadingCard: { position: 'absolute', top: '46%', alignSelf: 'center', flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: COLORS.paper, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  loadingText: { color: COLORS.wineDeep, fontSize: 10, fontWeight: '800' },
  helpCard: { position: 'absolute', left: 18, right: 18, top: '42%', flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: COLORS.paper, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  helpIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blush2 },
  helpTitle: { color: COLORS.text, fontSize: 11, fontWeight: '900' },
  helpText: { color: COLORS.muted, fontSize: 8.5, lineHeight: 13, marginTop: 2 },
  retry: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.wine, alignItems: 'center', justifyContent: 'center' },
});
