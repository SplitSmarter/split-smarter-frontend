import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LogEntry {
    timestamp: string;
    level: 'ERROR' | 'WARN' | 'INFO';
    message: string;
    context?: any;
}

interface LogState {
    logs: LogEntry[];
    addLog: (entry: Omit<LogEntry, 'timestamp'>) => void;
    clearLogs: () => void;
    uploadLogs: () => Promise<void>;
}

export const useLogStore = create<LogState>()(
    persist(
        (set, get) => ({
            logs: [],

            addLog: (entry) => {
                const newLog = { ...entry, timestamp: new Date().toISOString() };
                set((state) => ({ logs: [...state.logs, newLog] }));

                // Trigger upload if buffer is large
                if (get().logs.length >= 20) {
                    get().uploadLogs();
                }
            },

            uploadLogs: async () => {
                const { logs } = get();
                if (logs.length === 0) return;

                try {
                    // Replace with your actual analytics endpoint
                    // await axios.post('/analytics/logs', { logs });
                    console.log("Uploading logs to analytics:", logs);
                    get().clearLogs();
                } catch (e) {
                    console.error("Failed to upload logs", e);
                }
            },

            clearLogs: () => set({ logs: [] }),
        }),
        {
            name: 'error-logs-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);