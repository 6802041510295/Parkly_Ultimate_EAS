import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ParkingSpot, Coordinate } from '../types';
import { COLORS } from '../theme';
import { distanceKm, formatDistance } from '../utils/distance';
import { getStatus, occupancyPercent, statusMeta } from '../utils/parking';

type TravelMode = 'driving' | 'walking';

export default function DetailModal({
  spot,
  user,
  favorite,
  onFavorite,
  onClose,
  bottomInset = 0,
}: {
  spot: ParkingSpot | null;
  user: Coordinate;
  favorite: boolean;
  onFavorite: () => void;
  onClose: () => void;
  bottomInset?: number;
}) {
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');

  if (!spot) return null;

  const meta = statusMeta(getStatus(spot));
  const km = distanceKm(user, { latitude: spot.latitude, longitude: spot.longitude });
  const distance = formatDistance(km);
  const occupied = occupancyPercent(spot);
  const eta = travelMode === 'walking' ? Math.max(1, Math.round((km / 4.8) * 60)) : Math.max(1, Math.round((km / 22) * 60));
  const openNow = isOpenNow(spot.openTime, spot.closeTime);

  const features = [
    spot.covered && ['umbrella-outline', 'Covered'],
    spot.cctv && ['videocam-outline', 'CCTV'],
    spot.accessible && ['accessibility-outline', 'Accessible'],
    spot.evChargers > 0 && ['flash-outline', `${spot.evChargers} EV chargers`],
  ].filter(Boolean) as [keyof typeof Ionicons.glyphMap, string][];

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}&travelmode=${travelMode}`;

  const navigate = async () => {
    try {
      const supported = await Linking.canOpenURL(mapsUrl);
      if (!supported) throw new Error('Maps URL is not supported');
      await Linking.openURL(mapsUrl);
    } catch {
      Alert.alert('Could not open Google Maps', 'Please make sure a browser or Google Maps is available on this phone.');
    }
  };

  const shareSpot = async () => {
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
    try {
      await Share.share({ message: `${spot.name}\n${spot.available} of ${spot.total} spaces free\n${shareUrl}` });
    } catch {
      Alert.alert('Could not share', 'Please try again.');
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close parking details" />
        <View style={[styles.sheet, { paddingBottom: Math.max(bottomInset, 8) }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <LinearGradient colors={[spot.accent, COLORS.wineDeep]} style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.zone}><Text style={styles.zoneText}>{spot.zone}</Text></View>
                <View style={styles.heroActions}>
                  <TouchableOpacity onPress={shareSpot} activeOpacity={0.7} style={styles.heroIcon} accessibilityLabel="Share parking">
                    <Ionicons name="share-social-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onFavorite}
                    activeOpacity={0.7}
                    style={[styles.heroIcon, favorite && styles.heroIconFavorite]}
                    accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
                    accessibilityState={{ selected: favorite }}
                  >
                    <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.heroIcon} accessibilityLabel="Close details">
                    <Ionicons name="close" size={22} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.heroP}>P</Text>
              <Text style={styles.title}>{spot.name}</Text>
              <Text style={styles.description}>{spot.description}</Text>

              {favorite ? (
                <View style={styles.savedPill}><Ionicons name="heart" size={13} color="#FFF" /><Text style={styles.savedPillText}>SAVED</Text></View>
              ) : null}

              <View style={styles.metricRow}>
                <View style={styles.metric}><Text style={styles.metricValue}>{spot.available}</Text><Text style={styles.metricLabel}>FREE</Text></View>
                <View style={styles.metric}><Text style={styles.metricValue}>{distance}</Text><Text style={styles.metricLabel}>FROM YOU</Text></View>
                <View style={styles.metric}><Text style={styles.metricValue}>{occupied}%</Text><Text style={styles.metricLabel}>OCCUPIED</Text></View>
              </View>
            </LinearGradient>

            <View style={styles.body}>
              <View style={styles.statusRowWrap}>
                <View style={[styles.statusBox, { backgroundColor: meta.soft }]}>
                  <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                  <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.statusRight}>{spot.available} of {spot.total} free</Text>
                </View>
                <View style={[styles.openBadge, { backgroundColor: openNow ? '#DFF4E8' : '#FBE1E0' }]}>
                  <Ionicons name={openNow ? 'time-outline' : 'moon-outline'} size={14} color={openNow ? COLORS.green : COLORS.danger} />
                  <Text style={[styles.openBadgeText, { color: openNow ? COLORS.green : COLORS.danger }]}>{openNow ? 'OPEN NOW' : 'CLOSED'}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Parking availability</Text>
              <View style={styles.capacityLine}>
                <Text style={styles.capacityLarge}>{spot.total - spot.available}</Text><Text style={styles.capacitySmall}> occupied</Text>
                <Text style={styles.capacitySpacer}>/</Text>
                <Text style={[styles.capacityLarge, { color: COLORS.green }]}>{spot.available}</Text><Text style={styles.capacitySmall}> free</Text>
              </View>
              <View style={styles.progress}><View style={[styles.progressFill, { width: `${occupied}%`, backgroundColor: meta.color }]} /></View>

              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.featureWrap}>
                {features.length > 0 ? features.map(([icon, label]) => (
                  <View key={label} style={styles.feature}><Ionicons name={icon} size={17} color={COLORS.wine} /><Text style={styles.featureText}>{label}</Text></View>
                )) : <Text style={styles.noFeature}>No extra facilities listed.</Text>}
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoCard}><Ionicons name="time-outline" size={21} color={COLORS.wine} /><Text style={styles.infoLabel}>OPEN HOURS</Text><Text style={styles.infoValue}>{spot.openTime} – {spot.closeTime}</Text></View>
                <View style={styles.infoCard}><Ionicons name="car-sport-outline" size={21} color={COLORS.wine} /><Text style={styles.infoLabel}>VEHICLES</Text><Text style={styles.infoValue}>{spot.vehicles.map(v => v === 'ev' ? 'EV' : v[0].toUpperCase() + v.slice(1)).join(' · ')}</Text></View>
              </View>

              <Text style={styles.sectionTitle}>Navigation</Text>
              <View style={styles.modeRow}>
                <ModeButton icon="car-outline" label="Drive" sub={`~${Math.max(1, Math.round((km / 22) * 60))} min`} active={travelMode === 'driving'} onPress={() => setTravelMode('driving')} />
                <ModeButton icon="walk-outline" label="Walk" sub={`~${Math.max(1, Math.round((km / 4.8) * 60))} min`} active={travelMode === 'walking'} onPress={() => setTravelMode('walking')} />
              </View>

              <TouchableOpacity onPress={navigate} activeOpacity={0.8} style={styles.navigate}>
                <Ionicons name="navigate" size={19} color="#FFF" />
                <View><Text style={styles.navigateText}>Navigate with Google Maps</Text><Text style={styles.navigateSub}>{travelMode === 'driving' ? 'Driving' : 'Walking'} · about {eta} min</Text></View>
                <Ionicons name="open-outline" size={18} color="#FFF" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={styles.close}><Text style={styles.closeText}>Close details</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ModeButton({ icon, label, sub, active, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Ionicons name={icon} size={19} color={active ? '#FFF' : COLORS.wine} />
      <View><Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{label}</Text><Text style={[styles.modeSub, active && styles.modeSubActive]}>{sub}</Text></View>
    </TouchableOpacity>
  );
}

function isOpenNow(openTime: string, closeTime: string) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const parse = (value: string) => {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  };
  const open = parse(openTime);
  const close = parse(closeTime);
  if (close >= open) return current >= open && current <= close;
  return current >= open || current <= close;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(42,20,20,0.38)', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  sheet: { maxHeight: '92%', backgroundColor: COLORS.paper, borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden', zIndex: 2, elevation: 20 },
  handle: { width: 48, height: 5, borderRadius: 99, backgroundColor: '#D9BBA9', alignSelf: 'center', marginVertical: 10 },
  hero: { marginHorizontal: 12, borderRadius: 28, padding: 20, minHeight: 245, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  heroActions: { flexDirection: 'row', gap: 7, zIndex: 30 },
  zone: { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 },
  zoneText: { color: '#FFF', fontWeight: '900', fontSize: 9, letterSpacing: 0.8 },
  heroIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 30, elevation: 8 },
  heroIconFavorite: { backgroundColor: '#D64A54' },
  heroP: { position: 'absolute', right: 10, top: 20, fontSize: 180, lineHeight: 185, color: 'rgba(255,255,255,0.08)', fontWeight: '900' },
  title: { color: '#FFF8EF', fontWeight: '900', fontSize: 27, letterSpacing: -0.8, marginTop: 20 },
  description: { color: '#F5D9D1', lineHeight: 18, fontSize: 11, maxWidth: '85%', marginTop: 7 },
  savedPill: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 },
  savedPillText: { color: '#FFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  metricRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  metric: { flex: 1, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 16, padding: 10 },
  metricValue: { color: '#FFF', fontWeight: '900', fontSize: 17 },
  metricLabel: { color: '#F5D3CA', fontWeight: '800', fontSize: 7, letterSpacing: 0.7, marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  statusRowWrap: { gap: 8 },
  statusBox: { minHeight: 45, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statusRight: { marginLeft: 'auto', color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  openBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99 },
  openBadgeText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
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
  noFeature: { color: COLORS.muted, fontSize: 10 },
  infoGrid: { flexDirection: 'row', gap: 10, marginTop: 20 },
  infoCard: { flex: 1, backgroundColor: COLORS.cream2, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  infoLabel: { color: COLORS.muted, fontWeight: '900', fontSize: 8, letterSpacing: 0.6, marginTop: 9 },
  infoValue: { color: COLORS.text, fontWeight: '800', fontSize: 11, marginTop: 4 },
  modeRow: { flexDirection: 'row', gap: 9 },
  modeButton: { flex: 1, minHeight: 58, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cream2, flexDirection: 'row', gap: 9, alignItems: 'center', paddingHorizontal: 14 },
  modeButtonActive: { backgroundColor: COLORS.wine, borderColor: COLORS.wine },
  modeLabel: { color: COLORS.wineDeep, fontSize: 11, fontWeight: '900' },
  modeLabelActive: { color: '#FFF' },
  modeSub: { color: COLORS.muted, fontSize: 8, marginTop: 2 },
  modeSubActive: { color: '#F3D2CE' },
  navigate: { minHeight: 58, borderRadius: 18, backgroundColor: COLORS.wine, flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 18, marginTop: 14 },
  navigateText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  navigateSub: { color: '#F4D2CD', fontWeight: '700', fontSize: 8, marginTop: 2 },
  close: { height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  closeText: { color: COLORS.muted, fontWeight: '800', fontSize: 11 },
});
