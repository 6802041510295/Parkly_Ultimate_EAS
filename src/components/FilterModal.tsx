import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SHADOW } from '../theme';
import { VehicleType } from '../types';

export type SortMode = 'recommended' | 'nearest' | 'spaces';

type Props = {
  visible: boolean;
  resultCount: number;
  sortMode: SortMode;
  setSortMode: (value: SortMode) => void;
  vehicle: 'all' | VehicleType;
  setVehicle: (value: 'all' | VehicleType) => void;
  availableOnly: boolean;
  setAvailableOnly: (value: boolean) => void;
  coveredOnly: boolean;
  setCoveredOnly: (value: boolean) => void;
  onClear: () => void;
  onClose: () => void;
  bottomInset?: number;
};

export default function FilterModal(props: Props) {
  const {
    visible, resultCount, sortMode, setSortMode, vehicle, setVehicle,
    availableOnly, setAvailableOnly, coveredOnly, setCoveredOnly,
    onClear, onClose, bottomInset = 0,
  } = props;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(bottomInset, 12) + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>SMART FILTERS</Text>
              <Text style={styles.title}>Find your best spot</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.iconButton}>
              <Ionicons name="close" size={21} color={COLORS.wine} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.section}>Sort by</Text>
            <View style={styles.optionRow}>
              <Option label="Recommended" icon="sparkles-outline" active={sortMode === 'recommended'} onPress={() => setSortMode('recommended')} />
              <Option label="Nearest" icon="navigate-outline" active={sortMode === 'nearest'} onPress={() => setSortMode('nearest')} />
              <Option label="Most spaces" icon="layers-outline" active={sortMode === 'spaces'} onPress={() => setSortMode('spaces')} />
            </View>

            <Text style={styles.section}>Vehicle</Text>
            <View style={styles.optionRow}>
              <Option label="All" icon="apps-outline" active={vehicle === 'all'} onPress={() => setVehicle('all')} />
              <Option label="Car" icon="car-outline" active={vehicle === 'car'} onPress={() => setVehicle('car')} />
              <Option label="Motorcycle" icon="bicycle-outline" active={vehicle === 'motorcycle'} onPress={() => setVehicle('motorcycle')} />
              <Option label="EV" icon="flash-outline" active={vehicle === 'ev'} onPress={() => setVehicle('ev')} />
            </View>

            <Text style={styles.section}>Requirements</Text>
            <ToggleRow icon="checkmark-circle-outline" title="Available only" subtitle="Hide full parking zones" value={availableOnly} onValueChange={setAvailableOnly} />
            <ToggleRow icon="umbrella-outline" title="Covered parking" subtitle="Show weather-protected zones" value={coveredOnly} onValueChange={setCoveredOnly} />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={onClear} style={({ pressed }) => [styles.clear, pressed && { opacity: 0.7 }]}>
              <Ionicons name="refresh-outline" size={17} color={COLORS.wine} />
              <Text style={styles.clearText}>RESET</Text>
            </Pressable>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.apply, pressed && { opacity: 0.85 }]}>
              <Text style={styles.applyText}>SHOW {resultCount} {resultCount === 1 ? 'SPOT' : 'SPOTS'}</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Option({ label, icon, active, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && { opacity: 0.75 }]}>
      <Ionicons name={icon} size={17} color={active ? '#FFF' : COLORS.wine} />
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ icon, title, subtitle, value, onValueChange }: any) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}><Ionicons name={icon} size={20} color={COLORS.wine} /></View>
      <View style={{ flex: 1 }}><Text style={styles.toggleTitle}>{title}</Text><Text style={styles.toggleSub}>{subtitle}</Text></View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#E8D4C7', true: '#C96C72' }} thumbColor={value ? COLORS.wine : '#FFF'} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(42,20,20,0.38)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '86%', backgroundColor: COLORS.paper, borderTopLeftRadius: 34, borderTopRightRadius: 34, paddingHorizontal: 18, ...SHADOW },
  handle: { width: 48, height: 5, borderRadius: 99, backgroundColor: '#D9BBA9', alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { color: COLORS.red, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  title: { color: COLORS.wineDeep, fontSize: 24, fontWeight: '900', letterSpacing: -0.7, marginTop: 3 },
  iconButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.blush2, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 10 },
  section: { color: COLORS.text, fontSize: 14, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: COLORS.cream2, borderWidth: 1, borderColor: COLORS.border },
  optionActive: { backgroundColor: COLORS.wine, borderColor: COLORS.wine },
  optionText: { color: COLORS.wineDeep, fontWeight: '800', fontSize: 10 },
  optionTextActive: { color: '#FFF' },
  toggleRow: { minHeight: 68, marginBottom: 8, padding: 12, borderRadius: 18, backgroundColor: COLORS.cream2, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.blush, alignItems: 'center', justifyContent: 'center' },
  toggleTitle: { color: COLORS.wineDeep, fontSize: 11, fontWeight: '900' },
  toggleSub: { color: COLORS.muted, fontSize: 8, marginTop: 3 },
  footer: { flexDirection: 'row', gap: 9, paddingTop: 12 },
  clear: { width: 100, height: 52, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.cream2 },
  clearText: { color: COLORS.wine, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  apply: { flex: 1, height: 52, borderRadius: 17, backgroundColor: COLORS.wine, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  applyText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
});
