import type {BaseSettlementDetails} from '@/src/api/dto/expense/settlement';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';

export type ViewerOutcomeType = 'owe' | 'owed' | 'even';

export type ViewerPosition = {
    paid: number;
    share: number;
    net: number;
    settledContribution: number;
    remainingOwed: number;
    remainingOwedToYou: number;
    type: ViewerOutcomeType;
    statusLabel: 'Fully Settled' | 'Partially Settled' | 'Open';
};

export function computeViewerPosition(
    expense: ExpenseDetailsBasicResponse,
    settlements: BaseSettlementDetails[],
    viewerId: number | null | undefined,
): ViewerPosition {
    const paid = expense.user_paid ?? 0;
    const share = expense.user_share ?? 0;
    const net = expense.user_net ?? paid - share;

    let settledOut = 0;
    let settledIn = 0;
    if (viewerId != null) {
        for (const link of settlements) {
            if (link.from_user?.id === viewerId) {
                settledOut += link.amount_inr ?? link.amount ?? 0;
            }
            if (link.to_user?.id === viewerId) {
                settledIn += link.amount_inr ?? link.amount ?? 0;
            }
        }
    }

    const rawDebt = Math.max(0, share - paid);
    const remainingOwed = expense.is_user_settled
        ? 0
        : Math.max(0, rawDebt - settledOut);
    const remainingOwedToYou = expense.is_user_settled
        ? 0
        : Math.max(0, paid - share - settledIn);

    let type: ViewerOutcomeType = 'even';
    if (remainingOwed > 0.005) type = 'owe';
    else if (remainingOwedToYou > 0.005) type = 'owed';

    let statusLabel: ViewerPosition['statusLabel'] = 'Open';
    if (remainingOwed < 0.005 && remainingOwedToYou < 0.005) {
        statusLabel = 'Fully Settled';
    } else if (settledOut > 0.005 || settledIn > 0.005) {
        statusLabel = 'Partially Settled';
    }

    return {
        paid,
        share,
        net,
        settledContribution: settledOut,
        remainingOwed,
        remainingOwedToYou,
        type,
        statusLabel,
    };
}
