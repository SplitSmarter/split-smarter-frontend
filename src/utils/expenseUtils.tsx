import { RelationWithUserType } from "@/src/constants/expense";
import { UserContributorsDto, UserPaidByDto } from "@/src/interfaces/expense";
import {isString} from "postcss-selector-parser";

export const formatNumber = (num: number): string => {
    if (isNaN(num)) return "";
    return parseFloat(num.toFixed(2)).toString();
};

export const validateExpense = (
    amount: string,
    contributors: any[],
    paidBy: any[],
): string | null => {
    if (!amount || isNaN(parseFloat(amount))) {
        return "Invalid total amount";
    }
    const total = parseFloat(amount);

    const sumContrib = contributors.reduce((sum, u) => sum + (u.amount || 0), 0);
    const sumPaidBy = paidBy.reduce((sum, u) => sum + (u.amount || 0), 0);

    if (sumContrib > total || sumPaidBy > total) {
        return "Sum of user exceeds locked total";
    }

    if (contributors.length > 0 && paidBy.length > 0 && sumContrib !== sumPaidBy) {
        return "Contributors and Paid By sums must match";
    }

    if (contributors.length === 0) {
        return "Please select at least one contributor";
    }

    if (paidBy.length === 0) {
        return "Please select at least one payer";
    }

    return null;
};

export const mapUsersToDto = (
    users: any[],
    total: number,
    type: "contributor" | "paid_by"
): (UserContributorsDto | UserPaidByDto)[] => {
    return users.map((u) => ({
        user_id: u.id,
        user_type: u.type,
        contribution_pct: total > 0 ? u.amount / total : 0,
    }));
};

export function toggleLock(list: any[], setList: Function, userId: string) {
    setList((prev: any[]) => {
        const unlockedCount = prev.filter((u) => !u.locked).length;
        const clickedUser = prev.find((u) => u.id === userId);

        if (!clickedUser) return prev;

        if (prev.length === 1) {
            return prev.map(u =>
                u.id === userId ? { ...u, locked: true } : u
            );
        }

        if (unlockedCount === 0 && clickedUser.locked) {
            let otherUnlocked = false;
            let userUnlocked = false;
            return prev.map((u) => {
                if (!otherUnlocked) {
                    if (u.id === userId) {
                        userUnlocked = true;
                    } else {
                        otherUnlocked = true;
                    }
                    return { ...u, locked: false };
                } else if (!userUnlocked && u.id === userId) {
                    return { ...u, locked: false };
                }
                return u;
            });
        }

        if (unlockedCount <= 2 && !clickedUser.locked) {
            return prev.map((u) => ({ ...u, locked: true }));
        }

        return prev.map((u) => (u.id === userId ? { ...u, locked: !u.locked } : u));
    });
}

export function removeUser(id: string, type: "contributor" | "paid_by", contributors: any[], setContributors: Function, paidBy: any[], setPaidBy: Function) {
    if (type === "contributor") {
        const updated = contributors.filter((u) => u.id !== id);
        setContributors(updated);

    } else {
        const updated = paidBy.filter((u) => u.id !== id);
        setPaidBy(updated);
    }
}

export function amountUpdate(
    user: any,
    newAmount: number,
    amount: string,
    users: any[],
    setUsers: Function
) {
    if (isNaN(newAmount)) {
        return;
    }
    const roundedAmount = parseFloat(newAmount.toFixed(2));

    let totalVal = parseFloat(amount) || 0;
    const editableUsers = users.filter((u) => u.id !== user.id && u.locked !== true);
    const remainingSum = Math.max(totalVal - roundedAmount, 0);

    const perUserAmount =
        editableUsers.length > 0
            ? parseFloat((remainingSum / editableUsers.length).toFixed(2))
            : 0;

    const updated = users.map((u) => {
        if (u.id === user.id) {
            return { ...u, amount: roundedAmount };
        } else if (u.locked === false) {
            return { ...u, amount: perUserAmount };
        }
        return u;
    });

    setUsers(updated);
}
