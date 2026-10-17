import React, {useCallback} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {AppText} from '@/src/components/common/AppText';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {ROUTES} from '@/src/constants/routes';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {ExpenseDetailsBody} from '@/src/screens/expense/details/components/ExpenseDetailsBody';
import {ExpenseHeroCard} from '@/src/screens/expense/details/components/ExpenseHeroCard';
import {useExpenseDetails} from '@/src/screens/expense/details/hooks/useExpenseDetails';

/**
 * Full enriched expense details — platinum hero + primary canvas sections.
 * Route: /(authenticated)/expense/details?id={expenseId}
 */
export const ExpenseDetailsScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{id?: string; dummy?: string}>();
    const expenseId = params.id ? Number(params.id) : null;
    const useDummy = params.dummy === '1' || params.dummy === 'true';
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;

    const {
        expense,
        loading,
        error,
        itemTitles,
        refresh,
        settlements,
        paymentLinks,
        position,
        isViewerPayer,
        viewerId,
    } = useExpenseDetails(
        expenseId != null && !Number.isNaN(expenseId) ? expenseId : null,
        {resolveItemTitles: !useDummy, useDummy},
    );

    const handlePlace = useCallback(() => {
        const place = expense?.place;
        if (!place?.provider || place.provider_id == null) return;
        router.push(ROUTES.mapPlace(String(place.provider), String(place.provider_id)));
    }, [expense?.place, router]);

    const handleGroup = useCallback(() => {
        const groupId = expense?.group?.id;
        if (groupId == null) return;
        router.push(ROUTES.groupDetails(groupId));
    }, [expense?.group?.id, router]);

    const handleLinkPayment = useCallback(() => {
        router.push('/(authenticated)/payment/user/transfer');
    }, [router]);

    const invalidId = expenseId == null || Number.isNaN(expenseId);

    return (
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <ScrollView
                className="flex-1"
                style={{backgroundColor: colors.bg.primary}}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 48}}
            >
                {invalidId ? (
                    <View className="px-5 pt-10">
                        <AppText
                            variant="body-base"
                            className="text-center text-red-decrease"
                        >
                            Missing expense id in route
                        </AppText>
                    </View>
                ) : !expense && loading ? (
                    <View className="items-center py-20">
                        <ActivityIndicator color={colors.accent.sky} />
                        <AppText
                            variant="body-small"
                            className="mt-3 text-text-primary-lighter"
                        >
                            Loading expense…
                        </AppText>
                    </View>
                ) : expense ? (
                    <>
                        <ExpenseHeroCard
                            variant="hero"
                            expense={expense}
                            position={position}
                            expenseIdLabel={`#EXP-${expenseId}`}
                            loading={loading}
                            onBack={() => router.back()}
                            onRefresh={() => void refresh()}
                        />

                        <View className="mt-5 px-5">
                            <ExpenseDetailsBody
                                mode="full"
                                expense={expense}
                                loading={loading}
                                error={error}
                                itemTitles={itemTitles}
                                settlements={settlements}
                                paymentLinks={paymentLinks}
                                position={position}
                                isViewerPayer={isViewerPayer}
                                viewerId={viewerId}
                                hideHero
                                onLinkPayment={isViewerPayer ? handleLinkPayment : undefined}
                                onPlacePress={expense.place ? handlePlace : undefined}
                                onGroupPress={expense.group ? handleGroup : undefined}
                            />
                        </View>
                    </>
                ) : (
                    <View className="px-5 pt-10">
                        <AppText
                            variant="body-base"
                            className="text-center text-text-primary"
                        >
                            {error ?? 'Expense not found'}
                        </AppText>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

export default ExpenseDetailsScreen;
