declare global {
    var ErrorUtils: {
        setGlobalHandler(callback: (error: any, isFatal?: boolean) => void): void;
        getGlobalHandler(): (error: any, isFatal?: boolean) => void;
    };
}

export {};