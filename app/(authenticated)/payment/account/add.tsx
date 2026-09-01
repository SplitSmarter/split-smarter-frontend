import AccountLinkingScreen from '@/src/components/payments/AccountLinkingScreen';
import React, { useEffect, useRef } from 'react';

export default function AddAccountScreen() {
    const routerRef = useRef<any>(null);

    useEffect(() => {
        // Import router dynamically after mount to avoid context issues
        const { router } = require('expo-router');
        routerRef.current = router;
    }, []);

    const handleAccountLinked = () => {
        const router = routerRef.current;
        if (!router) return;

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)/(tabs)');
        }
    };

    return (
        <AccountLinkingScreen
            onAccountLinked={handleAccountLinked}
        />
    );
}