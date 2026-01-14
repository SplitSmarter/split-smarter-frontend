import axios from "axios";
import {BACKEND_HOSTNAME} from "@/src/config/config"

const axiosAuthInstance = axios.create({
    baseURL: BACKEND_HOSTNAME + "/api/auth",
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

axiosAuthInstance.interceptors.request.use(
    async (config) => {
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.info("🔗 URL:", fullUrl);
        if (config.data) console.info("📝 Payload:", config.data);
        return config;
    },
    (error) => Promise.reject(error)
);

axiosAuthInstance.interceptors.response.use(
    async (response) => {
        console.info(`Response ${response.status}: ${response.statusText}`);
        if (response.data) console.info("Payload:", response.data);
        return response;
    },
    (error) => {
        console.info("Error:", error);
        if (error.response) {
            console.info(`Response ${error.response.status}: ${error.response.statusText}`);
            if (error.response.data) console.info("Payload:", error.response.data);
        } else {
            // No response (network issue, timeout, etc.)
            console.info("Network Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosAuthInstance;