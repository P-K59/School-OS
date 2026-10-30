/**
 * InnovatMind School OS — Central Data Mode Configuration
 * Manages the boundary between Demo Sandbox and Real Production Database.
 */

export type DataMode = 'DEMO' | 'PRODUCTION';

export interface DataModeConfig {
  mode: DataMode;
  isDemo: boolean;
  isProduction: boolean;
  storageNamespace: string;
  allowDemoReset: boolean;
}

// Production is the default application mode
const DEFAULT_DATA_MODE: DataMode = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DATA_MODE === 'DEMO')
    ? 'DEMO'
    : 'PRODUCTION';

const STORAGE_KEY_DATA_MODE = 'school_os_active_data_mode';

/**
 * Returns current DataMode from client storage or environment default
 */
export function getActiveDataMode(): DataMode {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DATA_MODE);
      if (stored === 'PRODUCTION' || stored === 'DEMO') {
        return stored;
      }
    } catch {
      // Storage access error fallback
    }
  }
  return DEFAULT_DATA_MODE;
}

/**
 * Centrally updates DataMode and broadcasts change
 */
export function setActiveDataMode(mode: DataMode): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_DATA_MODE, mode);
      window.dispatchEvent(new CustomEvent('school_os_data_mode_changed', { detail: { mode } }));
    } catch {
      // Storage access error
    }
  }
}

/**
 * Helper configuration object for current mode
 */
export function getDataModeConfig(mode: DataMode = getActiveDataMode()): DataModeConfig {
  const isDemo = mode === 'DEMO';
  return {
    mode,
    isDemo,
    isProduction: !isDemo,
    // Demo data uses dedicated isolated storage namespace to strictly prevent production cross-contamination
    storageNamespace: isDemo ? 'school_os_demo_' : 'school_os_prod_',
    allowDemoReset: isDemo
  };
}

/**
 * Storage key resolver ensuring complete physical separation of demo and prod data
 */
export function resolveStorageKey(baseKey: string, mode: DataMode = getActiveDataMode()): string {
  const config = getDataModeConfig(mode);
  return `${config.storageNamespace}${baseKey}`;
}
