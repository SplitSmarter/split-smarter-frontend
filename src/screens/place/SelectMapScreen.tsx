import React, {useState, useEffect, useRef} from 'react';
import {BackHandler, View, Pressable, ActivityIndicator, StyleSheet} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, PoiClickEvent, LongPressEvent} from 'react-native-maps';
import {PlaceDetailBottomSheet} from "@/src/screens/place/PlaceDetailBottomSheet";
import {GetAllUserPlacesApi} from "@/src/api/user/place/location";
import {UserPlaceDetails, LocationDetails} from "@/src/api/dto/user/place";
import {PlaceSource} from "@/src/api/dto/constants";
import {useCurrentLocation} from "@/src/hooks/useCurrentLocation";
import {Iconify} from 'react-native-iconify';
import {themeStore} from '@/src/store/themeStore';
import {SearchPlaceApi} from "@/src/api/user/place/search_place";
import {useLocationStore} from "@/src/store/locationStore";
import {useRouter} from "expo-router";
import {darkMapStyle, styles} from "@/src/screens/place/SelectMapScreen.styles";
import {MapSearchOverlay} from "@/src/screens/place/components/MapSearchOverlay";

// ============================================================================
// Interfaces & Models
// ============================================================================

export interface MapPlaceItem {
    id: number | null;
    provider: PlaceSource;
    provider_id: number | null;
    place_id: string | null;
    name: string;
    coordinate: [number, number]; // [longitude, latitude]
    address?: string;
    isSaved: boolean;
}

export interface TempMarkerCoords {
    latitude: number;
    longitude: number;
}

const DEFAULT_PLACE_IMAGE = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=240&auto=format&fit=crop";

const SelectMap = () => {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();
    const isDark = themeStore((state) => state.theme === 'dark');
    const setTempLocationSelection = useLocationStore((state) => state.setTempLocationSelection);

    const [selectedPlace, setSelectedPlace] = useState<MapPlaceItem | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [savedPlaces, setSavedPlaces] = useState<UserPlaceDetails[]>([]);
    const {location, isLoading: isLocationLoading, refreshLocation} = useCurrentLocation();
    const [loading, setLoading] = useState(true);
    const [tempMarker, setTempMarker] = useState<TempMarkerCoords | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationDetails[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const backAction = () => {
            if (searchResults.length > 0) {
                setSearchResults([]);
                return true;
            }
            if (isSheetVisible) {
                handleCloseSheet();
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isSheetVisible, searchResults]);

    useEffect(() => {
        refreshLocation(false);
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const result = await GetAllUserPlacesApi(0, 100);
            if (result.data) {
                setSavedPlaces(result.data);
            }
        } catch (e) {
            console.error("Error fetching places list: ", e);
        } finally {
            setLoading(false);
        }
    };

    const animateToLocation = (longitude: number, latitude: number) => {
        mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 400);
    };

    const handleMyLocationPress = async () => {
        const targetCoords = await refreshLocation(true);
        if (targetCoords) {
            animateToLocation(targetCoords.longitude, targetCoords.latitude);
        }
    };

    const handleMarkerPress = (place: MapPlaceItem, isUnsavedTarget = false) => {
        setSelectedPlace(place);
        setTempMarker(isUnsavedTarget ? {longitude: place.coordinate[0], latitude: place.coordinate[1]} : null);
        animateToLocation(place.coordinate[0], place.coordinate[1]);
        requestAnimationFrame(() => {
            setIsSheetVisible(true);
        });
    };

    const handleCloseSheet = () => {
        setIsSheetVisible(false);
        setSelectedPlace(null);
        setTempMarker(null);
    };

    const executeSearch = async (text: string) => {
        if (!text.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await SearchPlaceApi({
                query: text,
                prefer_nearby: !!location,
                lat: location?.latitude,
                lon: location?.longitude,
                radius: 50000
            });

            if (response.data) {
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error("Failed executing search query", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchTextChange = (text: string) => {
        setSearchQuery(text);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (text.trim().length > 0) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }

        searchTimeoutRef.current = window.setTimeout(() => {
            executeSearch(text);
        }, 400);
    };

    const handleSearchResultSelect = (item: LocationDetails) => {
        setSearchResults([]);
        setSearchQuery(item.name);

        const existingPlace = savedPlaces.find(
            p => p.provider_id === item.provider_id || p.provider_id?.toString() === item.provider_id?.toString()
        );

        handleMarkerPress({
            id: existingPlace?.id || null,
            provider: item.provider || PlaceSource.GOOGLE,
            provider_id: item.provider_id,
            place_id: item.provider_id?.toString() || null,
            name: item.name,
            coordinate: [item.geo.longitude, item.geo.latitude],
            address: item.address,
            isSaved: !!existingPlace
        }, !existingPlace);
    };

    const onPoiClick = (event: PoiClickEvent) => {
        const {placeId, name, coordinate} = event.nativeEvent;
        const existingPlace = savedPlaces.find(p => p.provider_id === Number(placeId) || p.provider_id?.toString() === placeId);

        handleMarkerPress({
            id: existingPlace?.id || null,
            provider: PlaceSource.GOOGLE,
            provider_id: existingPlace ? existingPlace.provider_id : (isNaN(Number(placeId)) ? null : Number(placeId)),
            place_id: placeId,
            name: name,
            coordinate: [coordinate.longitude, coordinate.latitude],
            address: undefined,
            isSaved: !!existingPlace
        }, !existingPlace);
    };

    const onMapLongPress = (event: LongPressEvent) => {
        const {coordinate} = event.nativeEvent;
        const existingPlace = savedPlaces.find(p => {
            const latDiff = Math.abs(p.geo.latitude - coordinate.latitude);
            const lonDiff = Math.abs(p.geo.longitude - coordinate.longitude);
            return latDiff < 0.0001 && lonDiff < 0.0001;
        });

        if (existingPlace) {
            handleMarkerPress({
                id: existingPlace.id,
                provider: existingPlace.provider,
                provider_id: existingPlace.provider_id,
                place_id: existingPlace.provider_id?.toString() || null,
                name: existingPlace.name,
                coordinate: [existingPlace.geo.longitude, existingPlace.geo.latitude],
                address: existingPlace.address,
                isSaved: true
            }, false);
            return;
        }

        handleMarkerPress({
            id: null,
            provider: PlaceSource.CUSTOM,
            provider_id: null,
            place_id: null,
            name: "Dropped Pin",
            coordinate: [coordinate.longitude, coordinate.latitude],
            address: undefined,
            isSaved: false
        }, true);
    };

    const handleLocationModeConfirmed = (mode: 'none' | 'current' | 'place', resolvedId: number | null) => {
        setTempLocationSelection(mode, resolvedId);
        if (isSheetVisible) handleCloseSheet();

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
    };

    const handlePlaceConfirmed = (resolvedId: number | null) => {
        if (resolvedId) {
            handleLocationModeConfirmed('place', resolvedId);
        }
    };

    return (
        <View className="flex-1">
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: location?.latitude || 41.9028,
                    longitude: location?.longitude || 12.4964,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                customMapStyle={isDark ? darkMapStyle : []}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                onPoiClick={onPoiClick}
                onLongPress={onMapLongPress}
                onPress={() => {
                    setSearchResults([]);
                    if (isSheetVisible) handleCloseSheet();
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsTraffic={false}
                showsCompass={false}
            >
                {savedPlaces.map((p) => (
                    <Marker
                        key={p.id}
                        coordinate={{latitude: p.geo.latitude, longitude: p.geo.longitude}}
                        pinColor="#2D8A5B"
                        onPress={(e) => {
                            e.stopPropagation();
                            handleMarkerPress({
                                id: p.id,
                                provider: p.provider || PlaceSource.GOOGLE,
                                provider_id: p.provider_id,
                                place_id: p.provider_id?.toString() || null,
                                name: p.name,
                                coordinate: [p.geo.longitude, p.geo.latitude],
                                address: p.address,
                                isSaved: true
                            }, false);
                        }}
                    />
                ))}
                {tempMarker && <Marker coordinate={tempMarker} pinColor="#EA4335"/>}
            </MapView>

            {!isSheetVisible && (
                <MapSearchOverlay
                    searchQuery={searchQuery}
                    isSearching={isSearching}
                    searchResults={searchResults}
                    location={location}
                    onSearchTextChange={handleSearchTextChange}
                    onClearSearch={() => handleSearchTextChange('')}
                    onSelectResult={handleSearchResultSelect}
                    defaultImage={DEFAULT_PLACE_IMAGE}
                />
            )}

            {!isSheetVisible && (
                <View style={styles.fixedLocationFabContainer}>
                    <Pressable
                        onPress={handleMyLocationPress}
                        disabled={isLocationLoading}
                        className="w-[52px] h-[52px] rounded-full justify-center items-center shadow-lg shadow-black/30 elevation-6 bg-bg-primary-lighter dark:bg-bg-overlay active:opacity-80"
                    >
                        {isLocationLoading ? (
                            <ActivityIndicator size="small" color="#2D8A5B"/>
                        ) : (
                            <Iconify icon="heroicons:map-pin" size={24} color={isDark ? "#FFFFFF" : "#2D8A5B"}/>
                        )}
                    </Pressable>
                </View>
            )}

            <PlaceDetailBottomSheet
                isVisible={isSheetVisible}
                place={selectedPlace}
                isSaved={!!selectedPlace?.isSaved}
                onClose={handleCloseSheet}
                onSelect={(savedPlace) => {
                    handlePlaceConfirmed(savedPlace?.id);
                }}
                onSave={async (newSavedPlace?: UserPlaceDetails) => {
                    handlePlaceConfirmed(newSavedPlace?.id ?? null);
                }}
            />
        </View>
    );
};


export default SelectMap;