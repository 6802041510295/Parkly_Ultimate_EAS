import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ParkingSpot, Coordinate } from '../types';
import { COLORS } from '../theme';
import { distanceKm, formatDistance } from '../utils/distance';
import { getStatus, occupancyPercent, statusMeta } from '../utils/parking';

export default function DetailModal({ spot, user, favorite, onFavorite, onClose }: { spot: ParkingSpot | null; user: Coordinate; favorite: boolean; onFavorite: () => void; onClose: () => void }) {
  if (!spot) return null;
  const meta = statusMeta(getStatus(spot));
  const distance = formatDistance(distanceKm(user, { latitude: spot.latitude, longitude: spot.longitude }));
  const occupied = occupancyPercent(spot);
  const navigate = () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}&travelmode=driving`);

  const features = [
    spot.covered && ['umbrella-outline', 'Covered'],
    spot.cctv && ['videocam-outline', 'CCTV'],
    spot.accessible && ['accessibility-outline', 'Accessible'],
    spot.evChargers > 0 && ['flash-outline', `${spot.evChargers} EV chargers`],
  ].filter(Boolean) as [keyof typeof Ionicons.glyphMap, string][];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
            <LinearGradient colors={[spot.accent, COLORS.wineDeep]} style={styles.hero}>
              <View style={styles.heroTop}><View style={styles.zone}><Text style={styles.zoneText}>{spot.zone}</Text></View><Pressable onPress={onFavorite} style={styles.heroIcon}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color="#FFF" /></Pressable></View>
              <Text style={styles.heroP}>P</Text>
              <Text style={styles.title}>{spot.name}</Text>
              <Text style={styles.description}>{spot.description}</Text>
              <View style={styles.metricRow}>
                <View style={styles.metric}><Text style={styles.metricValue}>{spot.available}</Text><Text style={styles.metricLabel}>FREE</Text></View>
                <View style={styles.metric}><Text style={styles.metricValue}>{distance}</Text><Text style={styles.metricLabel}>FROM YOU</Text></View>
                <View style={styles.metric}><Text style={styles.metricValue}>{occupied}%</Text><Text style={styles.metricLabel}>OCCUPIED</Text></View>
              </View>
            </LinearGradient>

            <View style={styles.body}>
              <View style={[styles.statusBox, { backgroundColor: meta.soft }]}><View style={[styles.statusDot, { backgroundColor: meta.color }]} /><Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text><Text style={styles.statusRight}>{spot.available} of {spot.total} spaces free</Text></View>
              <Text style={styles.sectionTitle}>Parking availability</Text>
              <View style={styles.capacityLine}><Text style={styles.capacityLarge}>{spot.total - spot.available}</Text><Text style={styles.capacitySmall}> occupied</Text><Text style={styles.capacitySpacer}>/</Text><Text style={[styles.capacityLarge, { color: COLORS.green }]}>{spot.available}</Text><Text style={styles.capacitySmall}> free</Text></View>
              <View style={styles.progress}><View style={[styles.progressFill, { width: `${occupied}%`, backgroundColor: meta.color }]} /></View>

              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.featureWrap}>{features.map(([icon, label]) => <View key={label} style={styles.feature}><Ionicons name={icon} size={17} color={COLORS.wine} /><Text style={styles.featureText}>{label}</Text></View>)}</View>

              <View style={styles.infoGrid}>
                <View style={styles.infoCard}><Ionicons name="time-outline" size={21} color={COLORS.wine} /><Text style={styles.infoLabel}>OPEN HOURS</Text><Text style={styles.infoValue}>{spot.openTime} – {spot.closeTime}</Text></View>
                <View style={styles.infoCard}><Ionicons name="car-sport-outline" size={21} color={COLORS.wine} /><Text style={styles.infoLabel}>VEHICLES</Text><Text style={styles.infoValue}>{spot.vehicles.map(v => v === 'ev' ? 'EV' : v[0].toUpperCase() + v.slice(1)).join(' · ')}</Text></View>
              </View>

              <Pressable onPress={navigate} style={styles.navigate}><Ionicons name="navigate" size={19} color="#FFF" /><Text style={styles.navigateText}>Navigate with Google Maps</Text></Pressable>
              <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>Close details</Text></Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(42,20,20,0.38)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', backgroundColor: COLORS.paper, borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden' },
  handle: { width: 48, height: 5, borderRadius: 99, backgroundColor: '#D9BBA9', alignSelf: 'center', marginVertical: 10 },
  hero: { marginHorizontal: 12, borderRadius: 28, padding: 20, minHeight: 245, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  zone: { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 },
  zoneText: { color: '#FFF', fontWeight: '900', fontSize: 9, letterSpacing: 0.8 },
  heroIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroP: { position: 'absolute', right: 10, top: 20, fontSize: 180, lineHeight: 185, color: 'rgba(255,255,255,0.08)', fontWeight: '900' },
  title: { color: '#FFF8EF', fontWeight: '900', fontSize: 27, letterSpacing: -0.8, marginTop: 20 },
  description: { color: '#F5D9D1', lineHeight: 18, fontSize: 11, maxWidth: '85%', marginTop: 7 },
  metricRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  metric: { flex: 1, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 16, padding: 10 },
  metricValue: { color: '#FFF', fontWeight: '900', fontSize: 17 },
  metricLabel: { color: '#F5D3CA', fontWeight: '800', fontSize: 7, letterSpacing: 0.7, marginTop: 2 },
  body: { padding: 20 },
  statusBox: { height: 45, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statusRight: { marginLeft: 'auto', color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  sectionTitle: { color: COLORS.text, fontWeight: '900', fontSize: 17, marginTop: 22, marginBottom: 10 },
  capacityLine: { flexDirection: 'row', alignItems: 'baseline' },
  capacityLarge: { color: COLORS.wine, fontSize: 26, fontWeight: '900' },
  capacitySmall: { color: COLORS.muted, fontSize: 10 },
  capacitySpacer: { color: '#C8AA9A', fontSize: 18, marginHorizontal: 8 },
  progress: { height: 8, backgroundColor: '#F0DED2', borderRadius: 99, overflow: 'hidden', marginTop: 10 },
  progressFill: { height: '100%', borderRadius: 99 },
  featureWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.blush2, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9 },
  featureText: { color: COLORS.wineDeep, fontSize: 10, fontWeight: '800' },
  infoGrid: { flexDirection: 'row', gap: 10, marginTop: 20 },
  infoCard: { flex: 1, backgroundColor: COLORS.cream2, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  infoLabel: { color: COLORS.muted, fontWeight: '900', fontSize: 8, letterSpacing: 0.6, marginTop: 9 },
  infoValue: { color: COLORS.text, fontWeight: '800', fontSize: 11, marginTop: 4 },
  navigate: { height: 54, borderRadius: 18, backgroundColor: COLORS.wine, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  navigateText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  close: { height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  closeText: { color: COLORS.muted, fontWeight: '800', fontSize: 11 },
});
