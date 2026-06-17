import { useState, useEffect, useCallback } from 'react';
import { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { requestGET } from '@/utils/baseAPI';

import { processStepContent } from './useJoyride.helper';
import { GetUserGuideParams, IUserGuide, JoyrideDefinition, UserGuideState } from '@/models';

const STORAGE_KEY = 'td_user_guide_state';


export const useJoyride = (
  guideKey: string,
  options?: {
    locale?: string;
    type?: string;
    autoStart?: boolean;
    skipIfCompleted?: boolean;
  }
) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<IUserGuide | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const {
    locale = 'vi',
    type = 'onboarding',
    autoStart = false,
    skipIfCompleted = true,
  } = options || {};

  /**
   * Lấy state của user guide từ localStorage
   */
  const getGuideState = useCallback((): UserGuideState => {
    try {
      const state = localStorage.getItem(STORAGE_KEY);
      return state ? JSON.parse(state) : {};
    } catch {
      return {};
    }
  }, []);

  /**
   * Lưu state của user guide vào localStorage
   */
  const saveGuideState = useCallback((key: string, completed: boolean, version: number) => {
    try {
      const state = getGuideState();
      state[key] = {
        completed,
        version,
        lastViewedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving guide state:', error);
    }
  }, [getGuideState]);

  /**
   * Kiểm tra xem user guide đã được hoàn thành chưa
   */
  const isGuideCompleted = useCallback((): boolean => {
    const state = getGuideState();
    const guideState = state[guideKey];
    
    if (!guideState || !guideData) return false;
    
    // Nếu version mới hơn, coi như chưa hoàn thành
    return guideState.completed && guideState.version >= guideData.version;
  }, [guideKey, guideData, getGuideState]);

  /**
   * Fetch user guide từ backend
   */
  const fetchUserGuide = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GetUserGuideParams = {
        key: guideKey,
        locale,
        type,
      };

      const queryString = new URLSearchParams({
        locale: params.locale || '',
        type: params.type || '',
      }).toString();

      const response = await requestGET<IUserGuide>(
        `UserGuides/published/${params.key}?${queryString}`
      );

      if (response.status === 200 && response.data) {
        setGuideData(response.data);
        
        // Parse definition nếu cần
        const definition: JoyrideDefinition = 
          typeof response.data.definitionJson === 'string'
            ? JSON.parse(response.data.definitionJson)
            : response.data.definitionJson;

        // Process steps để convert HTML content thành React Element
        const processedSteps = (definition.steps || []).map(processStepContent);
        setSteps(processedSteps);
        
        return response.data;
      } else {
        throw new Error('Failed to fetch user guide');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải hướng dẫn';
      setError(errorMessage);
      console.error('Error fetching user guide:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [guideKey, locale, type]);

  /**
   * Bắt đầu tour
   */
  const startTour = useCallback(() => {
    if (steps.length > 0) {
      setStepIndex(0);
      setRun(true);
    }
  }, [steps]);

  /**
   * Dừng tour
   */
  const stopTour = useCallback(() => {
    setRun(false);
  }, []);

  /**
   * Reset tour (xóa state đã hoàn thành)
   */
  const resetTour = useCallback(() => {
    if (guideData) {
      saveGuideState(guideKey, false, guideData.version);
      setStepIndex(0);
      setRun(false);
    }
  }, [guideKey, guideData, saveGuideState]);

  /**
   * Callback handler cho Joyride
   */
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
    } else if (finishedStatuses.includes(status)) {
      // Tour kết thúc hoặc bị skip
      setRun(false);
      
      if (status === STATUS.FINISHED && guideData) {
        // Đánh dấu là đã hoàn thành
        saveGuideState(guideKey, true, guideData.version);
      }
    }
  }, [guideKey, guideData, saveGuideState]);

  /**
   * Load user guide khi component mount hoặc key thay đổi
   */
  useEffect(() => {
    const loadGuide = async () => {
      const guide = await fetchUserGuide();
      
      if (guide && autoStart && !skipIfCompleted) {
        // Auto start nếu được config
        startTour();
      } else if (guide && autoStart && skipIfCompleted) {
        // Chỉ auto start nếu chưa hoàn thành
        const state = getGuideState();
        const guideState = state[guideKey];
        
        if (!guideState || !guideState.completed || guideState.version < guide.version) {
          startTour();
        }
      }
    };

    if (guideKey) {
      loadGuide();
    }
  }, [guideKey]); // Chỉ chạy khi guideKey thay đổi

  return {
    // State
    steps,
    run,
    isLoading,
    error,
    guideData,
    stepIndex,
    
    // Computed
    isCompleted: isGuideCompleted(),
    
    // Methods
    startTour,
    stopTour,
    resetTour,
    refetch: fetchUserGuide,
    handleJoyrideCallback,
    
    // Utils
    getGuideState,
  };
};

export default useJoyride;
