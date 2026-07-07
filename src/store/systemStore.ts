import { create } from 'zustand';
import { BasicImage } from "@/src/api/dto/user/asset";

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
            // TODO: call an actual backend instead of mocking api
            // Note: In production, replace this with your API call:
            // const response = await GetSystemDefaultsApi();
            // set({ defaults: response.data, isInitialized: true });

            set({
                defaults: {
                    defaultExpenseCategory: {
                        id: 1,
                        asset: {
                            id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                            name: "default_expense",
                            url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                            extension: "png",
                        },
                    },
                    defaultGroupCategory: {
                        id: 1,
                        asset: {
                            id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                            name: "default_group",
                            url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                            extension: "png",
                        },
                    },
                    defaultExpenseItem: {
                        id: 1,
                        asset: {
                            id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                            name: "default_expense_item",
                            url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                            extension: "png",
                        },
                    },
                    placeholderImage: {
                        id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                        name: "placeholder",
                        url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                        extension: "png",
                    },
                    defaultGroupIconImage: {
                        id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                        name: "default_group_icon",
                        url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                        extension: "png",
                    },
                    defaultGroupCategoryIconImage: {
                        id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                        name: "default_group_icon",
                        url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                        extension: "png",
                    },
                    defaultGroupBackgroundImage: {
                        id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                        name: "default_group_background",
                        url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                        extension: "png",
                    },
                    defaultRelationshipImage: {
                        id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                        name: "default_group_background",
                        url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                        extension: "png",
                    },
                    defaultUserAvatarImage: {
                        id: "8060ec87-356e-4367-9d4c-5777d3df6ef5",
                        name: "default_group_background",
                        url: "https://res.cloudinary.com/dstdxd60k/image/upload/s--wRnZNEV8--/v1/splitsmarter/assets/a9981ab3-223b-423d-af76-6ec1a00949ee",
                        extension: "png",
                    },
                },
                isInitialized: true,
            });

            console.log("✅ System defaults loaded with placeholders");
        } catch (error) {
            console.error("❌ Failed to fetch authenticated system defaults", error);
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