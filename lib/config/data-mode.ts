/**
 * InnovatMind School OS — Central Data Mode & Authentication Provider Configuration
 * Manages the boundary between Demo Sandbox, Real Production Database, and Identity Providers.
 * Strictly prevents demo fixtures from leaking into Cognito or Production database queries.
 */

import { AuthProviderType } from '../types';

export type DataMode = 'DEMO' | 'PRODUCTION';

export interface DataModeConfig {
  mode: DataMode;
  authProvider: AuthProviderType;
  isDemo: boolean;
  isProduction: boolean;
  isCognito: boolean;
  isSupabase: boolean;
  storageNamespace: string;
  allowDemoReset: boolean;
  allowDemoFixtures: boolean;
}

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
  isConfigured: boolean;
  errorMessage?: string;
}

// Default application modes
const DEFAULT_DATA_MODE: DataMode = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DATA_MODE === 'DEMO')
    ? 'DEMO'
    : 'PRODUCTION';

const DEFAULT_AUTH_PROVIDER: AuthProviderType = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'COGNITO')
    ? 'COGNITO'
    : (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'DEMO')
      ? 'DEMO'
      : 'SUPABASE';

const STORAGE_KEY_DATA_MODE = 'school_os_active_data_mode';
const STORAGE_KEY_AUTH_PROVIDER = 'school_os_active_auth_provider';

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
 * Returns active Auth Provider from client storage or environment default
 */
export function getActiveAuthProvider(): AuthProviderType {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_PROVIDER);
      if (stored === 'SUPABASE' || stored === 'COGNITO' || stored === 'DEMO') {
        return stored as AuthProviderType;
      }
    } catch {}
  }
  return DEFAULT_AUTH_PROVIDER;
}

/**
 * Centrally updates DataMode and broadcasts change
 */
export function setActiveDataMode(mode: DataMode): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_DATA_MODE, mode);
      window.dispatchEvent(new CustomEvent('school_os_data_mode_changed', { detail: { mode } }));
    } catch {}
  }
}

/**
 * Centrally updates AuthProvider and broadcasts change
 */
export function setActiveAuthProvider(provider: AuthProviderType): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_PROVIDER, provider);
      window.dispatchEvent(new CustomEvent('school_os_auth_provider_changed', { detail: { provider } }));
    } catch {}
  }
}

/**
 * Validates Cognito identity provider configuration
 */
export function getCognitoConfig(): CognitoConfig {
  const userPoolId = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) || '';
  const clientId = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) || '';
  const region = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_COGNITO_REGION) || 'ap-south-1';

  const isConfigured = Boolean(userPoolId && clientId);

  return {
    userPoolId,
    clientId,
    region,
    isConfigured,
    errorMessage: isConfigured 
      ? undefined 
      : 'Cognito Authentication is enabled, but AWS User Pool ID (NEXT_PUBLIC_COGNITO_USER_POOL_ID) or App Client ID (NEXT_PUBLIC_COGNITO_CLIENT_ID) is not configured in the environment.'
  };
}

/**
 * Strictly controls whether demo seed fixtures (initialSchools, initialStudents, etc.) may be loaded.
 * CRITICAL: When Cognito or Production is active, NEVER allow demo fixtures to pollute queries!
 */
export function shouldLoadDemoFixtures(
  mode: DataMode = getActiveDataMode(),
  authProvider: AuthProviderType = getActiveAuthProvider()
): boolean {
  if (authProvider === 'COGNITO') return false;
  if (mode === 'PRODUCTION') return false;
  if (authProvider === 'SUPABASE') return false;
  return mode === 'DEMO' && authProvider === 'DEMO';
}

/**
 * Helper configuration object for current mode
 */
export function getDataModeConfig(
  mode: DataMode = getActiveDataMode(),
  authProvider: AuthProviderType = getActiveAuthProvider()
): DataModeConfig {
  const isDemo = mode === 'DEMO' && authProvider === 'DEMO';
  const isCognito = authProvider === 'COGNITO';
  const isSupabase = authProvider === 'SUPABASE';

  return {
    mode,
    authProvider,
    isDemo,
    isProduction: !isDemo,
    isCognito,
    isSupabase,
    // Demo data uses dedicated isolated storage namespace to strictly prevent production cross-contamination
    storageNamespace: isDemo ? 'school_os_demo_' : 'school_os_prod_',
    allowDemoReset: isDemo,
    allowDemoFixtures: isDemo
  };
}

/**
 * Storage key resolver ensuring complete physical separation of demo and prod data
 */
export function resolveStorageKey(baseKey: string, mode: DataMode = getActiveDataMode()): string {
  const config = getDataModeConfig(mode);
  return `${config.storageNamespace}${baseKey}`;
}
