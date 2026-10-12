import React from 'react';
import {View, StyleSheet} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {themeStore} from '@/src/store/themeStore';
import {darkMapStyle} from '@/src/constants/darkMapStyle';
import {PlaceDetailBottomSheet} from './components/PlaceDetailBottomSheet';
import {MapSearchOverlay} from './components/MapSearchOverlay';
import {MyLocationFab} from '@/src/components/common/MyLocationFab';
import {useSelectMap} from './hooks/useSelectMap';
import {
    DEFAULT_MAP_CENTER,
    DEFAULT_PLACE_IMAGE,
    INITIAL_REGION_DELTA,
} from './constants/selectMap.constants';

const SelectMapScreen = () => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const {
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
    } = useSelectMap();

    return (
        <View className="flex-1">
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: location?.latitude || DEFAULT_MAP_CENTER.latitude,
                    longitude: location?.longitude || DEFAULT_MAP_CENTER.longitude,
                    latitudeDelta: INITIAL_REGION_DELTA,
                    longitudeDelta: INITIAL_REGION_DELTA,
                }}
                customMapStyle={isDark ? darkMapStyle : []}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                onPoiClick={onPoiClick}
                onLongPress={onMapLongPress}
                onPress={handleMapPress}
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
                            handleSavedMarkerPress(p);
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
                <MyLocationFab
                    isLoading={isLocationLoading}
                    isDark={isDark}
                    onPress={handleMyLocationPress}
                />
            )}

            <PlaceDetailBottomSheet
                isVisible={isSheetVisible}
                place={selectedPlace}
                isSaved={!!selectedPlace?.isSaved}
                onClose={handleCloseSheet}
                onSelect={(savedPlace) => {
                    handlePlaceConfirmed(savedPlace?.id);
                }}
                onSave={(newSavedPlace) => {
                    handlePlaceConfirmed(newSavedPlace?.id ?? null);
                }}
            />
        </View>
    );
};

export default SelectMapScreen;
