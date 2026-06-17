import { useNotificationActions } from '@/hooks';
import { createSignalRService, getSignalRService } from '@/services';
import { BasicNotification, NotificationHandler } from '@/types';
import { API_URL } from '@/utils/baseAPI';
import { setRandom } from '@/redux/global/Actions';
import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';


interface NotificationContextType {
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
    hubUrl?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    hubUrl = `${API_URL}/notifications`
}) => {
    const dispatch: AppDispatch = useDispatch();
    const { showToastNotification } = useNotificationActions();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const handlerRef = useRef<NotificationHandler | null>(null);
    const signalRServiceRef = useRef<any>(null);
    useEffect(() => {

        const signalRService = createSignalRService(hubUrl);
        signalRServiceRef.current = signalRService;

        // Create notification handler
        const handler: NotificationHandler = {
            onNotificationReceived: (notification: BasicNotification) => {
                console.log('🔔 NotificationProvider: Received notification', notification);

                // Use react-toastify for real-time notifications
                showToastNotification(notification);
                console.log('📧 React-toastify notification displayed');

                // Trigger refresh of notification list
                dispatch(setRandom());
                console.log('🔄 Redux setRandom dispatched');
            },
            onConnectionStatusChanged: (connected: boolean) => {
                setIsConnected(connected);
            }
        };

        handlerRef.current = handler;
        signalRService.addHandler(handler);

        // Auto-connect
        signalRService.start()
            .then(() => {
                setIsConnected(signalRService.isConnected);
            })
            .catch(error => {
                console.error('Failed to start SignalR connection:', error);
                setIsConnected(false);
            });

        // Cleanup on unmount
        return () => {
            if (handlerRef.current) {
                signalRService.removeHandler(handlerRef.current);
            }
            signalRService.stop();
            setIsConnected(false);
        };
    }, [hubUrl, showToastNotification, dispatch]);

    const connect = () => {
        const signalRService = signalRServiceRef.current || getSignalRService();
        if (signalRService) {
            console.log('Attempting to connect SignalR...');
            signalRService.start()
                .then(() => {
                    console.log('SignalR connection successful');
                    setIsConnected(signalRService.isConnected);
                })
                .catch(error => {
                    console.error('Failed to connect SignalR:', error);
                    setIsConnected(false);
                });
        } else {
            console.error('SignalR service not found');
        }
    };

    const disconnect = () => {
        const signalRService = signalRServiceRef.current || getSignalRService();
        if (signalRService) {
            console.log('Disconnecting SignalR...');
            signalRService.stop()
                .then(() => {
                    console.log('SignalR disconnected');
                    setIsConnected(false);
                })
                .catch(error => {
                    console.error('Failed to disconnect SignalR:', error);
                });
        }
    };

    const contextValue: NotificationContextType = {
        isConnected,
        connect,
        disconnect,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
