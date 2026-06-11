import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface ConfigState {
    ip: string | null;
    country: string | null;
    countryCode: string | null;
    currency: string | null;
    cityName: string | null;
    region: string | null;
    timezone: string | null;
    isProxy: boolean;
    isOnline: boolean;
    appVersion: string;
    isMaintenance: boolean;
    fetchPublicInfo: () => Promise<void>;
}

// this information is fetched dynamically unlike similar data in user store which comes from backend
export const configStore = create<ConfigState>()(
    persist(
        (set) => ({
            ip: null,
            country: null,
            countryCode: null,
            currency: null,
            cityName: null,
            region: null,
            timezone: null,
            isProxy: false,
            isOnline: true,
            isMaintenance: false,
            appVersion: "1.0.0",

            fetchPublicInfo: async () => {
                const endpoints = [
                    { name: 'freeipapi.com', url: 'https://free.freeipapi.com/api/json/' },
                    { name: 'ip-api.com', url: 'http://ip-api.com/json/' },
                    { name: 'ipapi.co', url: 'https://ipapi.co/json/' },
                ];

                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                };

                for (const api of endpoints) {
                    try {
                        const response = await axios.get(api.url, { headers, timeout: 5000 });
                        const data = response.data;

                        // Temporary logs for verification
                        console.log(`--- RAW DATA FROM: ${api.name} ---`);
                        console.log(JSON.stringify(data, null, 2));

                        let normalizedData = {
                            ip: null as string | null,
                            country: null as string | null,
                            countryCode: null as string | null,
                            currency: null as string | null,
                            cityName: null as string | null,
                            region: null as string | null,
                            timezone: null as string | null,
                            isProxy: false,
                        };

                        if (api.name === 'ipapi.co') {
                            normalizedData = {
                                ip: data.ip,
                                country: data.country_name,
                                countryCode: data.country,
                                currency: data.currency,
                                cityName: data.city,
                                region: data.region,
                                timezone: data.timezone,
                                isProxy: false, // ipapi.co free tier doesn't explicitly return proxy
                            };
                        } else if (api.name === 'freeipapi.com') {
                            normalizedData = {
                                ip: data.ipAddress,
                                country: data.countryName,
                                countryCode: data.countryCode,
                                currency: data.currencies?.[0],
                                cityName: data.cityName,
                                region: data.regionName,
                                timezone: data.timeZones?.[0],
                                isProxy: !!data.isProxy,
                            };
                        } else if (api.name === 'ip-api.com') {
                            normalizedData = {
                                ip: data.query,
                                country: data.country,
                                countryCode: data.countryCode,
                                currency: null,
                                cityName: data.city,
                                region: data.regionName,
                                timezone: data.timezone,
                                isProxy: false, // ip-api free tier doesn't show proxy status
                            };
                        }

                        set({ ...normalizedData, isOnline: true });
                        console.log(`User Config Loaded via: ${api.name}`);
                        console.log(`Parsed Data:`, JSON.stringify(normalizedData, null, 2));
                        return;

                    } catch (error: any) {
                        console.warn(`${api.name} failed: Status ${error.response?.status} - ${error.message}`);
                    }
                }

                set({ isOnline: false });
            },
        }),
        {
            name: 'config-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                ip: state.ip,
                country: state.country,
                countryCode: state.countryCode,
                currency: state.currency,
                cityName: state.cityName,
                region: state.region,
                timezone: state.timezone,
                isProxy: state.isProxy,
            }),
        }
    )
);