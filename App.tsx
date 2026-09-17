import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNav, { Page } from './src/components/BottomNav';
import DetailModal from './src/components/DetailModal';
import FilterModal, { SortMode } from './src/components/FilterModal';
import ParkingCard from './src/components/ParkingCard';
import ParkingMap from './src/components/ParkingMap';
import { initialParkingData } from './src/data/parkingData';
import { useUserLocation } from './src/hooks/useLocation';
import { COLORS, SHADOW } from './src/theme';
import { ParkingSpot, VehicleType } from './src/types';
import { distanceKm, formatDistance } from './src/utils/distance';
import { getStatus, recommendationScore, statusMeta } from './src/utils/parking';

const FAVORITES_KEY = 'parkly:favorites:v4';
const NAV_HEIGHT = 68;

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<Page>('home');
  const spots = initialParkingData;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<ParkingSpot | null>(null);
  const [query, setQuery] = useState('');
  const [vehicle, setVehicle] = useState<'all' | VehicleType>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [recenterToken, setRecenterToken] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { coordinate, address, loading, usingFallback, error, refresh } = useUserLocation();

  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, useNativeDriver: true, tension: 45, friction: 9 }).start();
  }, [entrance]);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(FAVORITES_KEY)
      .then((value) => {
        if (!alive || !value) return;
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter((id) => typeof id === 'string');
            setFavorites(clean);
          }
        } catch { /* ignore corrupted local storage */ }
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const toggleFavorite = (id: string) => {
    const spot = spots.find((item) => item.id === id);
    setFavorites((current) => {
      const exists = current.includes(id);
      const next = exists ? current.filter((item) => item !== id) : [...current, id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => undefined);
      showToast(exists ? `${spot?.shortName || 'Parking'} removed from Saved` : `${spot?.shortName || 'Parking'} saved`);
      return next;
    });
  };

  const clearFavorites = () => {
    Alert.alert('Clear saved parking?', 'This removes every saved parking spot from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setFavorites([]);
          AsyncStorage.removeItem(FAVORITES_KEY).catch(() => undefined);
          showToast('Saved parking cleared');
        },
      },
    ]);
  };

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      showToast('Could not open App settings');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setVehicle('all');
    setAvailableOnly(false);
    setCoveredOnly(false);
    setSortMode('recommended');
  };

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const rows = spots.filter((spot) => {
      const matchesText = !text || `${spot.name} ${spot.shortName} ${spot.zone} ${spot.description}`.toLowerCase().includes(text);
      const matchesVehicle = vehicle === 'all' || spot.vehicles.includes(vehicle);
      const matchesAvailability = !availableOnly || spot.available > 0;
      const matchesCovered = !coveredOnly || spot.covered;
      return matchesText && matchesVehicle && matchesAvailability && matchesCovered;
    });

    return [...rows].sort((a, b) => {
      if (sortMode === 'spaces') return b.available - a.available;
      if (sortMode === 'nearest') {
        return distanceKm(coordinate, { latitude: a.latitude, longitude: a.longitude }) - distanceKm(coordinate, { latitude: b.latitude, longitude: b.longitude });
      }
      return recommendationScore(b, coordinate) - recommendationScore(a, coordinate);
    });
  }, [spots, query, vehicle, availableOnly, coveredOnly, sortMode, coordinate]);

  const recommended = useMemo(
    () => [...spots].sort((a, b) => recommendationScore(b, coordinate) - recommendationScore(a, coordinate))[0],
    [spots, coordinate]
  );
  const homeSpots = useMemo(
    () => [...spots].sort((a, b) => recommendationScore(b, coordinate) - recommendationScore(a, coordinate)),
    [spots, coordinate]
  );
  const topMapResult = filtered[0] || null;
  const totalAvailable = spots.reduce((sum, spot) => sum + spot.available, 0);
  const fullCount = spots.filter((spot) => getStatus(spot) === 'FULL').length;
  const activeFilterCount = (vehicle !== 'all' ? 1 : 0) + (availableOnly ? 1 : 0) + (coveredOnly ? 1 : 0) + (sortMode !== 'recommended' ? 1 : 0);
  const bottomSafe = Math.max(insets.bottom, 8);
  const contentBottom = NAV_HEIGHT + bottomSafe + 42;
  const mapCardBottom = NAV_HEIGHT + bottomSafe + 24;

  useEffect(() => {
    if (page === 'map' && selected && !filtered.some((spot) => spot.id === selected.id)) {
      setSelected(null);
    }
  }, [page, selected, filtered]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (filtersOpen) {
        setFiltersOpen(false);
        return true;
      }
      if (selected) {
        setSelected(null);
        return true;
      }
      if (page !== 'home') {
        setPage('home');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [filtersOpen, selected, page]);

  const goMap = (spot?: ParkingSpot) => {
    Keyboard.dismiss();
    if (spot) setSelected(spot);
    setPage('map');
  };

  const applyPreset = (preset: 'nearest' | 'available' | 'covered' | 'ev') => {
    clearFilters();
    if (preset === 'nearest') setSortMode('nearest');
    if (preset === 'available') setAvailableOnly(true);
    if (preset === 'covered') setCoveredOnly(true);
    if (preset === 'ev') setVehicle('ev');
    setPage('map');
  };

  return (
    <View style={[styles.app, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Animated.View style={{ flex: 1, opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        {page === 'home' && (
          <HomeScreen
            spots={spots}
            displaySpots={homeSpots}
            recommended={recommended}
            totalAvailable={totalAvailable}
            fullCount={fullCount}
            user={coordinate}
            favorites={favorites}
            address={address}
            loading={loading}
            usingFallback={usingFallback}
            onRefresh={refresh}
            onOpenMap={() => goMap()}
            onSelect={setSelected}
            onFavorite={toggleFavorite}
            onPreset={applyPreset}
            bottomSpace={contentBottom}
          />
        )}

        {page === 'map' && (
          <MapScreen
            spots={filtered}
            selected={selected}
            user={coordinate}
            query={query}
            setQuery={setQuery}
            vehicle={vehicle}
            setVehicle={setVehicle}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            coveredOnly={coveredOnly}
            setCoveredOnly={setCoveredOnly}
            sortMode={sortMode}
            setSortMode={setSortMode}
            onSelect={setSelected}
            topResult={topMapResult}
            recenterToken={recenterToken}
            onRecenter={() => { setSelected(null); setRecenterToken((v) => v + 1); }}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
            mapCardBottom={mapCardBottom}
          />
        )}

        {page === 'saved' && (
          <SavedScreen
            spots={spots.filter((spot) => favorites.includes(spot.id))}
            favorites={favorites}
            user={coordinate}
            onSelect={setSelected}
            onFavorite={toggleFavorite}
            onExplore={() => setPage('map')}
            bottomSpace={contentBottom}
          />
        )}

        {page === 'more' && (
          <MoreScreen
            address={address}
            loading={loading}
            usingFallback={usingFallback}
            error={error}
            onRefresh={refresh}
            onOpenSettings={openAppSettings}
            onClearFavorites={clearFavorites}
            onClearFilters={clearFilters}
            savedCount={favorites.length}
            spotCount={spots.length}
            bottomSpace={contentBottom}
          />
        )}
      </Animated.View>

      <BottomNav page={page} setPage={setPage} bottomInset={insets.bottom} />

      <DetailModal
        spot={selected}
        user={coordinate}
        favorite={selected ? favorites.includes(selected.id) : false}
        onFavorite={() => selected && toggleFavorite(selected.id)}
        onClose={() => setSelected(null)}
        bottomInset={insets.bottom}
      />

      <FilterModal
        visible={filtersOpen}
        resultCount={filtered.length}
        sortMode={sortMode}
        setSortMode={setSortMode}
        vehicle={vehicle}
        setVehicle={setVehicle}
        availableOnly={availableOnly}
        setAvailableOnly={setAvailableOnly}
        coveredOnly={coveredOnly}
        setCoveredOnly={setCoveredOnly}
        onClear={clearFilters}
        onClose={() => setFiltersOpen(false)}
        bottomInset={insets.bottom}
      />

      {toast ? <ToastBanner message={toast} bottom={NAV_HEIGHT + bottomSafe + 20} /> : null}
    </View>
  );
}

function BrandHeader({ subtitle = 'Smart Parking Finder', right }: { subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandMark}><Text style={styles.brandP}>P</Text><View style={styles.brandDot} /></View>
      <View style={{ flex: 1 }}><Text style={styles.brand}>Parkly</Text><Text style={styles.brandSub}>{subtitle}</Text></View>
      {right}
    </View>
  );
}

function HomeScreen({ spots, displaySpots, recommended, totalAvailable, fullCount, user, favorites, address, loading, usingFallback, onRefresh, onOpenMap, onSelect, onFavorite, onPreset, bottomSpace }: any) {
  const nearest = [...spots].sort((a, b) => distanceKm(user, { latitude: a.latitude, longitude: a.longitude }) - distanceKm(user, { latitude: b.latitude, longitude: b.longitude }))[0];
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.pageScroll, { paddingBottom: bottomSpace }]}>
      <BrandHeader right={<View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>{usingFallback ? 'DEFAULT AREA' : 'LIVE GPS'}</Text></View>} />

      <View style={styles.heroWrap}>
        <LinearGradient colors={['#C14850', '#962B33', '#6B1820']} start={{ x: 0.05, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroOrb1} /><View style={styles.heroOrb2} />
          <View style={styles.heroTag}><Ionicons name="sparkles" size={13} color="#FFE7D8" /><Text style={styles.heroTagText}>SMART PARKING EXPERIENCE</Text></View>
          <Text style={styles.heroTitle}>PARK SMARTER,{`\n`}NOT HARDER.</Text>
          <Text style={styles.heroSubtitle}>Find the right parking spot with live GPS distance, smart recommendations and beautifully clear availability.</Text>

          <View style={styles.heroVisualRow}>
            <View style={styles.heroCircleOuter}>
              <View style={styles.heroCircleInner}>
                <Text style={styles.heroCount}>{totalAvailable}</Text>
                <Text style={styles.heroCountLabel}>SPACES FREE</Text>
                <Text style={styles.heroCountSub}>across {spots.length} parking zones</Text>
              </View>
            </View>
            <View style={styles.heroMiniStack}>
              <View style={styles.heroMini}><Text style={styles.heroMiniLabel}>BEST MATCH</Text><Text numberOfLines={1} style={styles.heroMiniTitle}>{recommended.shortName}</Text><Text style={styles.heroMiniSub}>{recommended.available} spaces · {formatDistance(distanceKm(user, { latitude: recommended.latitude, longitude: recommended.longitude }))}</Text></View>
              <View style={styles.heroMini}><Text style={styles.heroMiniLabel}>NEAREST</Text><Text numberOfLines={1} style={styles.heroMiniTitle}>{nearest.shortName}</Text><Text style={styles.heroMiniSub}>{formatDistance(distanceKm(user, { latitude: nearest.latitude, longitude: nearest.longitude }))} away</Text></View>
            </View>
          </View>

          <View style={styles.heroButtons}>
            <Pressable onPress={onOpenMap} style={({ pressed }) => [styles.heroPrimary, pressed && { opacity: 0.8 }]}><Ionicons name="map" size={17} color={COLORS.wineDeep} /><Text style={styles.heroPrimaryText}>OPEN SMART MAP</Text></Pressable>
            <Pressable disabled={loading} onPress={onRefresh} style={({ pressed }) => [styles.heroSecondary, pressed && { opacity: 0.8 }, loading && { opacity: 0.55 }]}><Ionicons name="locate" size={17} color="#FFF" /><Text style={styles.heroSecondaryText}>{loading ? 'LOCATING…' : 'REFRESH GPS'}</Text></Pressable>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.menuPanel}>
        <View style={styles.sectionHead}><View><Text style={styles.kicker}>PARKING MENU</Text><Text style={styles.sectionTitle}>What do you need?</Text></View><Text style={styles.menuCaption}>Tap to filter instantly</Text></View>
        <View style={styles.menuGrid}>
          <MenuAction icon="navigate-circle-outline" label="Nearest" sub="Closest to you" onPress={() => onPreset('nearest')} />
          <MenuAction icon="checkmark-circle-outline" label="Available" sub="Skip full zones" onPress={() => onPreset('available')} />
          <MenuAction icon="umbrella-outline" label="Covered" sub="Weather ready" onPress={() => onPreset('covered')} />
          <MenuAction icon="flash-outline" label="EV" sub="Charging bays" onPress={() => onPreset('ev')} />
        </View>
      </View>

      <SectionTitle title="Best parking for you" subtitle="Smart score from distance + availability" action="VIEW MAP" onAction={onOpenMap} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {displaySpots.slice(0, 5).map((spot: ParkingSpot) => (
          <ParkingCard key={spot.id} compact spot={spot} user={user} favorite={favorites.includes(spot.id)} onPress={() => onSelect(spot)} onFavorite={() => onFavorite(spot.id)} />
        ))}
      </ScrollView>

      <View style={styles.promiseCard}>
        <View style={styles.promiseTop}><View><Text style={styles.kicker}>SMART SUMMARY</Text><Text style={styles.promiseTitle}>Everything you need,{`\n`}nothing you don’t.</Text></View><View style={styles.promiseIcon}><Ionicons name="car-sport" size={30} color="#FFF" /></View></View>
        <Text style={styles.promiseText}>Compare parking zones, search by need, save favorites, calculate GPS distance and open turn-by-turn directions in Google Maps from one place.</Text>
        <View style={styles.promiseStats}>
          <SmallStat value={`${spots.length}`} label="ZONES" />
          <SmallStat value={`${totalAvailable}`} label="FREE SPACES" />
          <SmallStat value={`${fullCount}`} label="FULL" />
        </View>
      </View>

      <View style={styles.locationStrip}>
        <View style={styles.locationIcon}><Ionicons name="location" size={22} color={COLORS.wine} /></View>
        <View style={{ flex: 1 }}><Text style={styles.locationLabel}>YOUR LOCATION</Text><Text numberOfLines={2} style={styles.locationText}>{loading ? 'Reading GPS…' : address}</Text></View>
        <Pressable disabled={loading} onPress={onRefresh} style={({ pressed }) => [styles.roundButton, pressed && { opacity: 0.75 }, loading && { opacity: 0.5 }]}><Ionicons name="refresh" size={18} color={COLORS.wine} /></Pressable>
      </View>
    </ScrollView>
  );
}

function MapScreen({ spots, selected, user, query, setQuery, vehicle, setVehicle, availableOnly, setAvailableOnly, coveredOnly, setCoveredOnly, sortMode, setSortMode, onSelect, topResult, recenterToken, onRecenter, onOpenFilters, activeFilterCount, onClearFilters, mapCardBottom }: any) {
  const current = selected || topResult;
  return (
    <View style={styles.mapPage}>
      <ParkingMap spots={spots} selected={selected} user={user} onSelect={onSelect} recenterToken={recenterToken} />
      <View style={styles.mapTopOverlay} pointerEvents="box-none">
        <BrandHeader subtitle={`${spots.length} parking zones`} />
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color={COLORS.wine} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search parking…" placeholderTextColor="#AB8B80" style={styles.searchInput} returnKeyType="search" onSubmitEditing={() => Keyboard.dismiss()} />
          <View style={styles.searchActions}>
            {query ? <Pressable hitSlop={7} onPress={() => setQuery('')} style={styles.searchAction}><Ionicons name="close" size={18} color={COLORS.muted} /></Pressable> : null}
            <Pressable hitSlop={7} onPress={onOpenFilters} style={styles.searchAction} accessibilityLabel="Open parking filters">
              <Ionicons name="options-outline" size={19} color={COLORS.wine} />
              {activeFilterCount > 0 ? <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFilterCount}</Text></View> : null}
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.filterRow}>
          <FilterChip label="Recommended" icon="sparkles-outline" active={sortMode === 'recommended'} onPress={() => setSortMode('recommended')} />
          <FilterChip label="Nearest" icon="navigate-outline" active={sortMode === 'nearest'} onPress={() => setSortMode('nearest')} />
          <FilterChip label="Most spaces" icon="layers-outline" active={sortMode === 'spaces'} onPress={() => setSortMode('spaces')} />
          <FilterChip label="Available" icon="checkmark-circle-outline" active={availableOnly} onPress={() => setAvailableOnly(!availableOnly)} />
          <FilterChip label="Covered" icon="umbrella-outline" active={coveredOnly} onPress={() => setCoveredOnly(!coveredOnly)} />
          <FilterChip label="Car" icon="car-outline" active={vehicle === 'car'} onPress={() => setVehicle(vehicle === 'car' ? 'all' : 'car')} />
          <FilterChip label="Motorcycle" icon="bicycle-outline" active={vehicle === 'motorcycle'} onPress={() => setVehicle(vehicle === 'motorcycle' ? 'all' : 'motorcycle')} />
          <FilterChip label="EV" icon="flash-outline" active={vehicle === 'ev'} onPress={() => setVehicle(vehicle === 'ev' ? 'all' : 'ev')} />
        </ScrollView>
      </View>

      <Pressable onPress={onRecenter} style={[styles.recenter, { bottom: mapCardBottom + (current ? 155 : 170) }]} accessibilityLabel="Recenter map to my location"><Ionicons name="locate" size={22} color={COLORS.wine} /></Pressable>

      {current ? (
        <View style={[styles.mapBottomCard, { bottom: mapCardBottom }]}>
          <View style={styles.mapBottomHeader}><View style={{ flex: 1 }}><Text style={styles.mapBottomKicker}>{selected ? 'SELECTED PARKING' : sortMode === 'nearest' ? 'NEAREST RESULT' : sortMode === 'spaces' ? 'MOST SPACES' : 'RECOMMENDED FOR YOU'}</Text><Text numberOfLines={1} style={styles.mapBottomTitle}>{current.shortName}</Text></View><View style={[styles.mapBottomPill, { backgroundColor: statusMeta(getStatus(current)).soft }]}><View style={[styles.miniDot, { backgroundColor: statusMeta(getStatus(current)).color }]} /><Text style={[styles.mapBottomStatus, { color: statusMeta(getStatus(current)).color }]}>{statusMeta(getStatus(current)).label}</Text></View></View>
          <View style={styles.mapBottomMeta}><Text style={styles.mapBottomMetaText}><Text style={styles.mapBottomBold}>{current.available}</Text> free</Text><Text style={styles.metaSep}>•</Text><Text style={styles.mapBottomMetaText}>{formatDistance(distanceKm(user, { latitude: current.latitude, longitude: current.longitude }))} away</Text><Text style={styles.metaSep}>•</Text><Text style={styles.mapBottomMetaText}>{current.zone}</Text></View>
          <Pressable onPress={() => onSelect(current)} style={({ pressed }) => [styles.detailsButton, pressed && { opacity: 0.82 }]}><Text style={styles.detailsButtonText}>VIEW DETAILS</Text><Ionicons name="arrow-forward" size={16} color="#FFF" /></Pressable>
        </View>
      ) : (
        <View style={[styles.noResultsCard, { bottom: mapCardBottom }]}>
          <View style={styles.noResultsIcon}><Ionicons name="search-outline" size={25} color={COLORS.wine} /></View>
          <Text style={styles.noResultsTitle}>No parking matches</Text>
          <Text style={styles.noResultsText}>Try clearing the search or filters to show parking zones again.</Text>
          <Pressable onPress={onClearFilters} style={styles.noResultsButton}><Text style={styles.noResultsButtonText}>CLEAR FILTERS</Text></Pressable>
        </View>
      )}
    </View>
  );
}

function SavedScreen({ spots, favorites, user, onSelect, onFavorite, onExplore, bottomSpace }: any) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.pageScroll, { paddingBottom: bottomSpace }]}>
      <BrandHeader subtitle="Your favorite parking" right={<View style={styles.savedCount}><Ionicons name="heart" size={15} color={COLORS.red} /><Text style={styles.savedCountText}>{favorites.length}</Text></View>} />
      <View style={styles.simpleHero}><Text style={styles.kicker}>SAVED</Text><Text style={styles.simpleHeroTitle}>Your go-to parking,{`\n`}always one tap away.</Text><Text style={styles.simpleHeroText}>Save the spots you use most often and quickly compare their distance and availability.</Text></View>
      {spots.length === 0 ? (
        <View style={styles.emptyState}><View style={styles.emptyCircle}><Ionicons name="heart-outline" size={34} color={COLORS.wine} /></View><Text style={styles.emptyTitle}>No saved parking yet</Text><Text style={styles.emptyText}>Tap the heart on any parking card or parking details to keep it here.</Text><Pressable onPress={onExplore} style={styles.emptyButton}><Text style={styles.emptyButtonText}>EXPLORE MAP</Text></Pressable></View>
      ) : (
        <View style={styles.savedList}>{spots.map((spot: ParkingSpot) => <ParkingCard key={spot.id} spot={spot} user={user} favorite onPress={() => onSelect(spot)} onFavorite={() => onFavorite(spot.id)} />)}</View>
      )}
    </ScrollView>
  );
}

function MoreScreen({ address, loading, usingFallback, error, onRefresh, onOpenSettings, onClearFavorites, onClearFilters, savedCount, spotCount, bottomSpace }: any) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.pageScroll, { paddingBottom: bottomSpace }]}>
      <BrandHeader subtitle="Settings & app status" />
      <View style={styles.moreHero}><View style={styles.moreHeroIcon}><Ionicons name="sparkles" size={28} color="#FFF" /></View><Text style={styles.moreTitle}>Parkly,{`\n`}ready for the road.</Text><Text style={styles.moreText}>Manage location access, saved parking and filters. Every control on this page performs a real action on the phone.</Text></View>

      <Text style={styles.moreSectionTitle}>Quick actions</Text>
      <View style={styles.moreGrid}>
        <ControlCard icon="locate" title="Refresh GPS" text="Read your current location again and recalculate distances." onPress={onRefresh} />
        <ControlCard icon="settings-outline" title="App settings" text="Open Android settings to manage location permission." onPress={onOpenSettings} />
        <ControlCard icon="options-outline" title="Clear filters" text="Reset search, sorting and parking filters." onPress={onClearFilters} />
        <ControlCard icon="heart-dislike-outline" title="Clear Saved" text={`Remove all ${savedCount} saved parking spot${savedCount === 1 ? '' : 's'} from this phone.`} onPress={onClearFavorites} />
      </View>

      <Text style={styles.moreSectionTitle}>Location</Text>
      <View style={styles.infoPanel}><View style={styles.infoPanelIcon}><Ionicons name="location" size={22} color={COLORS.wine} /></View><View style={{ flex: 1 }}><Text style={styles.infoPanelLabel}>{usingFallback ? 'DEFAULT MAP AREA' : 'LIVE GPS'}</Text><Text style={styles.infoPanelValue}>{loading ? 'Reading GPS…' : address}</Text>{error ? <Text style={styles.infoPanelError}>{error}</Text> : null}</View><Pressable disabled={loading} onPress={onRefresh} style={styles.roundButton}><Ionicons name="locate" size={18} color={COLORS.wine} /></Pressable></View>

      <Text style={styles.moreSectionTitle}>App capabilities</Text>
      <View style={styles.featureList}>
        <FeatureRow icon="map-outline" title="Google Maps for Android" text="Native map, parking markers, user location and map recentering." />
        <FeatureRow icon="navigate-outline" title="GPS distance" text="Reads current location and calculates distance to every parking zone." />
        <FeatureRow icon="search-outline" title="Search & smart filters" text="Search, sorting, vehicle filters, availability and covered parking." />
        <FeatureRow icon="sparkles-outline" title="Smart recommendation" text="Ranks parking using distance, available spaces and useful facilities." />
        <FeatureRow icon="heart-outline" title="Persistent favorites" text="Saved parking is stored locally and remains after closing the app." />
        <FeatureRow icon="phone-portrait-outline" title="Phone-safe interface" text="Safe areas keep controls above Android status and navigation bars." />
        <FeatureRow icon="arrow-back-outline" title="Android back button" text="Back closes filters/details first, then returns to Home naturally." />
        <FeatureRow icon="open-outline" title="Google Maps directions" text="Choose driving or walking and open the selected parking destination." />
      </View>
      <View style={styles.projectBadge}><Text style={styles.projectBadgeText}>{spotCount} PARKING ZONES · EAS ANDROID READY</Text></View>
    </ScrollView>
  );
}

function MenuAction({ icon, label, sub, onPress }: any) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuAction, pressed && { opacity: 0.82 }]}><View style={styles.menuActionIcon}><Ionicons name={icon} size={23} color={COLORS.wine} /></View><Text style={styles.menuActionLabel}>{label}</Text><Text style={styles.menuActionSub}>{sub}</Text></Pressable>;
}

function SectionTitle({ title, subtitle, action, onAction }: any) {
  return <View style={styles.sectionTitleRow}><View style={{ flex: 1 }}><Text style={styles.sectionTitleMain}>{title}</Text><Text style={styles.sectionSubtitle}>{subtitle}</Text></View>{action && <Pressable onPress={onAction} style={styles.sectionAction}><Text style={styles.sectionActionText}>{action}</Text></Pressable>}</View>;
}

function SmallStat({ value, label }: any) {
  return <View style={styles.smallStat}><Text style={styles.smallStatValue}>{value}</Text><Text style={styles.smallStatLabel}>{label}</Text></View>;
}

function FilterChip({ label, icon, active, onPress }: any) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && { opacity: 0.78 }]}><Ionicons name={icon} size={14} color={active ? '#FFF' : COLORS.wine} /><Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text></Pressable>;
}

function ControlCard({ icon, title, text, onPress }: any) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.controlCard, pressed && { opacity: 0.8 }]}><View style={styles.controlIcon}><Ionicons name={icon} size={23} color={COLORS.wine} /></View><Text style={styles.controlTitle}>{title}</Text><Text style={styles.controlText}>{text}</Text><View style={styles.controlArrow}><Ionicons name="arrow-forward" size={15} color={COLORS.wine} /></View></Pressable>;
}

function FeatureRow({ icon, title, text }: any) {
  return <View style={styles.featureRow}><View style={styles.featureRowIcon}><Ionicons name={icon} size={20} color={COLORS.wine} /></View><View style={{ flex: 1 }}><Text style={styles.featureRowTitle}>{title}</Text><Text style={styles.featureRowText}>{text}</Text></View><Ionicons name="checkmark-circle" size={19} color={COLORS.green} /></View>;
}

function ToastBanner({ message, bottom }: { message: string; bottom: number }) {
  return (
    <View pointerEvents="none" style={[styles.toast, { bottom }]}>
      <Ionicons name="checkmark-circle" size={19} color="#FBD2C5" />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.cream },
  pageScroll: { paddingBottom: 108, backgroundColor: COLORS.cream },
  header: { minHeight: 68, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cream },
  brandMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.wine, alignItems: 'center', justifyContent: 'center', marginRight: 10, ...SHADOW },
  brandP: { color: '#FFF9EF', fontSize: 23, fontWeight: '900', lineHeight: 25 },
  brandDot: { position: 'absolute', right: 7, top: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFB5A8' },
  brand: { color: COLORS.wineDeep, fontWeight: '900', fontSize: 22, letterSpacing: -0.8 },
  brandSub: { color: COLORS.muted, fontSize: 9, fontWeight: '700', marginTop: 1, letterSpacing: 0.3 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 99 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  liveText: { color: COLORS.wineDeep, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },

  heroWrap: { paddingHorizontal: 14 },
  hero: { borderRadius: 30, padding: 22, overflow: 'hidden', minHeight: 450, ...SHADOW },
  heroOrb1: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,255,255,0.07)', right: -50, top: -50 },
  heroOrb2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.06)', left: -45, bottom: 60 },
  heroTag: { alignSelf: 'flex-start', flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99 },
  heroTagText: { color: '#FFE5D7', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  heroTitle: { color: '#FFF8EF', fontSize: 36, lineHeight: 37, fontWeight: '900', letterSpacing: -1.4, marginTop: 17 },
  heroSubtitle: { color: '#F4D1CB', fontSize: 11, lineHeight: 17, maxWidth: 310, marginTop: 9 },
  heroVisualRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  heroCircleOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 8, borderColor: 'rgba(255,255,255,0.23)', alignItems: 'center', justifyContent: 'center' },
  heroCircleInner: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#FFF7E9', alignItems: 'center', justifyContent: 'center', ...SHADOW },
  heroCount: { color: COLORS.wineDeep, fontSize: 36, lineHeight: 38, fontWeight: '900', letterSpacing: -1.5 },
  heroCountLabel: { color: COLORS.red, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  heroCountSub: { color: COLORS.muted, fontSize: 7, marginTop: 3 },
  heroMiniStack: { flex: 1, gap: 9 },
  heroMini: { minHeight: 65, borderRadius: 17, backgroundColor: 'rgba(255,248,239,0.96)', padding: 11, justifyContent: 'center' },
  heroMiniLabel: { color: '#B8796E', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  heroMiniTitle: { color: COLORS.wineDeep, fontSize: 13, fontWeight: '900', marginTop: 2 },
  heroMiniSub: { color: COLORS.muted, fontSize: 8, marginTop: 2 },
  heroButtons: { flexDirection: 'row', gap: 8, marginTop: 21 },
  heroPrimary: { flex: 1.25, height: 50, borderRadius: 17, backgroundColor: '#FFF8EA', flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  heroPrimaryText: { color: COLORS.wineDeep, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  heroSecondary: { flex: 1, height: 50, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.07)', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  heroSecondaryText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  menuPanel: { marginHorizontal: 14, marginTop: 14, backgroundColor: COLORS.paper, borderRadius: 28, padding: 18, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  kicker: { color: COLORS.red, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  sectionTitle: { color: COLORS.wineDeep, fontSize: 21, fontWeight: '900', letterSpacing: -0.5, marginTop: 3 },
  menuCaption: { marginLeft: 'auto', color: COLORS.muted, fontSize: 8 },
  menuGrid: { flexDirection: 'row', gap: 9 },
  menuAction: { flex: 1, alignItems: 'center', paddingVertical: 13, paddingHorizontal: 4, borderRadius: 19, backgroundColor: COLORS.cream2, borderWidth: 1, borderColor: '#F1DFD0' },
  menuActionIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: COLORS.blush, alignItems: 'center', justifyContent: 'center' },
  menuActionLabel: { color: COLORS.wineDeep, fontSize: 10, fontWeight: '900', marginTop: 7 },
  menuActionSub: { color: COLORS.muted, fontSize: 7, marginTop: 2, textAlign: 'center' },

  sectionTitleRow: { paddingHorizontal: 18, marginTop: 25, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  sectionTitleMain: { color: COLORS.wineDeep, fontSize: 22, fontWeight: '900', letterSpacing: -0.6 },
  sectionSubtitle: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  sectionAction: { backgroundColor: COLORS.wine, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 9 },
  sectionActionText: { color: '#FFF', fontWeight: '900', fontSize: 8, letterSpacing: 0.5 },
  horizontalCards: { paddingHorizontal: 18, paddingBottom: 10, gap: 12 },

  promiseCard: { marginHorizontal: 14, marginTop: 16, backgroundColor: COLORS.paper, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  promiseTop: { flexDirection: 'row', alignItems: 'flex-start' },
  promiseTitle: { color: COLORS.wineDeep, fontSize: 24, lineHeight: 27, fontWeight: '900', letterSpacing: -0.7, marginTop: 5 },
  promiseIcon: { marginLeft: 'auto', width: 58, height: 58, borderRadius: 20, backgroundColor: COLORS.wine, alignItems: 'center', justifyContent: 'center' },
  promiseText: { color: COLORS.muted, fontSize: 10, lineHeight: 16, marginTop: 12 },
  promiseStats: { flexDirection: 'row', gap: 8, marginTop: 17 },
  smallStat: { flex: 1, backgroundColor: COLORS.cream2, borderRadius: 17, padding: 12 },
  smallStatValue: { color: COLORS.red, fontWeight: '900', fontSize: 20 },
  smallStatLabel: { color: COLORS.muted, fontWeight: '900', fontSize: 7, letterSpacing: 0.5, marginTop: 2 },

  locationStrip: { margin: 14, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, backgroundColor: '#F3D9CC', borderRadius: 22 },
  locationIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF8ED', alignItems: 'center', justifyContent: 'center' },
  locationLabel: { color: COLORS.red, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  locationText: { color: COLORS.text, fontSize: 10, fontWeight: '700', marginTop: 3, lineHeight: 14 },
  roundButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFF8ED', alignItems: 'center', justifyContent: 'center' },

  mapPage: { flex: 1, backgroundColor: '#F4E4D2', paddingBottom: 86 },
  mapTopOverlay: { position: 'absolute', left: 0, right: 0, top: 0 },
  searchBox: { marginHorizontal: 14, height: 50, borderRadius: 18, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9, ...SHADOW },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '700' },
  filterRow: { paddingHorizontal: 14, paddingTop: 9, gap: 7 },
  filterChip: { height: 35, paddingHorizontal: 11, borderRadius: 99, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 5 },
  filterChipActive: { backgroundColor: COLORS.wine, borderColor: COLORS.wine },
  filterChipText: { color: COLORS.wineDeep, fontSize: 8, fontWeight: '900' },
  filterChipTextActive: { color: '#FFF' },
  recenter: { position: 'absolute', right: 14, bottom: 250, width: 48, height: 48, borderRadius: 17, backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  mapBottomCard: { position: 'absolute', left: 14, right: 14, bottom: 95, backgroundColor: COLORS.paper, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  mapBottomHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mapBottomKicker: { color: COLORS.red, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  mapBottomTitle: { color: COLORS.wineDeep, fontSize: 19, fontWeight: '900', marginTop: 2 },
  mapBottomPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 99 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  mapBottomStatus: { fontSize: 7, fontWeight: '900' },
  mapBottomMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  mapBottomMetaText: { color: COLORS.muted, fontSize: 9 },
  mapBottomBold: { color: COLORS.wine, fontWeight: '900' },
  metaSep: { color: '#C4A79A', marginHorizontal: 6 },
  detailsButton: { marginTop: 12, height: 43, borderRadius: 15, backgroundColor: COLORS.wine, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  detailsButtonText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  savedCount: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: COLORS.paper, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: COLORS.border },
  savedCountText: { color: COLORS.wineDeep, fontWeight: '900', fontSize: 10 },
  simpleHero: { marginHorizontal: 14, backgroundColor: COLORS.paper, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  simpleHeroTitle: { color: COLORS.wineDeep, fontSize: 28, lineHeight: 30, fontWeight: '900', letterSpacing: -1, marginTop: 7 },
  simpleHeroText: { color: COLORS.muted, fontSize: 10, lineHeight: 16, marginTop: 9, maxWidth: 310 },
  savedList: { padding: 14, gap: 12 },
  emptyState: { margin: 14, marginTop: 18, backgroundColor: COLORS.paper, borderRadius: 28, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  emptyCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.blush2, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: COLORS.wineDeep, fontSize: 20, fontWeight: '900', marginTop: 14 },
  emptyText: { color: COLORS.muted, fontSize: 10, textAlign: 'center', marginTop: 6 },
  emptyButton: { marginTop: 17, backgroundColor: COLORS.wine, borderRadius: 99, paddingHorizontal: 20, paddingVertical: 12 },
  emptyButtonText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  moreHero: { marginHorizontal: 14, borderRadius: 28, backgroundColor: COLORS.wine, padding: 22, minHeight: 210, overflow: 'hidden', ...SHADOW },
  moreHeroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  moreTitle: { color: '#FFF8EE', fontSize: 29, lineHeight: 31, fontWeight: '900', letterSpacing: -1, marginTop: 16 },
  moreText: { color: '#F1D3CC', fontSize: 10, lineHeight: 16, marginTop: 8, maxWidth: 320 },
  moreSectionTitle: { color: COLORS.wineDeep, fontSize: 18, fontWeight: '900', marginHorizontal: 18, marginTop: 24, marginBottom: 10 },
  moreGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 14 },
  controlCard: { flex: 1, minHeight: 164, backgroundColor: COLORS.paper, borderRadius: 24, padding: 15, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  controlIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: COLORS.blush2, alignItems: 'center', justifyContent: 'center' },
  controlTitle: { color: COLORS.wineDeep, fontWeight: '900', fontSize: 13, marginTop: 12 },
  controlText: { color: COLORS.muted, fontSize: 8, lineHeight: 13, marginTop: 5 },
  controlArrow: { marginTop: 'auto', alignSelf: 'flex-end', width: 29, height: 29, borderRadius: 10, backgroundColor: COLORS.cream2, alignItems: 'center', justifyContent: 'center' },
  infoPanel: { marginHorizontal: 14, backgroundColor: COLORS.paper, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', gap: 10, alignItems: 'center' },
  infoPanelIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.blush2, alignItems: 'center', justifyContent: 'center' },
  infoPanelLabel: { color: COLORS.red, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  infoPanelValue: { color: COLORS.text, fontSize: 10, fontWeight: '700', marginTop: 3, lineHeight: 14 },
  infoPanelError: { color: COLORS.danger, fontSize: 8, marginTop: 4 },
  featureList: { marginHorizontal: 14, backgroundColor: COLORS.paper, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  featureRow: { minHeight: 70, flexDirection: 'row', gap: 11, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0E0D5' },
  featureRowIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: COLORS.blush2, alignItems: 'center', justifyContent: 'center' },
  featureRowTitle: { color: COLORS.wineDeep, fontWeight: '900', fontSize: 11 },
  featureRowText: { color: COLORS.muted, fontSize: 8, lineHeight: 12, marginTop: 3 },
  projectBadge: { margin: 14, padding: 14, borderRadius: 18, backgroundColor: '#F1D0C3', alignItems: 'center' },
  projectBadgeText: { color: COLORS.wine, fontWeight: '900', fontSize: 8, letterSpacing: 0.5, textAlign: 'center' },

  searchActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  searchAction: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cream2 },
  filterBadge: { position: 'absolute', right: -2, top: -3, minWidth: 15, height: 15, paddingHorizontal: 3, borderRadius: 8, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.paper },
  filterBadgeText: { color: '#FFF', fontSize: 7, fontWeight: '900' },
  noResultsCard: { position: 'absolute', left: 14, right: 14, backgroundColor: COLORS.paper, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', ...SHADOW },
  noResultsIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.blush2, alignItems: 'center', justifyContent: 'center' },
  noResultsTitle: { color: COLORS.wineDeep, fontSize: 17, fontWeight: '900', marginTop: 10 },
  noResultsText: { color: COLORS.muted, fontSize: 9, textAlign: 'center', lineHeight: 14, marginTop: 4 },
  noResultsButton: { minHeight: 40, marginTop: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: COLORS.wine, alignItems: 'center', justifyContent: 'center' },
  noResultsButtonText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  toast: { position: 'absolute', left: 24, right: 24, minHeight: 48, borderRadius: 17, backgroundColor: COLORS.wineDeep, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, ...SHADOW },
  toastText: { flex: 1, color: '#FFF8EF', fontSize: 10, fontWeight: '800' },
});
