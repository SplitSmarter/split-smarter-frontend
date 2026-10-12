import {useCallback, useEffect, useRef, useState} from 'react';
import {BackHandler} from 'react-native';
import MapView, {LongPressEvent, PoiClickEvent} from 'react-native-maps';
import {GetAllUserPlacesApi} from "@/src/api/user/place/location";
import {LocationDetails, UserPlaceDetails} from "@/src/api/dto/user/place";
import {PlaceSource} from "@/src/api/dto/constants";
import {useCurrentLocation} from "@/src/hooks/useCurrentLocation";
import {SearchPlaceApi} from "@/src/api/user/place/search_place";
import {useLocationStore} from "@/src/store/locationStore";
import {useRouter} from "expo-router";
import {
    ANIMATE_REGION_DELTA,
    NEARBY_PLACE_EPSILON,
    SEARCH_DEBOUNCE_MS,
    SEARCH_RADIUS_METERS,
} from "../constants/selectMap.constants";
import {LocationMode, MapPlaceItem, TempMarkerCoords} from "../types/selectMap.types";

export function useSelectMap() {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();
    const setTempLocationSelection = useLocationStore((state) => state.setTempLocationSelection);

    const [selectedPlace, setSelectedPlace] = useState<MapPlaceItem | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);
    const [savedPlaces, setSavedPlaces] = useState<UserPlaceDetails[]>([]);
    const {location, isLoading: isLocationLoading, refreshLocation} = useCurrentLocation();
    const [tempMarker, setTempMarker] = useState<TempMarkerCoords | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationDetails[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);

    const handleCloseSheet = useCallback(() => {
        setIsSheetVisible(false);
        setSelectedPlace(null);
        setTempMarker(null);
    }, []);

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
    }, [isSheetVisible, searchResults, handleCloseSheet]);

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const result = await GetAllUserPlacesApi(0, 100);
                if (result.data) {
                    setSavedPlaces(result.data);
                }
            } catch (e) {
                console.error("Error fetching places list: ", e);
            }
        };

        refreshLocation(false);
        fetchPlaces();
    }, []);

    const animateToLocation = useCallback((longitude: number, latitude: number) => {
        mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: ANIMATE_REGION_DELTA,
            longitudeDelta: ANIMATE_REGION_DELTA,
        }, 400);
    }, []);

    const handleMyLocationPress = useCallback(async () => {
        const targetCoords = await refreshLocation(true);
        if (targetCoords) {
            animateToLocation(targetCoords.longitude, targetCoords.latitude);
        }
    }, [refreshLocation, animateToLocation]);

    const handleMarkerPress = useCallback((place: MapPlaceItem, isUnsavedTarget = false) => {
        setSelectedPlace(place);
        setTempMarker(isUnsavedTarget ? {longitude: place.coordinate[0], latitude: place.coordinate[1]} : null);
        animateToLocation(place.coordinate[0], place.coordinate[1]);
        requestAnimationFrame(() => {
            setIsSheetVisible(true);
        });
    }, [animateToLocation]);

    const executeSearch = useCallback(async (text: string) => {
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
                radius: SEARCH_RADIUS_METERS,
            });

            if (response.data) {
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error("Failed executing search query", error);
        } finally {
            setIsSearching(false);
        }
    }, [location]);

    const handleSearchTextChange = useCallback((text: string) => {
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
        }, SEARCH_DEBOUNCE_MS);
    }, [executeSearch]);

    const handleSearchResultSelect = useCallback((item: LocationDetails) => {
        setSearchResults([]);
        setSearchQuery(item.name);

        const existingPlace = savedPlaces.find(
            (p) => p.provider_id === item.provider_id || p.provider_id?.toString() === item.provider_id?.toString()
        );

        handleMarkerPress({
            id: existingPlace?.id || null,
            provider: item.provider || PlaceSource.GOOGLE,
            provider_id: item.provider_id,
            place_id: item.provider_id?.toString() || null,
            name: item.name,
            coordinate: [item.geo.longitude, item.geo.latitude],
            address: item.address,
            isSaved: !!existingPlace,
        }, !existingPlace);
    }, [savedPlaces, handleMarkerPress]);

    const onPoiClick = useCallback((event: PoiClickEvent) => {
        const {placeId, name, coordinate} = event.nativeEvent;
        const existingPlace = savedPlaces.find(
            (p) => p.provider_id === Number(placeId) || p.provider_id?.toString() === placeId
        );

        handleMarkerPress({
            id: existingPlace?.id || null,
            provider: PlaceSource.GOOGLE,
            provider_id: existingPlace ? existingPlace.provider_id : (isNaN(Number(placeId)) ? null : Number(placeId)),
            place_id: placeId,
            name: name,
            coordinate: [coordinate.longitude, coordinate.latitude],
            address: undefined,
            isSaved: !!existingPlace,
        }, !existingPlace);
    }, [savedPlaces, handleMarkerPress]);

    const onMapLongPress = useCallback((event: LongPressEvent) => {
        const {coordinate} = event.nativeEvent;
        const existingPlace = savedPlaces.find((p) => {
            const latDiff = Math.abs(p.geo.latitude - coordinate.latitude);
            const lonDiff = Math.abs(p.geo.longitude - coordinate.longitude);
            return latDiff < NEARBY_PLACE_EPSILON && lonDiff < NEARBY_PLACE_EPSILON;
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
                isSaved: true,
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
            isSaved: false,
        }, true);
    }, [savedPlaces, handleMarkerPress]);

    const handleLocationModeConfirmed = useCallback((mode: LocationMode, resolvedId: number | null) => {
        setTempLocationSelection(mode, resolvedId);
        if (isSheetVisible) handleCloseSheet();

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
    }, [setTempLocationSelection, isSheetVisible, handleCloseSheet, router]);

    const handlePlaceConfirmed = useCallback((resolvedId: number | null) => {
        if (resolvedId) {
            handleLocationModeConfirmed('place', resolvedId);
        }
    }, [handleLocationModeConfirmed]);

    const handleMapPress = useCallback(() => {
        setSearchResults([]);
        if (isSheetVisible) handleCloseSheet();
    }, [isSheetVisible, handleCloseSheet]);

    const handleSavedMarkerPress = useCallback((place: UserPlaceDetails) => {
        handleMarkerPress({
            id: place.id,
            provider: place.provider || PlaceSource.GOOGLE,
            provider_id: place.provider_id,
            place_id: place.provider_id?.toString() || null,
            name: place.name,
            coordinate: [place.geo.longitude, place.geo.latitude],
            address: place.address,
            isSaved: true,
        }, false);
    }, [handleMarkerPress]);

    return {
        mapRef,
        selectedPlace,
        isSheetVisible,
        savedPlaces,
        location,
        isLocationLoading,
        tempMarker,
        searchQuery,
        searchResults,
        isSearching,
        handleMyLocationPress,
        handleCloseSheet,
        handleSearchTextChange,
        handleSearchResultSelect,
        onPoiClick,
        onMapLongPress,
        handlePlaceConfirmed,
        handleMapPress,
        handleSavedMarkerPress,
    };
}
