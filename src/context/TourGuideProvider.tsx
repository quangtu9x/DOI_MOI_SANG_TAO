import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from 'react-joyride';
import { IResult, IUserGuide, JoyrideDefinition } from '@/models';
import { requestGET } from '@/utils/baseAPI';
import { processStepContent } from '@/hooks/useJoyride.helper';

interface TourGuideContextType {
    isRunning: boolean;
    currentGuide: IUserGuide | null;
    startTour: (guide: IUserGuide) => Promise<void>;
    stopTour: () => void;
    currentStep: Step | null;
}

const TourGuideContext = createContext<TourGuideContextType | undefined>(undefined);

interface TourGuideProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = 'td_user_guide_state';

interface UserGuideState {
    [key: string]: {
        completed: boolean;
        version: number;
        lastViewedAt: string;
    };
}

export const TourGuideProvider: React.FC<TourGuideProviderProps> = ({ children }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentGuide, setCurrentGuide] = useState<IUserGuide | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [stepIndex, setStepIndex] = useState(0);

    /**
     * Lưu state hoàn thành vào localStorage
     */
    const saveGuideState = useCallback((key: string, completed: boolean, version: number) => {
        try {
            const stateStr = localStorage.getItem(STORAGE_KEY);
            const state: UserGuideState = stateStr ? JSON.parse(stateStr) : {};

            state[key] = {
                completed,
                version,
                lastViewedAt: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving guide state:', error);
        }
    }, []);

    /**
     * Auto-advance step khi user thực hiện action (hover, click)
     * Chỉ áp dụng cho steps có event type và spotlightClicks ở cấp step
     */
    useEffect(() => {
        if (!isRunning || !steps[stepIndex]) return;

        const currentStep = steps[stepIndex];
        const stepConfig = currentStep as any;


        const isInteractiveStep = stepConfig.event &&
            stepConfig.spotlightClicks === true &&
            (currentStep.target as string) !== 'body';

        if (!isInteractiveStep) return;

        const element = document.querySelector(currentStep.target as string);
        if (!element) return;

        const handleUserAction = () => {
            console.log('User performed action at step', stepIndex);
            // Auto advance to next step
            if (stepIndex < steps.length - 1) {
                setTimeout(() => {
                    setStepIndex(prev => prev + 1);
                }, 300); // Small delay for UX
            }
        };

        // Determine event type: 'hover' -> mouseenter, 'click' -> click
        const eventType = stepConfig.event === 'hover' ? 'mouseenter' : 'click';

        // Add event listener (once only)
        element.addEventListener(eventType, handleUserAction, { once: true });

        return () => {
            element.removeEventListener(eventType, handleUserAction);
        };
    }, [stepIndex, isRunning, steps]);

    const startTour = useCallback(async (guide: IUserGuide) => {
        try {
            // Fetch chi tiết guide từ API
            const response = await requestGET<IResult<IUserGuide>>(`userguides/${guide.id}`);
            const guideData = response?.data?.data ?? null;
            if (guideData) {

                // Parse definitionJson để lấy steps (giống useJoyride)
                const definition: JoyrideDefinition =
                    typeof guideData.definitionJson === 'string'
                        ? JSON.parse(guideData.definitionJson)
                        : guideData.definitionJson as JoyrideDefinition;

                // Process steps để convert HTML content thành React Element
                const processedSteps = (definition.steps || []).map((step) => {
                    const processedStep = processStepContent(step);
                    const stepConfig = step as any;

                    // Chỉ ẩn footer cho interactive steps:
                    // 1. Phải có event type (hover/click)
                    // 2. Phải có spotlightClicks = true ở step level
                    // 3. Target không phải "body" (center placement steps)
                    const isInteractiveStep = stepConfig.event &&
                        stepConfig.spotlightClicks === true &&
                        stepConfig.target !== 'body';

                    if (isInteractiveStep) {
                        return {
                            ...processedStep,
                            hideFooter: true,
                            event: stepConfig.event,
                            spotlightClicks: true, // Cho phép click vào element
                            disableOverlayClose: true, // Không cho phép click overlay để tắt
                        };
                    }

                    // Step thông thường: không cho phép click ra ngoài
                    return {
                        ...processedStep,
                        disableOverlayClose: true,
                    };
                });

                if (processedSteps.length > 0) {
                    setCurrentGuide(guideData);
                    setSteps(processedSteps);
                    setStepIndex(0);
                    setIsRunning(true);
                } else {
                    console.warn('No steps found in guide definition');
                }
            }
        } catch (error) {
            console.error('Error loading tour guide:', error);
        }
    }, []);

    const stopTour = useCallback(() => {
        setIsRunning(false);
        setStepIndex(0);
    }, []);

    const handleJoyrideCallback = useCallback((data: CallBackProps) => {
        const { status, type, index, action } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        // Chỉ handle STEP_AFTER nếu KHÔNG phải interactive step (auto-advance)
        const currentStep = steps[index] as any;
        const isInteractiveStep = currentStep?.event &&
            currentStep?.spotlightClicks === true &&
            (currentStep?.target as string) !== 'body';

        if (type === EVENTS.STEP_AFTER && !isInteractiveStep) {
            // Manual next/back button clicks
            setStepIndex(index + 1);
        } else if (type === EVENTS.TARGET_NOT_FOUND) {
            setStepIndex(index + 1);
        } else if (finishedStatuses.includes(status)) {
            // Tour kết thúc
            if (status === STATUS.FINISHED && currentGuide) {
                // Đánh dấu là đã hoàn thành
                saveGuideState(currentGuide.key, true, currentGuide.version);
            }

            // Reset state
            stopTour();

            // Delay một chút trước khi clear guide để tránh flicker
            setTimeout(() => {
                setCurrentGuide(null);
                setSteps([]);
            }, 100);
        }
    }, [currentGuide, saveGuideState, stopTour, steps]);

    return (
        <TourGuideContext.Provider
            value={{
                isRunning,
                currentGuide,
                startTour,
                stopTour,
                currentStep: steps[stepIndex] || null,
            }}
        >
            {children}

            {/* Global Joyride Component */}
            {isRunning && steps.length > 0 && (
                <Joyride
                    steps={steps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous={true}
                    showProgress={false}
                    showSkipButton
                    hideBackButton
                    hideCloseButton
                    scrollToFirstStep
                    disableScrolling={false}
                    disableOverlayClose={true}
                    disableCloseOnEsc={true}
                    spotlightClicks={false}
                    callback={handleJoyrideCallback}
                    locale={{
                        back: 'Quay lại',
                        close: 'Đóng',
                        last: 'Hoàn thành',
                        next: 'Tiếp theo',
                        skip: 'Bỏ qua',
                        open: 'Bắt đầu ngay',
                    }}
                    styles={{
                        options: {
                            primaryColor: '#009ef7',
                            textColor: '#333',
                            backgroundColor: '#fff',
                            overlayColor: 'rgba(0, 0, 0, 0.5)',
                            arrowColor: '#fff',
                            zIndex: 10000,
                        },
                        tooltip: {
                            borderRadius: 8,
                            fontSize: 14,
                        },
                        buttonNext: {
                            backgroundColor: '#009ef7',
                            borderRadius: 4,
                            padding: '8px 16px',
                        },
                        buttonBack: {
                            marginRight: 10,
                        },
                    }}
                />
            )}
        </TourGuideContext.Provider>
    );
};

// Custom hook to use the tour guide context
export const useTourGuide = (): TourGuideContextType => {
    const context = useContext(TourGuideContext);
    if (!context) {
        throw new Error('useTourGuide must be used within TourGuideProvider');
    }
    return context;
};
