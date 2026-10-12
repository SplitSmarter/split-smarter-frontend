0. Theme toggle (first switch)
   Calling NativeWind `colorScheme.set` in the same tick as a Zustand theme remount can throw
   "Couldn't find a navigation context" once in Expo Go. Prefer: update store first, then
   `InteractionManager.runAfterInteractions` + `requestAnimationFrame` before `colorScheme.set`.
   Also avoid NativeWind `shadow-*` / `active:*` on buttons remounting with theme — use StyleSheet.

1. The shadow-sm Class
   In the tab switcher buttons, you used shadow-sm:

TypeScript
activeTab === 'people' ? 'bg-white dark:bg-zinc-900 shadow-sm' : 'bg-transparent'
NativeWind translates shadow utility classes into specific native shadow/elevation properties (shadowColor, shadowOffset, shadowOpacity, elevation, etc.). When @gorhom/bottom-sheet dynamically mounts or animates its internal portal layers, applying a shadow class right on render occasionally confuses NativeWind's context bridge, making it falsely look for a React Navigation container context that it thinks should be wrapping the component.

2. The active:opacity-60 Class
   On the close button, you used:

TypeScript
<Pressable onPress={onClose} className="p-2 rounded-full active:opacity-60">
Pseudo-classes like active: require real-time state tracking from NativeWind's style processor. When used inside a portal-based library like @gorhom/bottom-sheet (which creates its own detached view hierarchy outside the main React tree), the pseudo-state handler loses track of context, triggering the navigation/context error fallback.

3. Do not use comments like this 
                    <View style={{ width: 40 }} /> {/* Spacer to center title */}

4. react-native-iconify `icon` prop must be a string literal in JSX (babel transform).
   Never pass a variable/prop into `<Iconify icon={...} />`.
   For shared UI, accept `ReactNode` / `renderIcon` and render `<Iconify icon="heroicons:..." />` at the call site.


