import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {BackHandler} from 'react-native';
import {useNavigation} from '@react-navigation/native';

type OverlayEntry = {
    id: number;
    dismiss: () => void;
};

type BackDismissStackContextValue = {
    register: (dismiss: () => void) => () => void;
    /** Dismiss the top overlay if any; otherwise run `onEmptyBack`. */
    requestBack: () => void;
    /** @returns true if an overlay was dismissed (caller should prevent navigation). */
    tryDismiss: () => boolean;
};

const BackDismissStackContext = createContext<BackDismissStackContextValue | null>(null);

type ProviderProps = {
    children: React.ReactNode;
    /** Called when back is pressed and no overlay is open (e.g. `router.back`). */
    onEmptyBack: () => void;
    /** When true, back is consumed and nothing happens (e.g. while submitting). */
    blockBack?: boolean;
    /**
     * When true (default), Android hardware back and React Navigation
     * `beforeRemove` (gesture / system back) go through the stack.
     */
    interceptSystemBack?: boolean;
};

export function BackDismissStackProvider({
    children,
    onEmptyBack,
    blockBack = false,
    interceptSystemBack = true,
}: ProviderProps) {
    const nextIdRef = useRef(0);
    const stackRef = useRef<OverlayEntry[]>([]);
    const onEmptyBackRef = useRef(onEmptyBack);
    const blockBackRef = useRef(blockBack);
    onEmptyBackRef.current = onEmptyBack;
    blockBackRef.current = blockBack;

    const register = useCallback((dismiss: () => void) => {
        const id = ++nextIdRef.current;
        stackRef.current.push({id, dismiss});
        return () => {
            stackRef.current = stackRef.current.filter((entry) => entry.id !== id);
        };
    }, []);

    const tryDismiss = useCallback(() => {
        if (blockBackRef.current) return true;
        const stack = stackRef.current;
        if (stack.length === 0) return false;
        stack[stack.length - 1].dismiss();
        return true;
    }, []);

    const requestBack = useCallback(() => {
        if (blockBackRef.current) return;
        if (tryDismiss()) return;
        onEmptyBackRef.current();
    }, [tryDismiss]);

    const navigation = useNavigation();

    useEffect(() => {
        if (!interceptSystemBack) return;

        const onHardwareBack = () => {
            if (blockBackRef.current) return true;
            if (stackRef.current.length > 0) {
                stackRef.current[stackRef.current.length - 1].dismiss();
                return true;
            }
            return false;
        };

        const backSub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
        const removeBefore = navigation.addListener('beforeRemove', (e) => {
            if (blockBackRef.current) {
                e.preventDefault();
                return;
            }
            if (stackRef.current.length > 0) {
                e.preventDefault();
                stackRef.current[stackRef.current.length - 1].dismiss();
            }
        });

        return () => {
            backSub.remove();
            removeBefore();
        };
    }, [interceptSystemBack, navigation]);

    const value = useMemo(
        () => ({register, requestBack, tryDismiss}),
        [register, requestBack, tryDismiss],
    );

    return (
        <BackDismissStackContext.Provider value={value}>
            {children}
        </BackDismissStackContext.Provider>
    );
}

/**
 * While `visible` is true, registers `dismiss` as the top back target.
 * No-ops when rendered outside a `BackDismissStackProvider`.
 */
export function useRegisterOverlayDismiss(visible: boolean, dismiss: () => void) {
    const ctx = useContext(BackDismissStackContext);
    const dismissRef = useRef(dismiss);
    dismissRef.current = dismiss;

    useEffect(() => {
        if (!ctx || !visible) return;
        return ctx.register(() => dismissRef.current());
    }, [ctx, visible]);
}

export function useBackDismissStack() {
    return useContext(BackDismissStackContext);
}
