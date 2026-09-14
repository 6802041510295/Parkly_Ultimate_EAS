import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ParkingSpot, Coordinate } from '../types';
import { getStatus, statusMeta } from '../utils/parking';
import { COLORS } from '../theme';

export default function ParkingMap({ spots, selected, onSelect }: { spots: ParkingSpot[]; selected: ParkingSpot | null; user: Coordinate; onSelect: (spot: ParkingSpot) => void; recenterToken: number }) {
  return (
    <View style={styles.root}>
      <View style={styles.roadH} /><View style={styles.roadV} /><View style={styles.roadH2} /><View style={styles.roadV2} />
      <Text style={styles.note}>WEB PREVIEW · Native Google Maps appears in the Android APK</Text>
      {spots.slice(0, 8).map((spot, index) => {
        const meta = statusMeta(getStatus(spot));
        const positions = [[18,20],[58,18],[32,38],[70,42],[14,59],[53,62],[78,70],[35,78]];
        const [left, top] = positions[index];
        return (
          <Text key={spot.id} onPress={() => onSelect(spot)} style={[styles.pin, { left: `${left}%`, top: `${top}%`, backgroundColor: meta.color }, selected?.id === spot.id && styles.active]}>
            {spot.available} · P
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E4D2', overflow: 'hidden' },
  roadH: { position: 'absolute', height: 34, left: -20, right: -20, top: '35%', backgroundColor: '#FFFDF8', transform: [{ rotate: '-8deg' }] },
  roadH2: { position: 'absolute', height: 26, left: -20, right: -20, top: '68%', backgroundColor: '#FFFDF8', transform: [{ rotate: '12deg' }] },
  roadV: { position: 'absolute', width: 38, top: -20, bottom: -20, left: '45%', backgroundColor: '#FFFDF8', transform: [{ rotate: '4deg' }] },
  roadV2: { position: 'absolute', width: 24, top: -20, bottom: -20, left: '72%', backgroundColor: '#FFFDF8', transform: [{ rotate: '-6deg' }] },
  note: { position: 'absolute', left: 14, top: 14, color: COLORS.wine, fontWeight: '900', fontSize: 9, backgroundColor: '#FFF8ED', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99 },
  pin: { position: 'absolute', color: '#FFF', fontWeight: '900', fontSize: 11, paddingHorizontal: 9, paddingVertical: 8, borderRadius: 14, overflow: 'hidden' },
  active: { borderWidth: 3, borderColor: COLORS.wineDeep },
});
