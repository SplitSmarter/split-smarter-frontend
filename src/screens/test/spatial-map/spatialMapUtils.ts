import {Region} from 'react-native-maps';
import {ExpenseTxn} from './dummyExpenseMapData';

export type VenueAgg = {
    venueId: string;
    venueName: string;
    latitude: number;
    longitude: number;
    neighborhood: string;
    category: ExpenseTxn['category'];
    amount: number;
    visits: number;
    txns: ExpenseTxn[];
    tripId?: string;
};

export type MapCluster = {
    id: string;
    latitude: number;
    longitude: number;
    amount: number;
    visits: number;
    label: string;
    venues: VenueAgg[];
};

export const formatINR = (amount: number) =>
    `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const isCoordInRegion = (lat: number, lng: number, region: Region) => {
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLng = region.longitude - region.longitudeDelta / 2;
    const maxLng = region.longitude + region.longitudeDelta / 2;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

export const filterTxns = (
    txns: ExpenseTxn[],
    monthId: string,
    markerMode: 'all' | 'frequent' | 'unique',
    visitCounts: Map<string, number>,
) => {
    return txns.filter((txn) => {
        if (monthId !== 'all' && !txn.at.startsWith(monthId)) return false;
        const visits = visitCounts.get(txn.venueId) ?? 1;
        if (markerMode === 'frequent' && visits < 3) return false;
        if (markerMode === 'unique' && visits >= 3) return false;
        return true;
    });
};

export const aggregateVenues = (txns: ExpenseTxn[]): VenueAgg[] => {
    const map = new Map<string, VenueAgg>();
    for (const txn of txns) {
        const existing = map.get(txn.venueId);
        if (existing) {
            existing.amount += txn.amount;
            existing.visits += 1;
            existing.txns.push(txn);
        } else {
            map.set(txn.venueId, {
                venueId: txn.venueId,
                venueName: txn.venueName,
                latitude: txn.latitude,
                longitude: txn.longitude,
                neighborhood: txn.neighborhood,
                category: txn.category,
                amount: txn.amount,
                visits: 1,
                txns: [txn],
                tripId: txn.tripId,
            });
        }
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
};

export const visitCountsFrom = (txns: ExpenseTxn[]) => {
    const counts = new Map<string, number>();
    for (const txn of txns) {
        counts.set(txn.venueId, (counts.get(txn.venueId) ?? 0) + 1);
    }
    return counts;
};

export const clusterVenues = (venues: VenueAgg[], region: Region): MapCluster[] => {
    if (region.latitudeDelta < 0.035) {
        return venues.map((v) => ({
            id: `v-${v.venueId}`,
            latitude: v.latitude,
            longitude: v.longitude,
            amount: v.amount,
            visits: v.visits,
            label: v.venueName,
            venues: [v],
        }));
    }

    const cell = Math.max(region.latitudeDelta / 5, 0.012);
    const buckets = new Map<string, VenueAgg[]>();
    for (const venue of venues) {
        const key = `${Math.round(venue.latitude / cell)}_${Math.round(venue.longitude / cell)}`;
        const list = buckets.get(key) ?? [];
        list.push(venue);
        buckets.set(key, list);
    }

    return [...buckets.entries()].map(([key, list]) => {
        const amount = list.reduce((s, v) => s + v.amount, 0);
        const visits = list.reduce((s, v) => s + v.visits, 0);
        const neighborhood = [...list.reduce((m, v) => {
            m.set(v.neighborhood, (m.get(v.neighborhood) ?? 0) + v.amount);
            return m;
        }, new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Hotspot';
        const lat = list.reduce((s, v) => s + v.latitude, 0) / list.length;
        const lng = list.reduce((s, v) => s + v.longitude, 0) / list.length;
        return {
            id: `c-${key}`,
            latitude: lat,
            longitude: lng,
            amount,
            visits,
            label: list.length === 1 ? list[0].venueName : `${neighborhood} hotspot`,
            venues: list,
        };
    });
};

export const weekdayHourPeak = (txns: ExpenseTxn[]) => {
    if (!txns.length) return null;
    const buckets = new Map<string, {amount: number; count: number}>();
    for (const txn of txns) {
        const d = new Date(txn.at);
        const day = d.toLocaleDateString('en-IN', {weekday: 'long'});
        const hour = d.getHours();
        const slot =
            hour < 11 ? 'mornings' : hour < 16 ? 'afternoons' : hour < 20 ? 'evenings' : 'nights';
        const key = `${day}|${slot}`;
        const cur = buckets.get(key) ?? {amount: 0, count: 0};
        cur.amount += txn.amount;
        cur.count += 1;
        buckets.set(key, cur);
    }
    const top = [...buckets.entries()].sort((a, b) => b[1].amount - a[1].amount)[0];
    if (!top) return null;
    const [day, slot] = top[0].split('|');
    const window =
        slot === 'mornings'
            ? '7 AM – 11 AM'
            : slot === 'afternoons'
              ? '12 PM – 4 PM'
              : slot === 'evenings'
                ? '5 PM – 8 PM'
                : '8 PM – 11 PM';
    return {copy: `You spend most here on ${day} ${slot} (${window})`, amount: top[1].amount};
};

export const neighborhoodTotals = (txns: ExpenseTxn[]) => {
    const map = new Map<string, number>();
    for (const txn of txns) {
        if (txn.tripId) continue;
        map.set(txn.neighborhood, (map.get(txn.neighborhood) ?? 0) + txn.amount);
    }
    return [...map.entries()]
        .map(([name, amount]) => ({name, amount}))
        .sort((a, b) => b.amount - a.amount);
};

export const dayKey = (iso: string) => iso.slice(0, 10);

export const trailDays = (txns: ExpenseTxn[]) => {
    const byDay = new Map<string, ExpenseTxn[]>();
    for (const txn of txns) {
        if (txn.tripId) continue;
        const key = dayKey(txn.at);
        const list = byDay.get(key) ?? [];
        list.push(txn);
        byDay.set(key, list);
    }
    return [...byDay.entries()]
        .map(([date, list]) => ({
            date,
            txns: list.sort((a, b) => a.at.localeCompare(b.at)),
        }))
        .filter((d) => d.txns.length >= 3)
        .sort((a, b) => b.date.localeCompare(a.date));
};

export const tripSpend = (txns: ExpenseTxn[], tripId: string) => {
    const list = txns.filter((t) => t.tripId === tripId);
    const days = new Set(list.map((t) => dayKey(t.at))).size;
    const top = aggregateVenues(list)[0];
    const amount = list.reduce((s, t) => s + t.amount, 0);
    return {list, days, top, amount};
};
