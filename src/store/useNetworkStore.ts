import { create } from 'zustand';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

interface NetworkState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    connectionType: string | null; // wifi, cellular, ethernet, etc.
    isWifi: boolean;
    isCellular: boolean;
    isOfflineMode: boolean; // UI flag for "Offline Mode"

    // Actions
    setNetworkState: (state: NetInfoState) => void;
    initNetworkListener: () => NetInfoSubscription;
}

export const useNetworkStore = create<NetworkState>((set) => ({
    isConnected: true,
    isInternetReachable: true,
    connectionType: null,
    isWifi: false,
    isCellular: false,
    isOfflineMode: false,

    setNetworkState: (state) => {
        const isOffline = state.isConnected === false || state.isInternetReachable === false;

        set({
            isConnected: state.isConnected,
            isInternetReachable: state.isInternetReachable,
            connectionType: state.type,
            isWifi: state.type === 'wifi',
            isCellular: state.type === 'cellular',
            isOfflineMode: isOffline,
        });

        if (isOffline) {
            console.log("⚠️ App is in Offline Mode");
        }
    },

    initNetworkListener: () => {
        // Initial fetch to set the starting state
        NetInfo.fetch().then((state) => {
            useNetworkStore.getState().setNetworkState(state);
        });

        // Subscribe to real-time updates
        return NetInfo.addEventListener((state) => {
            useNetworkStore.getState().setNetworkState(state);
        });
    },
}));