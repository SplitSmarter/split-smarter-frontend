import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, View, StyleSheet} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {PlaceAgg} from '../../types/spatialMap.types';
import {VENUE_SHEET_SNAP_POINTS} from './constants';
import type {VenueDetailsBottomSheetProps} from './types';
import {VenueSheetHeader} from './VenueSheetHeader';
import {SinglePlaceBody} from './SinglePlaceBody';
import {ClusterBody} from './ClusterBody';

export function VenueDetailsBottomSheet({
    sheet,
    onClose,
    onSelectVenue: _onSelectVenue,
    dateRange,
    rangeTotalShared,
}: VenueDetailsBottomSheetProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [...VENUE_SHEET_SNAP_POINTS], []);
    const isVisible = Boolean(sheet);

    const [drilledVenue, setDrilledVenue] = useState<PlaceAgg | null>(null);

    useEffect(() => {
        if (!sheet || sheet.kind === 'venue') {
            setDrilledVenue(null);
        }
    }, [sheet]);

    useEffect(() => {
        if (isVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
            setDrilledVenue(null);
        }
    }, [isVisible]);

    /** Android back: undrill cluster → place, else dismiss sheet. */
    useEffect(() => {
        if (!isVisible) return;

        const onHardwareBack = () => {
            if (drilledVenue) {
                setDrilledVenue(null);
                return true;
            }
            bottomSheetModalRef.current?.dismiss();
            return true;
        };

        const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
        return () => sub.remove();
    }, [isVisible, drilledVenue]);

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

    const showingVenue = sheet?.kind === 'venue' ? sheet.venue : drilledVenue;
    const showingCluster = sheet?.kind === 'cluster' && !drilledVenue;
    const showBack = sheet?.kind === 'cluster' && Boolean(drilledVenue);

    const headerTitle = showingVenue
        ? showingVenue.placeName
        : showingCluster
          ? 'Nearby places'
          : '';

    const headerSubtitle = showingVenue
        ? showingVenue.address ?? null
        : showingCluster && sheet?.kind === 'cluster'
          ? `${sheet.venues.length} location${sheet.venues.length === 1 ? '' : 's'} nearby`
          : null;

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            enableContentPanningGesture
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
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
            <View style={styles.container}>
                <VenueSheetHeader
                    title={headerTitle}
                    subtitle={headerSubtitle}
                    showBack={showBack}
                    onBack={() => setDrilledVenue(null)}
                    onClose={onClose}
                />

                <View className="mx-6 h-px bg-border-input" />

                <BottomSheetScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {showingVenue ? (
                        <SinglePlaceBody
                            venue={showingVenue}
                            dateRange={dateRange}
                            rangeTotalShared={rangeTotalShared}
                            onClose={onClose}
                        />
                    ) : null}
                    {showingCluster && sheet?.kind === 'cluster' ? (
                        <ClusterBody
                            venues={sheet.venues}
                            dateRange={dateRange}
                            onSelectVenue={setDrilledVenue}
                        />
                    ) : null}
                </BottomSheetScrollView>
            </View>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 48,
    },
});
