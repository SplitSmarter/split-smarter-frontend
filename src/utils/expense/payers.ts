import { RelationWithUserType } from "@/src/api/dto/constants";

export interface SimplePayerObj {
    id: number;
    name: string;
    user_type: RelationWithUserType;
}

/**
 * Computes localized contextual string displaying payer activity logs.
 * Matches both user ID and User Type explicitly against the current viewer identity context matrix.
 */
export const getPayerContextText = (
    payers: SimplePayerObj[],
    currentUser: { id: number; user_type: RelationWithUserType } | null | undefined
): string => {
    if (!payers || payers.length === 0) return "No one paid";

    const hasMe = payers.some(
        (p) =>
            String(p.id) === String(currentUser?.id) &&
            p.user_type === currentUser?.user_type
    );

    if (payers.length === 1) {
        return hasMe ? "Paid by You" : `Paid by ${payers[0].name}`;
    }

    return hasMe
        ? `Paid by You and ${payers.length - 1} Others`
        : `Paid by ${payers[0].name} and ${payers.length - 1} Others`;
};