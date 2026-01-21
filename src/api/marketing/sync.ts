// Inside fetchPublicInfo or a dedicated marketing sync function
import {useMarketingStore} from "@/src/store/useMarketingStore";
import axios from "axios";

const syncMarketing = async () => {
    const res = await axios.get('/api/v1/marketing/active-offer');
    const remoteOffer = res.data;

    const { lastSeenId } = useMarketingStore.getState();

    if (remoteOffer.id !== lastSeenId) {
        // It's a brand-new offer! Reset the "seen" flag
        useMarketingStore.setState({
            offerData: remoteOffer,
            hasSeenOffer: false
        });
    }
};