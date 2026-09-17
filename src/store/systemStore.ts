import { create } from 'zustand';
import { BasicImage } from "@/src/api/dto/user/asset";
import {GetSystemDefaultsApi} from "@/src/api/system/defaults";
import {SystemDefaultsResponse} from "@/src/api/dto/system/defaults";

// TODO: Keep a check for decommissioned api endpoints if current version uses any one of it ask user to update the app
// TODO: Tier 1: Device-Level Sanction/Snooping Check (On Signup/Login) = Block high-risk IPs immediately at the server level using an IP geolocation API (like MaxMind). If a request originates from an OFAC-sanctioned country (e.g., Iran, North Korea, Russia), block the user from signing up or logging in entirely.

interface SystemState {
    defaults: {
        defaultExpenseCategory: { id: number, asset: BasicImage } | null;
        defaultGroupCategory: { id: number, asset: BasicImage };
        defaultExpenseItem: { id: number, asset: BasicImage },
        placeholderImage: BasicImage | null;
        defaultGroupIconImage: BasicImage;
        defaultGroupCategoryIconImage: BasicImage;
        defaultGroupBackgroundImage: BasicImage;
        defaultRelationshipImage: BasicImage;
        defaultUserAvatarImage: BasicImage;
    };
    isInitialized: boolean;

    // Actions
    fetchSystemDefaults: () => Promise<void>;
    clearSystemDefaults: () => void;
}

const emptyAsset: BasicImage = {
    id: "",
    name: "",
    url: "",
    extension: ""
};


export const systemStore = create<SystemState>((set) => ({
    defaults: {
        defaultExpenseCategory: null,
        placeholderImage: null,
        defaultGroupCategory: { id: 0, asset: emptyAsset },
        defaultExpenseItem: { id: 0, asset: emptyAsset },
        defaultGroupIconImage: emptyAsset,
        defaultGroupCategoryIconImage: emptyAsset,
        defaultGroupBackgroundImage: emptyAsset,
        defaultRelationshipImage: emptyAsset,
        defaultUserAvatarImage: emptyAsset
    },
    isInitialized: false,

    fetchSystemDefaults: async () => {
        try {
            const response = await GetSystemDefaultsApi();

            if (response && response.data) {
                const data: SystemDefaultsResponse = response.data;
                console.log("Received response", data);

                // Extract a safe fallback icon from the returned API items if available
                const firstAvailableIcon: BasicImage =
                    (data.category && data.category?.icon) ||
                    (data.relationship && data.relationship?.icon) ||
                    (data.expense_item && data.expense_item?.icon) ||
                    emptyAsset;
                console.log("Icon found: ", firstAvailableIcon);
                // Map API response to store defaults with robust fallbacks
                set({
                    defaults: {
                        defaultExpenseCategory: data.category && data.category ? {
                            id: data.category.id,
                            asset: data.category.icon || firstAvailableIcon
                        } : null,

                        defaultGroupCategory: {
                            id: data.category && data.category ? data.category.id : 0,
                            asset: (data.category && data.category?.icon) || firstAvailableIcon
                        },

                        defaultExpenseItem: {
                            id: data.expense_item && data.expense_item ? data.expense_item.id : 0,
                            asset: (data.expense_item && data.expense_item?.icon) || firstAvailableIcon
                        },

                        placeholderImage: firstAvailableIcon.url ? firstAvailableIcon : null,

                        defaultGroupIconImage: firstAvailableIcon,
                        defaultGroupCategoryIconImage: firstAvailableIcon,
                        defaultGroupBackgroundImage: firstAvailableIcon,

                        defaultRelationshipImage:
                            (data.relationship && data.relationship?.icon) || firstAvailableIcon,

                        defaultUserAvatarImage: firstAvailableIcon,
                    },
                    isInitialized: true,
                });

                console.log("✅ System defaults loaded successfully from API");
            } else {
                throw new Error("Invalid response format received from system defaults API");
            }
        } catch (error) {
            console.error("❌ Failed to fetch system defaults", error);
        }
    },

    clearSystemDefaults: () => set({
        defaults: {
            defaultExpenseCategory: null,
            placeholderImage: null,
            defaultGroupCategory: { id: 0, asset: emptyAsset },
            defaultExpenseItem: { id: 0, asset: emptyAsset },
            defaultGroupIconImage: emptyAsset,
            defaultGroupCategoryIconImage: emptyAsset,
            defaultGroupBackgroundImage: emptyAsset,
            defaultRelationshipImage: emptyAsset,
            defaultUserAvatarImage: emptyAsset,
        },
        isInitialized: false
    }),
}));