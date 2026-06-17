import { IAppConfig } from '@/models';
import { APP_CONFIG_KEYS } from './appConfigPreloader';

// Helper function để tạo typed configs với better intellisense
export const createAppConfigs = <T extends readonly { key: string; alias?: string }[]>(
  configs: T
): T => configs;

// Alternative helper cho cases cần mutable array
export const createMutableAppConfigs = <T extends readonly { key: string; alias?: string }[]>(
  configs: T
) => [...configs] as { key: string; alias?: string }[];

// Predefined common configs với type safety
export const CommonConfigs = {
  ALL_ESSENTIAL: createAppConfigs([
    { key: APP_CONFIG_KEYS.PROVINCE_CODE, alias: 'provinceCode' },
    { key: APP_CONFIG_KEYS.DEFAULT_LOCATION, alias: 'defaultLocation' },
  ] as const)
} as const;

// Type helper để extract config names từ predefined configs
export type ConfigNames<T extends readonly { key: string; alias?: string }[]> = {
  [K in T[number] as K['alias'] extends string ? K['alias'] : K['key']]: IAppConfig | null;
};


export type AllEssentialConfigs = ConfigNames<typeof CommonConfigs.ALL_ESSENTIAL> & {
  loading: boolean;
  getConfig: (aliasOrKey: string) => IAppConfig | null;
  refetch: () => void;
  clearAllCache: () => void;
};
