import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor?: string;
  ctaText?: string;
  actionUrl?: string;
}

interface MarketingState {
  offers: Offer[];
  dismissedOfferIds: string[]; // Store IDs of offers user swiped away or closed

  // Actions
  setOffers: (offers: Offer[]) => void;
  dismissOffer: (id: string) => void;
  resetDismissed: () => void; // For testing
}

export const useMarketingStore = create<MarketingState>()(
    persist(
        (set) => ({
          offers: [],
          dismissedOfferIds: [],

          setOffers: (newOffers) => set({ offers: newOffers }),

          dismissOffer: (id) => set((state) => ({
            dismissedOfferIds: [...state.dismissedOfferIds, id]
          })),

          resetDismissed: () => set({ dismissedOfferIds: [] }),
        }),
        {
          name: "marketing-storage",
          storage: createJSONStorage(() => AsyncStorage),
        }
    )
);