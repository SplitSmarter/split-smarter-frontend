import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CurrencyType } from "@/src/constants/expense";
import { UserInfoApi } from "@/src/api/user/user";
import {BasicImage} from "@/src/api/dto/user/asset";

export type SubscriptionTier = 'free' | 'pro' | 'premium';

// Permissions are now part of the User definition
export interface UserPermissions {
    max_saved_places: number;
    can_use_premium_map: boolean;
    has_cloud_sync: boolean;
}

export interface UserDetails extends UserPermissions {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
    city?: string;
    region?: string;
    country: string;
    currency: CurrencyType;
    avatar: BasicImage;
    language: string;
    registered_on: string;
    subscription_tier: SubscriptionTier;
}

interface UserState {
    user: UserDetails | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: UserDetails) => void;
    updateUser: (fields: Partial<UserDetails>) => void;
    clearUser: () => void;
    syncUserFromServer: () => Promise<void>;
}

export const userStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

            updateUser: (fields) =>
                set((state) =>
                    state.user
                        ? { user: { ...state.user, ...fields }, isAuthenticated: true }
                        : state
                ),

            clearUser: () => set({ user: null, isAuthenticated: false }),

            syncUserFromServer: async () => {
                try {
                    const res = await UserInfoApi();
                    // Assuming API returns fields like max_saved_places, etc.
                    set({ isAuthenticated: true, isLoading: false });
                } catch (err) {
                    console.error("Failed to sync user:", err);
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = false;
                }
            },
        }
    )
);