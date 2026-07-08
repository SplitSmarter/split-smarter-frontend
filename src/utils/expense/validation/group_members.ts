import { RelationWithUserType } from "@/src/api/dto/constants";
import {GetGroupMembershipsApi} from "@/src/api/group/membership"; // Adjust path to your user type enums

// Reusable structural interface for any user identity lookup context
export interface UniqueUserIdentity {
    user_id: number;
    user_type: RelationWithUserType;
}

interface MissingMembersResult {
    success: boolean;
    missingMembers: UniqueUserIdentity[];
    error?: string;
}

/**
 * Compares an external list of unique users against an internal group membership registry.
 * Returns exactly which users are missing from the group.
 *
 * @param checkingUsers List of user dicts containing { user_id, user_type } to verify
 * @param groupId The backend primary database ID of the target group
 */
export const getMissingGroupMembers = async (
    checkingUsers: UniqueUserIdentity[],
    groupId: number
): Promise<MissingMembersResult> => {
    if (!checkingUsers || checkingUsers.length === 0) {
        return { success: true, missingMembers: [] };
    }

    try {
        // Fetch all active memberships for this group
        const result = await GetGroupMembershipsApi(groupId, { offset: 0, limit: 100 });

        if (!result || !result.data) {
            return {
                success: false,
                missingMembers: [],
                error: "Could not retrieve the membership lists for the chosen group."
            };
        }

        // Generate an optimized compound key lookup Set using "id_type" strings
        const activeGroupCompoundKeys = new Set(
            result.data.map(
                (membership: { user: { id: any; user_type: any; }; }) => `${membership.user?.id}_${membership.user?.user_type}`
            )
        );

        // Filter out items where the compound pair cannot be resolved in the membership layout matrix
        const missingMembers = checkingUsers.filter((candidate) => {
            const candidateKey = `${candidate.user_id}_${candidate.user_type}`;
            return !activeGroupCompoundKeys.has(candidateKey);
        });

        return {
            success: true,
            missingMembers
        };
    } catch (error: any) {
        console.error("Failed to parse compound group membership variations:", error);
        return {
            success: false,
            missingMembers: [],
            error: error?.message || "An error occurred while calculating missing group members."
        };
    }
};