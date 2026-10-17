import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {useRouter} from 'expo-router';
import {COLORS} from '@/src/constants/colors';
import {ROUTES} from '@/src/constants/routes';
import {themeStore} from '@/src/store/themeStore';
import {expenseDetailsSheetStore} from '@/src/store/expenseDetailsSheetStore';
import {VenueSheetHeader} from '@/src/screens/spatial-map/components/venue-details/VenueSheetHeader';
import {ExpenseDetailsBody} from './components/ExpenseDetailsBody';
import {useExpenseDetails} from './hooks/useExpenseDetails';

const SNAP_POINTS = ['62%', '88%'] as const;

/** Global peek sheet — opened via expenseDetailsSheetStore. */
export function ExpenseDetailsBottomSheet() {
    const router = useRouter();
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [...SNAP_POINTS], []);

    const visible = expenseDetailsSheetStore((s) => s.visible);
    const expenseId = expenseDetailsSheetStore((s) => s.expenseId);
    const seed = expenseDetailsSheetStore((s) => s.seed);
    const useDummy = expenseDetailsSheetStore((s) => s.useDummy);
    const close = expenseDetailsSheetStore((s) => s.close);

    const {
        expense,
        loading,
        error,
        itemTitles,
        settlements,
        paymentLinks,
        position,
        isViewerPayer,
        viewerId,
    } = useExpenseDetails(expenseId, {
        seed,
        resolveItemTitles: false,
        useDummy,
    });

    useEffect(() => {
        if (visible) {
            sheetRef.current?.present();
        } else {
            sheetRef.current?.dismiss();
        }
    }, [visible]);

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

    const handleSeeAll = useCallback(() => {
        if (expenseId == null) return;
        close();
        setTimeout(() => {
            if (useDummy) {
                router.push({
                    pathname: '/(authenticated)/expense/details',
                    params: {id: String(expenseId), dummy: '1'},
                });
            } else {
                router.push(ROUTES.expenseDetails(expenseId));
            }
        }, 200);
    }, [close, expenseId, router, useDummy]);

    const handlePlace = useCallback(() => {
        const place = expense?.place;
        if (!place?.provider || place.provider_id == null) return;
        close();
        setTimeout(() => {
            router.push(ROUTES.mapPlace(String(place.provider), String(place.provider_id)));
        }, 200);
    }, [close, expense?.place, router]);

    const handleGroup = useCallback(() => {
        const groupId = expense?.group?.id;
        if (groupId == null) return;
        close();
        setTimeout(() => {
            router.push(ROUTES.groupDetails(groupId));
        }, 200);
    }, [close, expense?.group?.id, router]);

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            enableContentPanningGesture
            onDismiss={close}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: colors.bg.primary,
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
                    title="Expense"
                    subtitle={expense?.name ?? (loading ? 'Loading…' : null)}
                    showBack={false}
                    onBack={() => {}}
                    onClose={close}
                />
                <View className="mx-5 h-px bg-border-input" />
                <BottomSheetScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: 40,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <ExpenseDetailsBody
                        mode="snapshot"
                        expense={expense}
                        loading={loading}
                        error={error}
                        itemTitles={itemTitles}
                        settlements={settlements}
                        paymentLinks={paymentLinks}
                        position={position}
                        isViewerPayer={isViewerPayer}
                        viewerId={viewerId}
                        onSeeAll={handleSeeAll}
                        onPlacePress={expense?.place ? handlePlace : undefined}
                        onGroupPress={expense?.group ? handleGroup : undefined}
                    />
                </BottomSheetScrollView>
            </View>
        </BottomSheetModal>
    );
}
