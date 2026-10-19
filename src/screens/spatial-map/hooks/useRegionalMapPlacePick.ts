import {useCallback, useEffect, useRef, useState, type RefObject} from 'react';
import type MapView from 'react-native-maps';
import type {LongPressEvent, PoiClickEvent} from 'react-native-maps';
import {PlaceSource} from '@/src/api/dto/constants';
import type {LocationDetails} from '@/src/api/dto/user/place';
import {
    GetGooglePlaceDetailsApi,
    SearchPlaceApi,
} from '@/src/api/user/place/search_place';
import {useCurrentLocation} from '@/src/hooks/useCurrentLocation';
import type {MapPlaceItem} from '@/src/screens/place/select-map/types/selectMap.types';
import {
    SEARCH_DEBOUNCE_MS,
    SEARCH_RADIUS_METERS,
} from '@/src/screens/place/select-map/constants/selectMap.constants';
import type {PlaceAgg} from '../types/spatialMap.types';
import {focusMapOnCoordinate} from '../utils/focusMapOnCoordinate';
import {mapPlaceItemToPlaceAgg} from '../utils/mapPlaceToPlaceAgg';

type TempMarker = {latitude: number; longitude: number};

interface UseRegionalMapPlacePickOptions {
    mapRef: RefObject<MapView | null>;
    /** Currently filtered map places — used first for spend match. */
    visiblePlaces: PlaceAgg[];
    /** Aggregated spend catalog from adapter-backed expenses (memory-scoped when active). */
    spendCatalog?: PlaceAgg[];
    onPlaceSelected: (place: PlaceAgg) => void;
    /** Long-press dropped pin — open dedicated sheet (not venue). */
    onDroppedPin?: (coords: {latitude: number; longitude: number}) => void;
}

export function useRegionalMapPlacePick({
    mapRef,
    visiblePlaces,
    spendCatalog = [],
    onPlaceSelected,
    onDroppedPin,
}: UseRegionalMapPlacePickOptions) {
    const {location, refreshLocation} = useCurrentLocation();
    const [tempMarker, setTempMarker] = useState<TempMarker | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationDetails[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Guards stale enrich results when the user picks another place quickly. */
    const openRequestIdRef = useRef(0);
    const onDroppedPinRef = useRef(onDroppedPin);
    onDroppedPinRef.current = onDroppedPin;

    useEffect(() => {
        void refreshLocation(false);
    }, [refreshLocation]);

    const clearTempMarker = useCallback(() => {
        setTempMarker(null);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
    }, []);

    const animateTo = useCallback(
        (latitude: number, longitude: number) => {
            focusMapOnCoordinate(mapRef, latitude, longitude);
        },
        [mapRef]
    );

    const openPlaceItem = useCallback(
        (item: MapPlaceItem, showTempMarker: boolean) => {
            const requestId = ++openRequestIdRef.current;
            const matchPool =
                visiblePlaces.length > 0
                    ? [...visiblePlaces, ...spendCatalog]
                    : spendCatalog;

            // Open sheet immediately with what we already have (select-map pattern).
            const venue = mapPlaceItemToPlaceAgg(item, matchPool);
            setTempMarker(
                showTempMarker
                    ? {latitude: venue.latitude, longitude: venue.longitude}
                    : null
            );
            animateTo(venue.latitude, venue.longitude);
            onPlaceSelected(venue);

            const needsEnrich =
                item.provider === PlaceSource.GOOGLE &&
                Boolean(item.place_id) &&
                (!item.address || item.id == null);

            if (!needsEnrich || !item.place_id) return;

            void (async () => {
                try {
                    const result = await GetGooglePlaceDetailsApi(item.place_id!);
                    if (openRequestIdRef.current !== requestId) return;
                    if (!result.data) return;

                    const savedId = result.data.id ?? item.id ?? null;
                    const enriched: MapPlaceItem = {
                        ...item,
                        id: savedId,
                        name: result.data.name || item.name,
                        address: result.data.address || item.address,
                        provider_id:
                            result.data.provider_id ?? item.provider_id,
                        coordinate: [
                            result.data.geo.longitude,
                            result.data.geo.latitude,
                        ],
                        place_id: item.place_id,
                        isSaved: savedId != null,
                    };
                    const enrichedVenue: PlaceAgg = {
                        ...mapPlaceItemToPlaceAgg(enriched, matchPool),
                        photos: result.data.photos ?? [],
                    };
                    if (openRequestIdRef.current !== requestId) return;

                    setTempMarker(
                        showTempMarker && savedId == null
                            ? {
                                  latitude: enrichedVenue.latitude,
                                  longitude: enrichedVenue.longitude,
                              }
                            : null
                    );
                    animateTo(enrichedVenue.latitude, enrichedVenue.longitude);
                    onPlaceSelected(enrichedVenue);
                } catch (e) {
                    console.error('Google place enrich failed', e);
                }
            })();
        },
        [animateTo, onPlaceSelected, spendCatalog, visiblePlaces]
    );

    const onPoiClick = useCallback(
        (event: PoiClickEvent) => {
            const {placeId, name, coordinate} = event.nativeEvent;
            if (!placeId) return;

            // Saved id comes from GetGooglePlaceDetailsApi (LocationDetails.id).
            void openPlaceItem(
                {
                    id: null,
                    provider: PlaceSource.GOOGLE,
                    provider_id: Number.isFinite(Number(placeId))
                        ? Number(placeId)
                        : null,
                    place_id: placeId,
                    name,
                    coordinate: [coordinate.longitude, coordinate.latitude],
                    address: undefined,
                    isSaved: false,
                },
                true
            );
        },
        [openPlaceItem]
    );

    // TODO(later): Suggest nearest spend places by proximity inside dropped-pin sheet.
    const onMapLongPress = useCallback(
        (event: LongPressEvent) => {
            const {coordinate} = event.nativeEvent;
            const latitude = coordinate.latitude;
            const longitude = coordinate.longitude;

            setTempMarker({latitude, longitude});
            focusMapOnCoordinate(mapRef, latitude, longitude);
            onDroppedPinRef.current?.({latitude, longitude});
        },
        [mapRef]
    );

    const executeSearch = useCallback(
        async (text: string) => {
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
                if (response.data) setSearchResults(response.data);
            } catch (e) {
                console.error('Map place search failed', e);
            } finally {
                setIsSearching(false);
            }
        },
        [location]
    );

    const handleSearchTextChange = useCallback(
        (text: string) => {
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
            searchTimeoutRef.current = setTimeout(() => {
                void executeSearch(text);
            }, SEARCH_DEBOUNCE_MS);
        },
        [executeSearch]
    );

    const openLocationDetails = useCallback(
        (item: LocationDetails) => {
            const extended = item as LocationDetails & {
                google_place_id?: string | null;
                place_id?: string | null;
            };
            const googlePlaceId =
                extended.google_place_id?.trim() ||
                extended.place_id?.trim() ||
                (item.provider === PlaceSource.GOOGLE
                    ? item.provider_id?.toString() || null
                    : null);
            const savedId = item.id ?? null;
            const providerId =
                item.provider_id == null
                    ? null
                    : Number(item.provider_id);

            void openPlaceItem(
                {
                    id: savedId,
                    provider: item.provider || PlaceSource.GOOGLE,
                    provider_id:
                        providerId != null && Number.isFinite(providerId)
                            ? providerId
                            : null,
                    place_id: googlePlaceId,
                    name: item.name,
                    coordinate: [item.geo.longitude, item.geo.latitude],
                    address: item.address,
                    isSaved: savedId != null,
                },
                savedId == null
            );
        },
        [openPlaceItem]
    );

    const handleSearchResultSelect = useCallback(
        (item: LocationDetails) => {
            clearSearch();
            openLocationDetails(item);
        },
        [clearSearch, openLocationDetails]
    );

    return {
        tempMarker,
        clearTempMarker,
        searchQuery,
        searchResults,
        isSearching,
        handleSearchTextChange,
        handleSearchResultSelect,
        openLocationDetails,
        clearSearch,
        onPoiClick,
        onMapLongPress,
        location,
    };
}
