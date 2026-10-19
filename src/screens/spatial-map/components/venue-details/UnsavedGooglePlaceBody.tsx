import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {AppButton} from '@/src/components/common/AppButton';
import {AppText} from '@/src/components/common/AppText';
import {SelectMerchantOnlyModal} from '@/src/components/user/SelectMerchantOnlyModal';
import {PlaceSource} from '@/src/api/dto/constants';
import type {UserMerchantDetails} from '@/src/api/dto/expense/merchant';
import {GetUserPlaceByIdApi} from '@/src/api/user/place/location';
import {CreateMerchantLocationApi} from '@/src/api/expense/merchant_location';
import {COLORS} from '@/src/constants/colors';
import {usePlaceDetails} from '@/src/hooks/usePlaceDetails';
import {themeStore} from '@/src/store/themeStore';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {useLocationStore} from '@/src/store/locationStore';
import {
    DroppedPinTitleField,
    type DroppedPinTitleFieldHandle,
} from '@/src/screens/spatial-map/components/dropped-pin/DroppedPinTitleField';
import {ensureVenuePlaceSaved} from '@/src/screens/spatial-map/utils/ensureVenuePlaceSaved';
import type {PlaceAgg} from '@/src/screens/spatial-map/types/spatialMap.types';
import {QuickActionsRow} from '@/src/screens/spatial-map/components/venue-details/QuickActionsRow';
import {VenuePlacePhotos} from '@/src/screens/spatial-map/components/venue-details/VenuePlacePhotos';
import {
    hasGooglePlaceId,
    openPlaceDirections,
    sharePlace,
} from '@/src/screens/spatial-map/components/venue-details/utils';

interface UnsavedGooglePlaceBodyProps {
    venue: PlaceAgg;
    onClose: () => void;
}

/**
 * Pre-save Google place sheet — same Details / Actions layout as dropped pin,
 * plus Photos under Actions (from Google place details).
 */
export function UnsavedGooglePlaceBody({
    venue,
    onClose,
}: UnsavedGooglePlaceBodyProps) {
    const router = useRouter();
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const titleFieldRef = useRef<DroppedPinTitleFieldHandle>(null);

    const [expenseLoading, setExpenseLoading] = useState(false);
    const [merchantBusyLabel, setMerchantBusyLabel] = useState<string | null>(
        null
    );
    const [showMerchantPicker, setShowMerchantPicker] = useState(false);
    const [committedTitle, setCommittedTitle] = useState('');
    const merchantLoading = merchantBusyLabel != null;
    const busy = expenseLoading || merchantLoading;

    const defaultTitle = venue.placeName?.trim() || 'Google place';
    const titleResetKey =
        venue.googlePlaceId?.trim() ||
        `g:${venue.latitude.toFixed(5)},${venue.longitude.toFixed(5)}`;

    const placeForDetails = useMemo(
        () => ({
            id: null as number | null,
            provider: PlaceSource.GOOGLE,
            provider_id: venue.providerId ?? null,
            place_id: venue.googlePlaceId?.trim() || null,
            name: venue.placeName,
            coordinate: [venue.longitude, venue.latitude] as [number, number],
            address: venue.address,
        }),
        [venue]
    );

    const {loading: detailsLoading, displayData} = usePlaceDetails(
        placeForDetails,
        true
    );

    const photos = useMemo(() => {
        if (displayData.photos?.length) return displayData.photos;
        return venue.photos ?? [];
    }, [displayData.photos, venue.photos]);

    const actionsBlocked = busy || detailsLoading;

    const addressLine =
        displayData.address?.trim() || venue.address?.trim() || undefined;

    const flushTitle = useCallback(() => {
        return (
            titleFieldRef.current?.commit() ??
            (committedTitle.trim() || defaultTitle)
        );
    }, [committedTitle, defaultTitle]);

    const venueWithTitle = useCallback(
        (placeName: string): PlaceAgg => ({
            ...venue,
            placeName,
            address: addressLine || venue.address,
        }),
        [addressLine, venue]
    );

    const saveGooglePlace = useCallback(
        async (placeName: string) => {
            return ensureVenuePlaceSaved(venueWithTitle(placeName));
        },
        [venueWithTitle]
    );

    const handleAddExpense = useCallback(async () => {
        if (busy || detailsLoading) return;
        setExpenseLoading(true);
        try {
            const placeName = flushTitle();
            const saved = await saveGooglePlace(placeName);
            const draft = useExpenseDraftStore.getState();
            draft.setExpenseLocation({
                id: String(saved.id),
                name: saved.name,
            });
            draft.setExpenseLocationMode('place');
            useLocationStore
                .getState()
                .setTempLocationSelection('place', saved.id);
            onClose();
            setTimeout(() => {
                router.push('/(authenticated)/expense/add');
            }, 200);
        } catch (e) {
            console.error('Failed saving Google place for expense', e);
            Alert.alert(
                'Could not save place',
                e instanceof Error
                    ? e.message
                    : 'Save this location before adding an expense, then try again.'
            );
        } finally {
            setExpenseLoading(false);
        }
    }, [busy, detailsLoading, flushTitle, onClose, router, saveGooglePlace]);

    const handleAddBudget = useCallback(async () => {
        if (busy || detailsLoading) return;
        setExpenseLoading(true);
        try {
            const placeName = flushTitle();
            const saved = await saveGooglePlace(placeName);
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
            console.error('Failed saving Google place for budget', e);
            Alert.alert(
                'Could not save place',
                e instanceof Error
                    ? e.message
                    : 'Save this location before adding a budget, then try again.'
            );
        } finally {
            setExpenseLoading(false);
        }
    }, [busy, detailsLoading, flushTitle, onClose, router, saveGooglePlace]);

    const handleShare = useCallback(() => {
        if (detailsLoading) return;
        void sharePlace(venueWithTitle(flushTitle()));
    }, [detailsLoading, flushTitle, venueWithTitle]);

    const handleDirections = useCallback(async () => {
        if (detailsLoading) return;
        const opened = await openPlaceDirections(venue);
        if (!opened) {
            Alert.alert(
                'Directions unavailable',
                'Could not open Maps for this place.'
            );
        }
    }, [detailsLoading, venue]);

    const handleMerchantSelected = useCallback(
        async (merchantId: number, merchant: UserMerchantDetails) => {
            if (merchantBusyLabel != null || detailsLoading) return;
            setShowMerchantPicker(false);
            setMerchantBusyLabel('Adding location…');
            try {
                const placeName = flushTitle();
                const saved = await saveGooglePlace(placeName);
                const placeRes = await GetUserPlaceByIdApi(saved.id);
                const place = placeRes.data;
                if (!place) {
                    throw new Error('Could not load saved place details');
                }

                const providerId =
                    place.provider_id != null
                        ? String(place.provider_id)
                        : saved.providerId != null
                          ? String(saved.providerId)
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
                    provider_source: PlaceSource.GOOGLE,
                });

                Alert.alert(
                    'Merchant linked',
                    `${merchant.name} was linked to “${placeName}”.`
                );
                onClose();
            } catch (e) {
                console.error('Failed linking merchant to Google place', e);
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
        [detailsLoading, flushTitle, merchantBusyLabel, onClose, saveGooglePlace]
    );

    const cardStyle = {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
    };

    return (
        <>
            <View className="gap-y-6">
                <View>
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
                        style={cardStyle}
                    >
                        <DroppedPinTitleField
                            ref={titleFieldRef}
                            resetKey={titleResetKey}
                            defaultTitle={defaultTitle}
                            editable={!busy}
                            placeholderColor={colors.text.placeholder}
                            textColor={colors.text.primary}
                            onCommit={setCommittedTitle}
                        />
                        {addressLine ? (
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
                                    {addressLine}
                                </AppText>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View>
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
                        style={cardStyle}
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
                            directionsEnabled={hasGooglePlaceId(
                                venue.googlePlaceId
                            )}
                            expenseLoading={busy}
                            saveActionsDisabled={detailsLoading}
                        />
                        <AppButton
                            variant="secondary"
                            hasBorder
                            loading={merchantLoading}
                            loadingText={
                                merchantBusyLabel ?? 'Linking merchant…'
                            }
                            disabled={actionsBlocked}
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

                <View>
                    <View className="mb-3 flex-row items-center justify-between">
                        <AppText
                            variant="h4"
                            className="font-bold text-text-primary"
                        >
                            Photos
                        </AppText>
                    </View>
                    <VenuePlacePhotos
                        photos={photos}
                        loading={detailsLoading && photos.length === 0}
                    />
                </View>
            </View>

            <SelectMerchantOnlyModal
                visible={showMerchantPicker}
                caller="unsaved_google"
                onClose={() => setShowMerchantPicker(false)}
                onSelectMerchant={(id, merchant) => {
                    void handleMerchantSelected(id, merchant);
                }}
            />
        </>
    );
}
