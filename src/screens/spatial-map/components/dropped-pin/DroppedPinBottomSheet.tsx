import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {AppButton} from '@/src/components/common/AppButton';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {PlaceSource} from '@/src/api/dto/constants';
import type {LocationDetails} from '@/src/api/dto/user/place';
import type {UserMerchantDetails} from '@/src/api/dto/expense/merchant';
import {GetUserPlaceByIdApi} from '@/src/api/user/place/location';
import {CreateMerchantLocationApi} from '@/src/api/expense/merchant_location';
import {themeStore} from '@/src/store/themeStore';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {useLocationStore} from '@/src/store/locationStore';
import {VenueSheetHeader} from '@/src/screens/spatial-map/components/venue-details/VenueSheetHeader';
import {QuickActionsRow} from '@/src/screens/spatial-map/components/venue-details/QuickActionsRow';
import {
    openPlaceDirections,
    sharePlace,
} from '@/src/screens/spatial-map/components/venue-details/utils';
import {ensureVenuePlaceSaved} from '@/src/screens/spatial-map/utils/ensureVenuePlaceSaved';
import type {PlaceAgg} from '@/src/screens/spatial-map/types/spatialMap.types';
import {NearbyPlacesCarousel} from '@/src/screens/spatial-map/components/dropped-pin/NearbyPlacesCarousel';
import {SelectMerchantOnlyModal} from '@/src/components/user/SelectMerchantOnlyModal';
import {
    DroppedPinTitleField,
    type DroppedPinTitleFieldHandle,
} from '@/src/screens/spatial-map/components/dropped-pin/DroppedPinTitleField';
import {
    useDroppedPinSheet,
    type DroppedPinCoords,
} from '@/src/screens/spatial-map/components/dropped-pin/useDroppedPinSheet';

const SNAP_POINTS = ['62%', '90%'] as const;

interface DroppedPinBottomSheetProps {
    coords: DroppedPinCoords | null;
    isVisible: boolean;
    onClose: () => void;
    onSelectNearby: (place: LocationDetails) => void;
}

function toCustomVenue(
    coords: DroppedPinCoords,
    name: string,
    opts?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        countryCode?: string;
    }
): PlaceAgg {
    return {
        placeId: `pin:${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`,
        placeName: name,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: opts?.address,
        city: opts?.city,
        state: opts?.state,
        country: opts?.country,
        countryCode: opts?.countryCode,
        totalAmount: 0,
        expensesCount: 0,
        expenses: [],
        provider: PlaceSource.CUSTOM,
        providerId: null,
        googlePlaceId: null,
    };
}

export function DroppedPinBottomSheet({
    coords,
    isVisible,
    onClose,
    onSelectNearby,
}: DroppedPinBottomSheetProps) {
    const router = useRouter();
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const sheetRef = useRef<BottomSheetModal>(null);
    const titleFieldRef = useRef<DroppedPinTitleFieldHandle>(null);
    const snapPoints = useMemo(() => [...SNAP_POINTS], []);
    const [expenseLoading, setExpenseLoading] = useState(false);
    const [merchantBusyLabel, setMerchantBusyLabel] = useState<string | null>(
        null
    );
    const [showMerchantPicker, setShowMerchantPicker] = useState(false);
    const merchantLoading = merchantBusyLabel != null;
    /** Typed title only (empty until user types). Save uses default when blank. */
    const [committedTitle, setCommittedTitle] = useState('');
    const [titleFocused, setTitleFocused] = useState(false);

    const {
        regionLoading,
        nearbyLoading,
        region,
        geocode,
        nearby,
        title,
        subtitle,
    } = useDroppedPinSheet(coords, isVisible);

    const titleResetKey = coords
        ? `${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`
        : 'none';

    const defaultTitle =
        title?.trim() && title !== 'Dropped pin' ? title.trim() : 'Dropped pin';

    useEffect(() => {
        if (isVisible) {
            sheetRef.current?.present();
        } else {
            sheetRef.current?.dismiss();
            setShowMerchantPicker(false);
            setCommittedTitle('');
            setTitleFocused(false);
        }
    }, [isVisible]);

    const resolvedTitle = committedTitle.trim() || defaultTitle;

    const hasAddressParts = Boolean(
        (geocode?.city || region?.locality) &&
            (geocode?.state ||
                region?.administrative_area_level_1 ||
                region?.administrative_area_level_2) &&
            (geocode?.country || region?.country) &&
            (geocode?.countryCode || region?.country_code)
    );

    const handleTitleCommit = useCallback((next: string) => {
        setCommittedTitle(next);
    }, []);

    const flushTitle = useCallback(() => {
        return (
            titleFieldRef.current?.commit() ??
            (committedTitle.trim() || defaultTitle)
        );
    }, [committedTitle, defaultTitle]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={isDark ? 0.72 : 0.38}
            />
        ),
        [isDark]
    );

    const handleSelectNearby = useCallback(
        (place: LocationDetails) => {
            onClose();
            setTimeout(() => onSelectNearby(place), 200);
        },
        [onClose, onSelectNearby]
    );

    const resolveAddressParts = useCallback(() => {
        const city =
            geocode?.city?.trim() || region?.locality?.trim() || undefined;
        const state =
            geocode?.state?.trim() ||
            region?.administrative_area_level_1?.trim() ||
            region?.administrative_area_level_2?.trim() ||
            undefined;
        const country =
            geocode?.country?.trim() || region?.country?.trim() || undefined;
        const countryCode =
            geocode?.countryCode?.trim() ||
            region?.country_code?.trim() ||
            undefined;
        return {city, state, country, countryCode};
    }, [geocode, region]);

    const buildPreviewVenue = useCallback(
        (placeName: string): PlaceAgg => {
            if (!coords) throw new Error('No coordinates');
            const parts = resolveAddressParts();
            return toCustomVenue(coords, placeName, {
                address: subtitle,
                ...parts,
            });
        },
        [coords, resolveAddressParts, subtitle]
    );

    const saveCustomPlace = useCallback(
        async (placeName: string) => {
            if (!coords) throw new Error('No coordinates');
            const {city, state, country, countryCode} = resolveAddressParts();
            if (!city || !state || !country || !countryCode) {
                throw new Error(
                    'Waiting for location details (city, state, country). Try again in a moment.'
                );
            }
            return ensureVenuePlaceSaved(
                toCustomVenue(coords, placeName, {
                    address: subtitle,
                    city,
                    state,
                    country,
                    countryCode,
                })
            );
        },
        [coords, resolveAddressParts, subtitle]
    );

    const handleAddExpense = useCallback(async () => {
        if (!coords || expenseLoading || merchantLoading) return;
        setExpenseLoading(true);
        try {
            const placeName = flushTitle();
            const saved = await saveCustomPlace(placeName);
            const draft = useExpenseDraftStore.getState();
            draft.setExpenseLocation({
                id: String(saved.id),
                name: saved.name,
            });
            draft.setExpenseLocationMode('place');
            // Same handoff path as select-map → CGLSelector (avoids default wipe).
            useLocationStore
                .getState()
                .setTempLocationSelection('place', saved.id);
            onClose();
            setTimeout(() => {
                router.push('/(authenticated)/expense/add');
            }, 200);
        } catch (e) {
            console.error('Failed saving dropped pin for expense', e);
            Alert.alert(
                'Could not save place',
                e instanceof Error
                    ? e.message
                    : 'Save this location before adding an expense, then try again.'
            );
        } finally {
            setExpenseLoading(false);
        }
    }, [
        coords,
        expenseLoading,
        flushTitle,
        merchantLoading,
        onClose,
        router,
        saveCustomPlace,
    ]);

    const handleAddBudget = useCallback(async () => {
        if (!coords || expenseLoading || merchantLoading) return;
        setExpenseLoading(true);
        try {
            const placeName = flushTitle();
            const saved = await saveCustomPlace(placeName);
            onClose();
            setTimeout(() => {
                router.push({
                    pathname: '/(authenticated)/expense/budget/add',
                    params: {
                        placeId: String(saved.id),
                        placeName: saved.name,
                    },
                } as any);
            }, 200);
        } catch (e) {
            console.error('Failed saving dropped pin for budget', e);
            Alert.alert(
                'Could not save place',
                e instanceof Error
                    ? e.message
                    : 'Save this location before adding a budget, then try again.'
            );
        } finally {
            setExpenseLoading(false);
        }
    }, [
        coords,
        expenseLoading,
        flushTitle,
        merchantLoading,
        onClose,
        router,
        saveCustomPlace,
    ]);

    const handleShare = useCallback(() => {
        if (!coords) return;
        const venue = buildPreviewVenue(flushTitle());
        void sharePlace(venue);
    }, [buildPreviewVenue, coords, flushTitle]);

    const handleDirections = useCallback(async () => {
        if (!coords) return;
        const venue = buildPreviewVenue(resolvedTitle);
        const opened = await openPlaceDirections(venue);
        if (!opened) {
            Alert.alert(
                'Directions unavailable',
                'Could not open Maps for this pin.'
            );
        }
    }, [buildPreviewVenue, coords, resolvedTitle]);

    const handleMerchantSelected = useCallback(
        async (merchantId: number, merchant: UserMerchantDetails) => {
            if (!coords || merchantBusyLabel != null) return;
            setShowMerchantPicker(false);
            setMerchantBusyLabel('Adding location…');
            try {
                const placeName = flushTitle();
                const saved = await saveCustomPlace(placeName);
                const placeRes = await GetUserPlaceByIdApi(saved.id);
                const place = placeRes.data;
                if (!place) {
                    throw new Error('Could not load saved place details');
                }

                const providerId =
                    place.provider_id != null
                        ? String(place.provider_id)
                        : null;
                if (!providerId) {
                    throw new Error(
                        'Saved place is missing a provider id for merchant linking'
                    );
                }

                setMerchantBusyLabel('Linking merchant…');
                await CreateMerchantLocationApi({
                    user_merchant_id: merchantId,
                    provider_id: providerId,
                    provider_source:
                        place.provider === PlaceSource.GOOGLE
                            ? PlaceSource.GOOGLE
                            : PlaceSource.CUSTOM,
                });

                Alert.alert(
                    'Merchant linked',
                    `${merchant.name} was linked to “${placeName}”.`
                );
                onClose();
            } catch (e) {
                console.error('Failed linking merchant to dropped pin', e);
                Alert.alert(
                    'Could not link merchant',
                    e instanceof Error
                        ? e.message
                        : 'Save the place and try selecting the merchant again.'
                );
            } finally {
                setMerchantBusyLabel(null);
            }
        },
        [coords, flushTitle, merchantBusyLabel, onClose, saveCustomPlace]
    );

    if (!coords) return null;

    const busy = expenseLoading || merchantLoading;
    const actionsDisabled = busy || regionLoading || !hasAddressParts;

    return (
        <>
            <BottomSheetModal
                ref={sheetRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                enablePanDownToClose={!busy}
                enableContentPanningGesture
                onDismiss={onClose}
                backdropComponent={renderBackdrop}
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustResize"
                backgroundStyle={{
                    backgroundColor: colors.bg.overlay,
                    borderRadius: 40,
                }}
                handleIndicatorStyle={{
                    backgroundColor: colors.icon.lighter,
                    width: 40,
                    height: 5,
                }}
            >
                <View className="flex-1">
                    <VenueSheetHeader
                        title={defaultTitle}
                        subtitle="Dropped pin"
                        showBack={false}
                        onBack={() => {}}
                        onClose={onClose}
                    />
                    <View className="mx-6 h-px bg-border-input" />

                    <BottomSheetScrollView
                        contentContainerStyle={{paddingTop: 16, paddingBottom: 36}}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="gap-y-6">
                            {/* Details — dashboard section header + card */}
                            <View className="px-6">
                                <View className="mb-3 flex-row items-center justify-between">
                                    <AppText
                                        variant="h4"
                                        className="font-bold text-text-primary"
                                    >
                                        Details
                                    </AppText>
                                </View>
                                <View
                                    className="gap-y-3 rounded-3xl border p-4"
                                    style={{
                                        backgroundColor: colors.bg.lighter,
                                        borderColor: colors.status.border,
                                    }}
                                >
                                    <DroppedPinTitleField
                                        ref={titleFieldRef}
                                        resetKey={titleResetKey}
                                        defaultTitle={defaultTitle}
                                        editable={!busy}
                                        placeholderColor={
                                            colors.text.placeholder
                                        }
                                        textColor={colors.text.primary}
                                        onCommit={handleTitleCommit}
                                        onFocusChange={setTitleFocused}
                                    />
                                    {subtitle ? (
                                        <View>
                                            <AppText
                                                variant="caption-xs"
                                                className="mb-1 font-semibold text-text-primary-lighter"
                                            >
                                                Address
                                            </AppText>
                                            <AppText
                                                variant="body-small"
                                                className="text-text-primary"
                                                numberOfLines={3}
                                            >
                                                {subtitle}
                                            </AppText>
                                        </View>
                                    ) : null}
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="px-6">
                                <View className="mb-3 flex-row items-center justify-between">
                                    <AppText
                                        variant="h4"
                                        className="font-bold text-text-primary"
                                    >
                                        Actions
                                    </AppText>
                                </View>
                                <View
                                    className="gap-y-3 rounded-3xl border p-4"
                                    style={{
                                        backgroundColor: colors.bg.lighter,
                                        borderColor: colors.status.border,
                                    }}
                                >
                                    <QuickActionsRow
                                        onAddExpense={() => {
                                            void handleAddExpense();
                                        }}
                                        onAddBudget={() => {
                                            void handleAddBudget();
                                        }}
                                        onShare={handleShare}
                                        onDirections={() => {
                                            void handleDirections();
                                        }}
                                        directionsEnabled
                                        expenseLoading={
                                            expenseLoading || merchantLoading
                                        }
                                        saveActionsDisabled={
                                            regionLoading || !hasAddressParts
                                        }
                                    />
                                    <AppButton
                                        variant="secondary"
                                        hasBorder
                                        loading={merchantLoading}
                                        loadingText={
                                            merchantBusyLabel ??
                                            'Linking merchant…'
                                        }
                                        disabled={actionsDisabled}
                                        onPress={() => {
                                            flushTitle();
                                            setShowMerchantPicker(true);
                                        }}
                                        renderIcon={(c, s) => (
                                            <Iconify
                                                icon="heroicons:building-storefront"
                                                size={s}
                                                color={c}
                                            />
                                        )}
                                    >
                                        Select merchant
                                    </AppButton>
                                </View>
                            </View>

                            {/* Nearby */}
                            <View>
                                <View className="mb-3 flex-row items-center justify-between px-6">
                                    <AppText
                                        variant="h4"
                                        className="font-bold text-text-primary"
                                    >
                                        Nearby places
                                    </AppText>
                                    {!nearbyLoading && nearby.length > 0 ? (
                                        <AppText
                                            variant="body-small"
                                            className="font-semibold text-text-primary-lighter"
                                        >
                                            {nearby.length}
                                        </AppText>
                                    ) : null}
                                </View>
                                <NearbyPlacesCarousel
                                    places={nearby}
                                    loading={nearbyLoading}
                                    originLat={coords.latitude}
                                    originLon={coords.longitude}
                                    onSelect={handleSelectNearby}
                                    showHeader={false}
                                />
                            </View>
                        </View>
                    </BottomSheetScrollView>
                </View>
            </BottomSheetModal>

            <SelectMerchantOnlyModal
                visible={showMerchantPicker}
                caller="dropped_pin"
                onClose={() => setShowMerchantPicker(false)}
                onSelectMerchant={(id, merchant) => {
                    void handleMerchantSelected(id, merchant);
                }}
            />
        </>
    );
}
