import React from 'react';
import { configStore } from '@/src/store/configStore';
import { networkStore } from '@/src/store/networkStore';
import {AppText} from "@/src/components/common/AppText";
import {marketingStore} from "@/src/store/marketingStore";

export const GlobalLayerController = () => {
    const isMaintenance = configStore((state) => state.isMaintenance);
    const isOffline = networkStore((state) => state.isOfflineMode);
    const allOffers = marketingStore((state) => state.offers);
    const dismissedIds = marketingStore((state) => state.dismissedOfferIds);

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