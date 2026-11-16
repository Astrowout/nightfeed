import { useSyncExternalStore } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

const noop = () => () => {};

/**
 * The window's width, safe for pages rendered to static HTML at build time.
 *
 * The build has no window, so it renders at width 0 (the phone layout). React then hydrates
 * that HTML in the browser and keeps its styles, so the first render there must use the same
 * width; the real width follows right after. React does exactly that with a server snapshot:
 * it is used while hydrating, then the client snapshot takes over. The phone apps get the width
 * straight away.
 */
export function usePageWidth(): number {
  const { width } = useWindowDimensions();
  const onClient = useSyncExternalStore(
    noop,
    () => true,
    () => Platform.OS !== 'web',
  );
  return onClient ? width : 0;
}
