import {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';

/**
 * Lets the tab transition paint first, then mounts Google MapView.
 * Once true, stays true so returning to the tab stays warm.
 */
export function useDeferredMapMount() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => setMounted(true));
        });
        return () => task.cancel();
    }, []);

    return mounted;
}
