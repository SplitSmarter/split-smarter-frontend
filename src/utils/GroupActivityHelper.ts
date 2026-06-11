import {
    GroupActivityResponse,
    GroupActivityDetailUnion
} from "@/src/api/dto/user/group";
import {GroupIntent} from "@/src/api/dto/constants";

export class GroupActivityHelper {
    /**
     * Parses the first detail of an activity to provide a summary string.
     */
    static getSummary(activity: GroupActivityResponse): string {
        if (!activity || !activity.details || activity.details.length === 0) {
            return "Updated group details";
        }

        const detail = activity.details[0]; // Usually the most relevant change
        const actorName = activity.actor.name;

        switch (detail.type) {
            case GroupIntent.CREATED:
                return `${actorName} created "${detail.title}"`;

            case GroupIntent.RENAMED:
                return `${actorName} changed name to "${detail.new_title}"`;

            case GroupIntent.ICON_CHANGED:
                return `${actorName} updated the group icon`;

            case GroupIntent.STATUS_TOGGLED:
                return `${actorName} changed group status to ${detail.new_status}`;

            case GroupIntent.SETTINGS_CHANGED:
                // Translates camelCase field names to readable text (e.g., allowMemberExpenses -> Member Expenses)
                const humanField = detail.field_name
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                return `${actorName} updated ${humanField}`;

            default:
                return `${actorName} updated the group`;
        }
    }
}