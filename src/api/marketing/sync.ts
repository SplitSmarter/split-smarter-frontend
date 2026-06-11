// Inside fetchPublicInfo or a dedicated marketing sync function
import {marketingStore} from "@/src/store/marketingStore";
import axios from "axios";

const syncMarketing = async () => {
    const res = await axios.get('/api/v1/marketing/active-offer');
    const remoteOffer = res.data;

    const { lastSeenId } = marketingStore.getState();

    if (remoteOffer.id !== lastSeenId) {
        // It's a brand-new offer! Reset the "seen" flag
        marketingStore.setState({
            offerData: remoteOffer,
            hasSeenOffer: false
        });
    }
};