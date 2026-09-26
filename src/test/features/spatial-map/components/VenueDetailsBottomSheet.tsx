import React, {useMemo} from 'react';
import {View, Pressable, ScrollView, Image} from 'react-native';
import {AppBottomSheet} from '@/src/components/common/AppBottomSheet';
import {AppText} from '@/src/components/common/AppText';
import {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import {PlaceAgg, SheetState} from '@/src/test/features/spatial-map/types/spatialMap.types';
import {formatINR} from '@/src/test/features/spatial-map/utils/spatialMap.utils';

interface VenueDetailsBottomSheetProps {
    sheet: SheetState | null;
    onClose: () => void;
    onSelectVenue: (venue: PlaceAgg) => void;
}

/**
 * Robust date/time parser tailored for React Native / Hermes engine compatibility.
 * Extracts components reliably regardless of 'T' delimiter or SQL timestamp format.
 */
function parseExpenseDate(dateStr?: string): Date | null {
    if (!dateStr) return null;

    // 1. Direct Regex Match for YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
    const isoMatch = dateStr.match(
        /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/
    );

    if (isoMatch) {
        const [, year, month, day, hour, minute, second] = isoMatch;
        return new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1, // Months are 0-indexed in JS Date
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            second ? parseInt(second, 10) : 0
        );
    }

    // 2. Fallback to standard Date parsing (e.g., ISO string with timezone offsets)
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Safely formats timestamp string across all JS runtimes.
 */
function formatExpenseTime(dateStr?: string): string {
    const dateObj = parseExpenseDate(dateStr);

    if (!dateObj) {
        return dateStr || '';
    }

    return dateObj.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function VenueDetailsBottomSheet({
                                            sheet,
                                            onClose,
                                            onSelectVenue,
                                        }: VenueDetailsBottomSheetProps) {
    const isVisible = Boolean(sheet);

    const clusterTotal = useMemo(() => {
        if (sheet?.kind === 'cluster' && Array.isArray(sheet.venues)) {
            return sheet.venues.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
        }
        return 0;
    }, [sheet]);

    return (
        <AppBottomSheet isVisible={isVisible} onClose={onClose} snapPoints={['48%', '78%']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
            >
                {sheet?.kind === 'venue' && <VenueSheet venue={sheet.venue}/>}
                {sheet?.kind === 'cluster' && (
                    <View>
                        <AppText variant="h3" className="mb-1 font-bold text-text-primary">
                            Locations Cluster
                        </AppText>
                        <AppText variant="body-small" className="mb-4 text-text-secondary">
                            {formatINR(clusterTotal)} · {sheet.venues.length} places
                        </AppText>
                        {sheet.venues.map((v) => {
                            const categoryIcons = getUniqueCategoryIcons(v.expenses);

                            return (
                                <Pressable
                                    key={v.placeId}
                                    onPress={() => onSelectVenue(v)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${v.placeName}, ${v.expensesCount} visits, total ${formatINR(v.totalAmount)}`}
                                    className="flex-row items-center justify-between border-b border-foreground/10 py-3"
                                >
                                    <View className="flex-1 pr-3">
                                        <View className="flex-row items-center gap-x-2">
                                            <CategoryIconList icons={categoryIcons}/>
                                            <AppText
                                                variant="body-base"
                                                className="flex-1 font-semibold text-text-primary"
                                                numberOfLines={1}
                                            >
                                                {v.placeName}
                                            </AppText>
                                        </View>
                                        <AppText
                                            variant="body-xs"
                                            className="mt-1 text-text-secondary"
                                            numberOfLines={1}
                                        >
                                            {v.expensesCount} visit{v.expensesCount === 1 ? '' : 's'}
                                            {v.address ? ` · ${v.address}` : ''}
                                        </AppText>
                                    </View>
                                    <AppText variant="body-base" className="font-bold text-text-primary">
                                        {formatINR(v.totalAmount)}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </AppBottomSheet>
    );
}

function VenueSheet({venue}: { venue: PlaceAgg }) {
    const categoryIcons = useMemo(
        () => getUniqueCategoryIcons(venue.expenses),
        [venue.expenses]
    );

    // Sorting utilizing robust date parsing
    const sortedExpenses = useMemo(() => {
        if (!venue.expenses) return [];
        return [...venue.expenses].sort((a, b) => {
            const timeA = parseExpenseDate(a.expense_date)?.getTime() ?? 0;
            const timeB = parseExpenseDate(b.expense_date)?.getTime() ?? 0;
            return timeB - timeA;
        });
    }, [venue.expenses]);

    return (
        <View>
            <View className="mb-1 flex-row items-center gap-x-2">
                <CategoryIconList icons={categoryIcons} size={24}/>
                <AppText variant="h3" className="flex-1 font-bold text-text-primary">
                    {venue.placeName}
                </AppText>
            </View>
            <AppText variant="body-small" className="mb-4 mt-1 text-text-secondary">
                {venue.address ? `${venue.address} · ` : ''}
                {venue.expensesCount} visit{venue.expensesCount === 1 ? '' : 's'}
            </AppText>
            <AppText variant="h4" className="mb-3 font-bold text-text-primary">
                {formatINR(venue.totalAmount)}
            </AppText>
            {sortedExpenses.map((txn) => (
                <TxnRow key={txn.id} txn={txn}/>
            ))}
        </View>
    );
}

function TxnRow({txn}: { txn: ExpenseDetailsBasicResponse }) {
    const formattedTime = formatExpenseTime(txn.expense_date);
    const amount = txn.user_contribution ?? txn.total_amount ?? 0;
    const iconUrl = txn.category?.icon?.url;

    return (
        <View className="border-b border-foreground/10 py-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-x-2">
                    {iconUrl ? (
                        <Image
                            source={{uri: iconUrl}}
                            className="h-5 w-5 rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <AppText variant="body-small">📍</AppText>
                    )}
                    <AppText variant="body-small" className="font-semibold text-text-primary">
                        {formattedTime}
                    </AppText>
                </View>
                <AppText variant="body-small" className="font-bold text-text-primary">
                    {formatINR(amount)}
                </AppText>
            </View>
            {txn.name ? (
                <AppText variant="body-xs" className="mt-1 text-text-secondary" numberOfLines={1}>
                    {txn.name}
                </AppText>
            ) : null}
        </View>
    );
}

// Helper: Extracts unique category image URLs safely
function getUniqueCategoryIcons(expenses: ExpenseDetailsBasicResponse[] = []): string[] {
    const iconUrls = new Set<string>();
    expenses.forEach((e) => {
        if (e.category?.icon?.url) {
            iconUrls.add(e.category.icon.url);
        }
    });
    return Array.from(iconUrls);
}

// Helper: Render category icon list or default pin
function CategoryIconList({icons, size = 18}: { icons: string[]; size?: number }) {
    if (!icons || icons.length === 0) {
        return <AppText style={{fontSize: size}}>📍</AppText>;
    }

    return (
        <View className="flex-row items-center gap-x-1">
            {icons.slice(0, 3).map((url) => (
                <Image
                    key={url}
                    source={{uri: url}}
                    style={{width: size, height: size, borderRadius: size / 2}}
                    resizeMode="cover"
                />
            ))}
        </View>
    );
}