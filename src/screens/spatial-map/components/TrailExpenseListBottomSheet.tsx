import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {VenueSheetHeader} from './venue-details/VenueSheetHeader';
import type {TrailTxn} from './TrailLayer';
import {TrailExpenseListRow} from './TrailExpenseListRow';

const SNAP_POINTS = ['50%', '75%'] as const;

interface TrailExpenseListBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    trail: TrailTxn[];
    indexMin: number;
    indexMax: number;
    totalCount: number;
    /** Optional amount labels keyed by expense id string. */
    amountById?: Record<string, string>;
    onSelectTxn: (txn: TrailTxn) => void;
}

export function TrailExpenseListBottomSheet({
    isVisible,
    onClose,
    trail,
    indexMin,
    indexMax,
    totalCount,
    amountById,
    onSelectTxn,
}: TrailExpenseListBottomSheetProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [...SNAP_POINTS], []);

    const filtered = useMemo(
        () =>
            trail.filter((t) => {
                const i = t.index ?? 0;
                return i >= indexMin && i <= indexMax;
            }),
        [trail, indexMin, indexMax]
    );

    useEffect(() => {
        if (isVisible) {
            sheetRef.current?.present();
        } else {
            sheetRef.current?.dismiss();
        }
    }, [isVisible]);

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

    const handleSelect = useCallback(
        (txn: TrailTxn) => {
            onClose();
            setTimeout(() => onSelectTxn(txn), 200);
        },
        [onClose, onSelectTxn]
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
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
            <View className="flex-1">
                <VenueSheetHeader
                    title="Trail stops"
                    subtitle={`${indexMin} – ${indexMax} / ${totalCount}`}
                    showBack={false}
                    onBack={() => {}}
                    onClose={onClose}
                />
                <View className="mx-6 h-px bg-border-input" />

                {filtered.length === 0 ? (
                    <View className="items-center px-6 py-12">
                        <AppText
                            variant="body-base"
                            className="text-center text-text-primary-lighter"
                        >
                            No stops in this range
                        </AppText>
                    </View>
                ) : (
                    <BottomSheetFlatList
                        data={filtered}
                        keyExtractor={(item, i) =>
                            `trail-list-${item.id}-${item.index ?? i}`
                        }
                        contentContainerStyle={{
                            paddingBottom: 40,
                            paddingTop: 4,
                        }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) => (
                            <TrailExpenseListRow
                                txn={item}
                                amountLabel={
                                    amountById?.[String(item.id)] ?? null
                                }
                                isLast={index === filtered.length - 1}
                                onPress={() => handleSelect(item)}
                            />
                        )}
                    />
                )}
            </View>
        </BottomSheetModal>
    );
}
