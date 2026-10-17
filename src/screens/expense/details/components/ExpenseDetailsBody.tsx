import React, {useMemo} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {
    ExpenseDetailsBasicResponse,
    ExpenseDetailsResponse,
    PaymentLinkSummary,
} from '@/src/api/dto/expense/expense';
import type {BaseSettlementDetails} from '@/src/api/dto/expense/settlement';
import type {PaymentLinkDetails} from '@/src/api/dto/expense/payment_link';
import type {ViewerPosition} from '@/src/screens/expense/details/utils/viewerPosition';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {ExpenseSplitGraph} from '@/src/components/expense/connections-graph/ExpenseSplitGraph';
import {ConnectionsListView} from '@/src/components/expense/connections-graph/ConnectionsListView';
import {buildGraphFromExpenseDetails} from '@/src/utils/expense/buildGraphFromExpenseDetails';
import {ExpenseHeroCard} from '@/src/screens/expense/details/components/ExpenseHeroCard';
import {ExpensePositionStrip} from '@/src/screens/expense/details/components/ExpensePositionStrip';
import {ExpenseSettlementPath} from '@/src/screens/expense/details/components/ExpenseSettlementPath';
import {ExpensePaidBySharersSection} from '@/src/screens/expense/details/components/ExpensePaidBySharersSection';
import {ExpenseProofSection} from '@/src/screens/expense/details/components/ExpenseProofSection';
import {ExpenseContextChips} from '@/src/screens/expense/details/components/ExpenseContextChips';
import {ExpenseExtrasSection} from '@/src/screens/expense/details/components/ExpenseExtrasSection';
import {ExpenseScheduleSection} from '@/src/screens/expense/details/components/ExpenseScheduleSection';
import {ExpenseAuditFooter} from '@/src/screens/expense/details/components/ExpenseAuditFooter';
import {ExpenseActionsRow} from '@/src/screens/expense/details/components/ExpenseActionsRow';

type ExpenseView = ExpenseDetailsBasicResponse | ExpenseDetailsResponse;

function isFull(e: ExpenseView): e is ExpenseDetailsResponse {
    return 'line_items' in e && Array.isArray((e as ExpenseDetailsResponse).line_items);
}

interface ExpenseDetailsBodyProps {
    mode: 'snapshot' | 'full';
    expense: ExpenseView | null;
    loading?: boolean;
    error?: string | null;
    itemTitles?: Record<number, string>;
    settlements?: BaseSettlementDetails[];
    paymentLinks?: Array<PaymentLinkDetails | PaymentLinkSummary>;
    position?: ViewerPosition | null;
    isViewerPayer?: boolean;
    viewerId?: number | null;
    onSettle?: () => void;
    onUseTransfer?: () => void;
    onLinkPayment?: () => void;
    onEdit?: () => void;
    onSeeAll?: () => void;
    onPlacePress?: () => void;
    onGroupPress?: () => void;
    onMemoryPress?: () => void;
    /** When true, hero is rendered by the parent (full-screen platinum). */
    hideHero?: boolean;
}

export function ExpenseDetailsBody({
    mode,
    expense,
    loading = false,
    error = null,
    itemTitles = {},
    settlements = [],
    paymentLinks = [],
    position = null,
    isViewerPayer = false,
    viewerId = null,
    onSettle,
    onUseTransfer,
    onLinkPayment,
    onEdit,
    onSeeAll,
    onPlacePress,
    onGroupPress,
    onMemoryPress,
    hideHero = false,
}: ExpenseDetailsBodyProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const connectionsGraphData = useMemo(
        () => (expense ? buildGraphFromExpenseDetails(expense, itemTitles) : null),
        [expense, itemTitles],
    );

    if (!expense && loading) {
        return (
            <View className="items-center py-12">
                <ActivityIndicator color={colors.accent.sky} />
                <AppText variant="body-small" className="mt-3 text-text-primary-lighter">
                    Loading expense…
                </AppText>
            </View>
        );
    }

    if (!expense || !connectionsGraphData) {
        return (
            <View className="items-center px-4 py-12">
                <AppText variant="body-base" className="text-center text-text-primary">
                    {error ?? 'Expense not found'}
                </AppText>
            </View>
        );
    }

    const full = isFull(expense) ? expense : null;
    const showSettleActions =
        position != null && position.remainingOwed > 0.005 && !!onSettle;

    const hasConnections =
        connectionsGraphData.payers.length > 0 ||
        connectionsGraphData.splitUsers.length > 0 ||
        connectionsGraphData.items.length > 0;

    const paidByList = (
        <ExpensePaidBySharersSection
            paidBy={expense.paid_by_users ?? []}
            sharers={expense.sharers ?? []}
            currency={expense.currency}
            paymentLinks={paymentLinks}
            viewerId={viewerId}
            isViewerPayer={isViewerPayer}
        />
    );

    return (
        <View className="gap-y-6">
            {!hideHero ? (
                <ExpenseHeroCard expense={expense} position={position} variant="card" />
            ) : null}

            {position ? (
                <ExpensePositionStrip position={position} currency={expense.currency} />
            ) : null}

            {mode === 'full' && position ? (
                <ExpenseSettlementPath
                    settlements={settlements}
                    position={position}
                    currency={expense.currency}
                    onSettle={showSettleActions ? onSettle : undefined}
                    onUseTransfer={showSettleActions ? onUseTransfer : undefined}
                />
            ) : null}

            {hasConnections ? (
                <ExpenseSplitGraph
                    data={connectionsGraphData}
                    initialViewMode="graph"
                    listContent={
                        <ConnectionsListView
                            data={connectionsGraphData}
                            viewerId={viewerId}
                            isViewerPayer={isViewerPayer}
                            paymentLinks={paymentLinks}
                        />
                    }
                />
            ) : (
                paidByList
            )}

            <ExpenseContextChips
                expense={expense}
                onPlacePress={onPlacePress}
                onGroupPress={onGroupPress}
                onMemoryPress={onMemoryPress}
            />

            {mode === 'snapshot' ? (
                <ExpenseActionsRow
                    showSettle={showSettleActions}
                    onSettle={onSettle}
                    onEdit={onEdit}
                    onSeeAll={onSeeAll}
                />
            ) : null}

            {loading && mode === 'snapshot' ? (
                <ActivityIndicator color={colors.accent.sky} />
            ) : null}

            {error && expense ? (
                <AppText variant="caption-xs" className="text-center text-red-decrease">
                    {error}
                </AppText>
            ) : null}

            {mode === 'full' && full ? (
                <>
                    <ExpenseProofSection
                        assets={full.assets ?? []}
                        showLinkPayment={isViewerPayer}
                        onLinkPayment={onLinkPayment}
                    />
                    <ExpenseExtrasSection
                        description={full.description}
                        extras={full.extra_details ?? []}
                    />
                    {full.schedule_blueprint ? (
                        <ExpenseScheduleSection blueprint={full.schedule_blueprint} />
                    ) : null}
                    <ExpenseAuditFooter
                        createdBy={full.created_by}
                        createdAt={full.created_at}
                        updatedAt={full.updated_at}
                    />
                </>
            ) : null}
        </View>
    );
}
