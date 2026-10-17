import {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {DisplayView} from '../types/spatialMap.types';

/**
 * Instant chip highlight (`uiView`) + deferred committed layer (`committedView`)
 * so taps stay responsive while Heatmap / markers / trail mount off the press frame.
 */
export function useDeferredDisplayView(
    committedView: DisplayView,
    setCommittedView: (view: DisplayView) => void
) {
    const [uiView, setUiView] = useState<DisplayView>(committedView);
    const pendingRef = useRef<DisplayView | null>(null);
    const taskRef = useRef<{cancel: () => void} | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (pendingRef.current != null) return;
        setUiView(committedView);
    }, [committedView]);

    useEffect(
        () => () => {
            taskRef.current?.cancel();
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
            }
        },
        []
    );

    const selectDisplayView = useCallback(
        (view: DisplayView) => {
            if (view === uiView && view === committedView) return;

            setUiView(view);
            pendingRef.current = view;

            taskRef.current?.cancel();
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            taskRef.current = InteractionManager.runAfterInteractions(() => {
                rafRef.current = requestAnimationFrame(() => {
                    rafRef.current = null;
                    const next = pendingRef.current;
                    pendingRef.current = null;
                    taskRef.current = null;
                    if (next != null) {
                        setCommittedView(next);
                    }
                });
            });
        },
        [committedView, setCommittedView, uiView]
    );

    return {
        /** Selected chip / trail chrome — updates immediately. */
        uiDisplayView: uiView,
        /** Layer actually on the map — updates after interactions. */
        committedDisplayView: committedView,
        selectDisplayView,
        isSwitching: uiView !== committedView,
    };
}
