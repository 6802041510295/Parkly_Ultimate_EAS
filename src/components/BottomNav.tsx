import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SHADOW } from '../theme';

export type Page = 'home' | 'map' | 'saved' | 'more';

const items: { page: Page; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { page: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { page: 'map', label: 'Map', icon: 'map-outline', activeIcon: 'map' },
  { page: 'saved', label: 'Saved', icon: 'heart-outline', activeIcon: 'heart' },
  { page: 'more', label: 'More', icon: 'grid-outline', activeIcon: 'grid' },
];

export default function BottomNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = page === item.page;
        return (
          <Pressable key={item.page} onPress={() => setPage(item.page)} style={[styles.item, active && styles.activeItem]}>
            <Ionicons name={active ? item.activeIcon : item.icon} size={20} color={active ? '#FFF' : COLORS.muted} />
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 14, height: 68, backgroundColor: COLORS.paper, borderRadius: 24, padding: 7, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  item: { flex: 1, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 3 },
  activeItem: { backgroundColor: COLORS.wine },
  label: { color: COLORS.muted, fontSize: 10, fontWeight: '800' },
  activeLabel: { color: '#FFF' },
});
