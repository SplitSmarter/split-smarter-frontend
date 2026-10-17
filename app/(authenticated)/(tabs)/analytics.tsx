import React, {useCallback, useMemo} from 'react';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {RegionalExpenseMap} from '@/src/screens/spatial-map';

const AnalyticsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{
        provider?: string | string[];
        id?: string | string[];
        ts?: string | string[];
    }>();

    const pendingPlaceLink = useMemo(() => {
        const provider = Array.isArray(params.provider)
            ? params.provider[0]
            : params.provider;
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const ts = Array.isArray(params.ts) ? params.ts[0] : params.ts;
        if (!provider || !id) return null;
        return {provider, id, ts};
    }, [params.provider, params.id, params.ts]);

    const handlePlaceLinkConsumed = useCallback(() => {
        router.setParams({provider: undefined, id: undefined, ts: undefined});
    }, [router]);

    return (
        <RegionalExpenseMap
            pendingPlaceLink={pendingPlaceLink}
            onPlaceLinkConsumed={handlePlaceLinkConsumed}
        />
    );
};

export default AnalyticsScreen;
