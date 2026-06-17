import { preloadAppConfigs } from './useAppConfigs';

// Danh sách các configs cần preload khi app khởi động
export const APP_CONFIG_KEYS = {
  PROVINCE_CODE: 'App_Province_Code',
  DEFAULT_LOCATION: 'App_Default_Location',
} as const;

// Function để preload tất cả configs quan trọng
export const preloadEssentialConfigs = async () => {
  const essentialKeys = [
    APP_CONFIG_KEYS.PROVINCE_CODE,
    APP_CONFIG_KEYS.DEFAULT_LOCATION,
  ];

  try {
    await preloadAppConfigs(essentialKeys);
  } catch (error) {
    console.error('❌ Failed to preload essential configs:', error);
  }
};

