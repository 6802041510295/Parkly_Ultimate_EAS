import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParkingSpot, Coordinate } from '../types';
import { COLORS, SHADOW } from '../theme';
import { distanceKm, formatDistance } from '../utils/distance';
import { getStatus, occupancyPercent, statusMeta } from '../utils/parking';

export default function ParkingCard({
  spot,
  user,
  favorite,
  onPress,
  onFavorite,
  compact = false,
}: {
  spot: ParkingSpot;
  user: Coordinate;
  favorite: boolean;
  onPress: () => void;
  onFavorite: () => void;
  compact?: boolean;
}) {
  const meta = statusMeta(getStatus(spot));
  const distance = formatDistance(distanceKm(user, { latitude: spot.latitude, longitude: spot.longitude }));
  const occupied = occupancyPercent(spot);

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${spot.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.cover, { backgroundColor: spot.accent }, pressed && styles.pressed]}
      >
        <View style={styles.zonePill}><Text style={styles.zoneText}>{spot.zone}</Text></View>
        <Text style={styles.bigP}>P</Text>
        <View style={styles.availableBubble}>
          <Text style={styles.availableNumber}>{spot.available}</Text>
          <Text style={styles.availableLabel}>FREE</Text>
        </View>
      </Pressable>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.titlePress, pressed && styles.pressed]}>
            <Text numberOfLines={1} style={styles.title}>{spot.shortName}</Text>
            <Text style={styles.sub}>{distance} away · {spot.openTime}–{spot.closeTime}</Text>
          </Pressable>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={favorite ? `Remove ${spot.name} from favorites` : `Save ${spot.name} to favorites`}
            accessibilityState={{ selected: favorite }}
            activeOpacity={0.72}
            onPress={onFavorite}
            style={[styles.heart, favorite && styles.heartActive]}
          >
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={20} color={favorite ? '#FFF' : COLORS.wine} />
          </TouchableOpacity>
        </View>

        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.statusPress, pressed && styles.pressed]}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.status, { color: meta.color }]}>{meta.label}</Text>
            <Text style={styles.slots}>{spot.available}/{spot.total} spaces</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${occupied}%`, backgroundColor: meta.color }]} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.paper, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  compact: { width: 248 },
  pressed: { opacity: 0.82 },
  cover: { height: 118, padding: 14, justifyContent: 'space-between', overflow: 'hidden' },
  zonePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  zoneText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  bigP: { position: 'absolute', right: 12, top: -16, color: 'rgba(255,255,255,0.14)', fontSize: 118, lineHeight: 128, fontWeight: '900' },
  availableBubble: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFF8ED', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  availableNumber: { color: COLORS.wineDeep, fontSize: 22, lineHeight: 23, fontWeight: '900' },
  availableLabel: { color: COLORS.red, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  body: { padding: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titlePress: { flex: 1, minHeight: 44, justifyContent: 'center' },
  title: { color: COLORS.text, fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  heart: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.blush2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', zIndex: 5, elevation: 4 },
  heartActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  statusPress: { marginTop: 3, paddingTop: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  status: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  slots: { color: COLORS.muted, fontSize: 9, marginLeft: 'auto' },
  progressTrack: { height: 5, borderRadius: 99, backgroundColor: '#F0DFD2', marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
});
