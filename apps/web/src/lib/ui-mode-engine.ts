import { UIMode, useUIModeStore } from '@/store/uiMode';

/**
 * UI Mode Engine - Manages transitions between Map and Forge modes
 * 
 * Handles smooth layout transitions with Framer Motion, preserves scroll
 * position, and manages user context during mode switches.
 */

export interface ModeTransitionConfig {
  duration?: number;
  preserveScroll?: boolean;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
}

const DEFAULT_TRANSITION_DURATION = 350; // ms

/**
 * Transition to a new UI mode with animation
 */
export async function transitionToMode(
  targetMode: UIMode,
  config: ModeTransitionConfig = {}
): Promise<void> {
  const {
    duration = DEFAULT_TRANSITION_DURATION,
    preserveScroll = true,
    onTransitionStart,
    onTransitionComplete,
  } = config;

  const store = useUIModeStore.getState();
  const currentMode = store.mode;

  // No transition needed if already in target mode
  if (currentMode === targetMode) {
    return;
  }

  // Save current scroll position
  if (preserveScroll) {
    const scrollY = window.scrollY;
    store.saveScrollPosition(currentMode, scrollY);
  }

  // Start transition
  store.setTransitioning(true);
  onTransitionStart?.();

  // Update mode
  store.setMode(targetMode);

  // Wait for animation duration
  await new Promise((resolve) => setTimeout(resolve, duration));

  // Restore scroll position for new mode
  if (preserveScroll) {
    const savedPosition = store.getScrollPosition(targetMode);
    window.scrollTo({ top: savedPosition, behavior: 'smooth' });
  }

  // Complete transition
  store.setTransitioning(false);
  onTransitionComplete?.();
}

/**
 * Toggle between Map and Forge modes
 */
export async function toggleMode(
  config?: ModeTransitionConfig
): Promise<void> {
  const store = useUIModeStore.getState();
  const currentMode = store.mode;
  const targetMode = currentMode === 'map' ? 'forge' : 'map';

  await transitionToMode(targetMode, config);
}

/**
 * Get Framer Motion layout transition variants for mode switching
 */
export function getModeTransitionVariants() {
  return {
    map: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1], // easeInOut
      },
    },
    forge: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };
}

/**
 * Get layout configuration for current mode
 */
export function getModeLayout(mode: UIMode) {
  if (mode === 'map') {
    return {
      maxWidth: '1440px',
      columns: 'multi', // Multiple columns/panels
      density: 'high', // High information density
      sidebar: 'visible',
      panels: 'multiple',
    };
  } else {
    return {
      maxWidth: '800px',
      columns: 'single', // Single column focus
      density: 'low', // Minimal distractions
      sidebar: 'collapsed',
      panels: 'single',
    };
  }
}

/**
 * Determine if a component should be visible in current mode
 */
export function isVisibleInMode(
  componentType: 'sidebar' | 'secondary-panel' | 'stats' | 'timeline',
  mode: UIMode
): boolean {
  const visibility: Record<string, Record<UIMode, boolean>> = {
    sidebar: { map: true, forge: false },
    'secondary-panel': { map: true, forge: false },
    stats: { map: true, forge: false },
    timeline: { map: true, forge: true }, // Timeline visible in both but styled differently
  };

  return visibility[componentType]?.[mode] ?? true;
}

/**
 * Get animation delay for staggered component entrance
 */
export function getStaggerDelay(index: number, mode: UIMode): number {
  if (mode === 'forge') {
    // Faster stagger in Forge mode (less content)
    return index * 0.05;
  } else {
    // Slower stagger in Map mode (more content)
    return index * 0.08;
  }
}

/**
 * Save current page context before mode transition
 */
export function savePageContext(pageKey: string, context: any): void {
  const store = useUIModeStore.getState();
  const currentMode = store.mode;
  const contextKey = `${pageKey}-${currentMode}`;

  sessionStorage.setItem(contextKey, JSON.stringify(context));
}

/**
 * Restore page context after mode transition
 */
export function restorePageContext(pageKey: string): any | null {
  const store = useUIModeStore.getState();
  const currentMode = store.mode;
  const contextKey = `${pageKey}-${currentMode}`;

  const saved = sessionStorage.getItem(contextKey);
  return saved ? JSON.parse(saved) : null;
}

/**
 * Clear all saved contexts (useful on logout)
 */
export function clearAllContexts(): void {
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (key.includes('-map') || key.includes('-forge')) {
      sessionStorage.removeItem(key);
    }
  });
}
