import { format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * @param {string} utcString - ISO 8601 string from backend (e.g., "2026-01-14T21:33:00Z")
 * @param {string} timeZone - IANA timezone identifier
 */
export const formatToUserTime = (utcString: string, timeZone: string) => {
    try {
        // 1. Parse the UTC string
        const date = parseISO(utcString);

        // 2. Convert to the specific zoned time
        const zonedDate = toZonedTime(date, timeZone);

        // 3. Format for display (e.g., "Jan 14, 2026, 9:33 PM")
        return format(zonedDate, 'PPpp');
    } catch (error) {
        console.error("Conversion failed", error);
        return utcString; // Fallback to raw string
    }
};



/**
 * Converts a localized date (e.g. from a picker) to a UTC ISO string for the backend.
 * @param {Date | string} localDate - The date selected by the user in their local UI.
 * @param {string} timeZone - The user's IANA timezone (e.g., "America/New_York").
 * @returns {string} - An ISO 8601 UTC string (e.g., "2026-01-14T21:33:00.000Z").
 */
export const formatToUTC = (localDate: Date | string, timeZone: string): string => {
    try {
        // 1. Interpret the local date as being in the specific timezone
        const utcDate = fromZonedTime(localDate, timeZone);

        // 2. Return as standard ISO string with the "Z" (Zulu/UTC) suffix
        return utcDate.toISOString();
    } catch (error) {
        console.error("UTC conversion failed", error);
        // Fallback: use native toISOString if conversion fails
        return new Date(localDate).toISOString();
    }
};
