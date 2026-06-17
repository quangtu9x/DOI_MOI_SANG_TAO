import { useState, useEffect, useCallback } from 'react';
import { requestPOST } from '@/utils/baseAPI';
import { toast } from 'react-toastify';
import { IAppConfig, IPaginationResponse } from '@/models';

// Global cache và loading state cho app configs
const globalConfigCache = new Map<string, IAppConfig | null>();
const globalLoadingState = new Map<string, boolean>();
const subscribers = new Map<string, Set<(config: IAppConfig | null) => void>>();


// Type helper để tạo return type từ configs - Support readonly arrays
type ConfigReturnType<T extends readonly { key: string; alias?: string }[]> = {
  [K in T[number] as K['alias'] extends string ? K['alias'] : K['key']]: IAppConfig | null;
} & {
  loading: boolean;
  getConfig: (aliasOrKey: string) => IAppConfig | null;
  refetch: () => void;
  clearAllCache: () => void;
};

// Helper function để fetch multiple configs trong 1 API call - Updated version
const fetchMultipleConfigsData = async (keys: string[], enableToast = true) => {
  // Lọc ra các keys chưa có trong cache và chưa đang loading
  const keysToFetch = keys.filter(key => 
    !globalConfigCache.has(key) && !globalLoadingState.get(key)
  );

  if (keysToFetch.length === 0) {
    return; // Không có gì cần fetch
  }

  // Set loading state cho tất cả keys đang fetch
  keysToFetch.forEach(key => globalLoadingState.set(key, true));

  try {
    const response = await requestPOST<IPaginationResponse<IAppConfig[]>>(
      'appconfigs/search',
      {
        keys: keysToFetch, // ← Truyền array thay vì single keyword
        pageNumber: 1,
        pageSize: keysToFetch.length,
      }
    );

    const configs = response.data?.data || [];
    
    // Map configs theo key và cache chúng
    keysToFetch.forEach(key => {
      const config = configs.find(c => c.key === key) || null;
      globalConfigCache.set(key, config);

      // Notify subscribers của key này
      const keySubscribers = subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.forEach(callback => callback(config));
      }
    });

  } catch (error: any) {
    console.error('Error fetching app configs:', error);
    
    if (enableToast) {
      toast.error(`Không thể tải cấu hình. Vui lòng thử lại!`);
    }
    
    // Set tất cả keys về null khi có lỗi
    keysToFetch.forEach(key => {
      globalConfigCache.set(key, null);
      
      const keySubscribers = subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.forEach(callback => callback(null));
      }
    });
  } finally {
    // Clear loading state cho tất cả keys
    keysToFetch.forEach(key => globalLoadingState.set(key, false));
  }
};


// Hook để lấy multiple configs cùng lúc với alias support
export const useAppConfigs = <T extends readonly { key: string; alias?: string }[]>(
  { configs, enableToast = true }: { configs: T; enableToast?: boolean }
): ConfigReturnType<T> => {
  const [configData, setConfigData] = useState<Record<string, IAppConfig | null>>(() => {
    // Khởi tạo từ cache nếu có
    const initialData: Record<string, IAppConfig | null> = {};
    configs.forEach(({ key, alias }) => {
      const configKey = alias || key;
      initialData[configKey] = globalConfigCache.get(key) || null;
    });
    return initialData;
  });
  
  const [loading, setLoading] = useState<boolean>(false);

  // Subscribe để nhận updates cho tất cả configs
  useEffect(() => {
    if (!configs.length) return;

    const updateCallbacks = new Map<string, (config: IAppConfig | null) => void>();
    const keysToFetch: string[] = [];

    configs.forEach(({ key, alias }) => {
      const configKey = alias || key;
      
      // Tạo callback function cho key này
      const updateCallback = (config: IAppConfig | null) => {
        setConfigData(prev => ({ ...prev, [configKey]: config }));
      };
      
      updateCallbacks.set(key, updateCallback);

      // Add subscriber
      if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
      }
      subscribers.get(key)!.add(updateCallback);

      // Check nếu cần fetch
      if (!globalConfigCache.has(key)) {
        keysToFetch.push(key);
      }
    });

    // Fetch tất cả configs cần thiết trong 1 batch API call
    if (keysToFetch.length > 0) {
      setLoading(true);
      fetchMultipleConfigsData(keysToFetch, enableToast).finally(() => {
        setLoading(false);
      });
    }

    // Cleanup function
    return () => {
      configs.forEach(({ key }) => {
        const callback = updateCallbacks.get(key);
        if (callback) {
          const keySubscribers = subscribers.get(key);
          if (keySubscribers) {
            keySubscribers.delete(callback);
            
            if (keySubscribers.size === 0) {
              subscribers.delete(key);
            }
          }
        }
      });
    };
  }, [configs, enableToast]);

  // Function để refetch tất cả configs
  const refetch = useCallback(() => {
    const keys = configs.map(c => c.key);
    keys.forEach(key => globalConfigCache.delete(key));
    setLoading(true);
    fetchMultipleConfigsData(keys, enableToast).finally(() => {
      setLoading(false);
    });
  }, [configs, enableToast]);

  // Function để clear toàn bộ cache
  const clearAllCache = useCallback(() => {
    globalConfigCache.clear();
  }, []);

  // Helper functions để get config dễ dàng hơn
  const getConfig = useCallback((aliasOrKey: string) => configData[aliasOrKey], [configData]);

  return {
    ...configData, // Spread tất cả configs với alias names
    loading,
    getConfig,
    refetch,
    clearAllCache
  } as ConfigReturnType<T>;
};

// Helper function để preload configs sử dụng batch API
export const preloadAppConfigs = async (keys: string[]) => {
  if (keys.length === 0) return;
  try {
    await fetchMultipleConfigsData(keys, false);
  } catch (error) {
    console.error('❌ Failed to preload app configs:', error);
  }
};

// Helper function để get config synchronously từ cache
export const getAppConfigFromCache = (key: string): IAppConfig | null => {
  return globalConfigCache.get(key) || null;
};
