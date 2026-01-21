import React from 'react';
import { useConfigStore } from '@/src/store/useConfigStore';
import { useNetworkStore } from '@/src/store/useNetworkStore';
import {AppText} from "@/src/components/common/AppText";
import {useMarketingStore} from "@/src/store/useMarketingStore";

export const GlobalLayerController = () => {
    const isMaintenance = useConfigStore((state) => state.isMaintenance);
    const isOffline = useNetworkStore((state) => state.isOfflineMode);
    const allOffers = useMarketingStore((state) => state.offers);
    const dismissedIds = useMarketingStore((state) => state.dismissedOfferIds);

    const activeOffers = allOffers.filter(o => !dismissedIds.includes(o.id));

    // 1. HIGHEST PRIORITY: Maintenance
    if (isMaintenance) {
        return <AppText> App is under maintenance </AppText>;
    }

    // 2. SECOND PRIORITY: Offline
    if (isOffline) {
        return <AppText> You are offline </AppText>;
    }

    if (activeOffers.length > 0) {
        return <AppText> Showing offers </AppText>;
        // return <MultiOfferOverlay activeOffers={activeOffers} />;
    }

    // 3. LOWEST PRIORITY: Offers (Only visible if 1 & 2 are false)
    // This will be handled via a Modal inside the Home Screen or here
    return null;
};