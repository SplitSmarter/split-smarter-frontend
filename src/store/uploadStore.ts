import {create} from 'zustand';
import {UploadImageApi} from "@/src/api/asset/upload";

interface UploadTask {
    id: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    uri: string;
    assetId?: string;
    remoteUrl?: string;
    extension?: string;
    error?: string;
}

interface UploadState {
    queue: Record<string, UploadTask>;
    addToQueue: (uri: string) => Promise<string | null>;
    removeFromQueue: (id: string) => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
    queue: {},

    addToQueue: async (uri: string) => {
        const id = Math.random().toString(36).substring(7);

        const match = /\.(\w+)$/.exec(uri);
        const ext = match ? match[1].toLowerCase() : undefined;

        set((state) => ({
            queue: {
                ...state.queue,
                [id]: {id, status: 'uploading',
                    progress: 0, uri,
                    extension: ext}
            }
        }));

        UploadImageApi(uri, true)
            .then((res) => {
                set((state) => ({
                    queue: {
                        ...state.queue,
                        [id]: {
                            ...state.queue[id],
                            status: 'completed',
                            assetId: res.data.asset_id,
                            remoteUrl: res.data.url
                        }
                    }
                }));
            })
            .catch((error: any) => {
                set((state) => ({
                    queue: {
                        ...state.queue,
                        [id]: {
                            ...state.queue[id],
                            status: 'failed',
                            error: error.message || "Upload failed"
                        }
                    }
                }));
                console.error(`[UploadStore] Task ${id} failed:`, error);
            });

        return id;
    },

    removeFromQueue: (id: string) => {
        set((state) => {
            const newQueue = {...state.queue};
            delete newQueue[id];
            return {queue: newQueue};
        });
    }
}));