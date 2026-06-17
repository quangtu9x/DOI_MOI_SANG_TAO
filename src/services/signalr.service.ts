import { getAuth } from '@/app/modules/auth';
import { BasicNotification, NotificationHandler, LabelType } from '@/types';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export class SignalRService {
  private connection: HubConnection | null = null;
  private handlers: NotificationHandler[] = [];
  private reconnectInterval: number = 5000; // 5 seconds
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private hubUrl: string;

  constructor(hubUrl: string) {
    this.hubUrl = hubUrl;
  }

  // Start connection
  async start(): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      return;
    }

    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => {
            const auth = getAuth();
            return auth?.token || '';
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
            return delay;
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      this.setupEventHandlers();
      await this.connection.start();
      this.reconnectAttempts = 0;
      
      this.notifyConnectionStatus(true);

    } catch (error) {
      this.notifyConnectionStatus(false);
      this.scheduleReconnect();
    }
  }

  // Stop connection
  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.notifyConnectionStatus(false);
    }
  }

  get isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  addHandler(handler: NotificationHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: NotificationHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('NotificationFromServer', (messageType: string, notification: any) => {
      this.processNotification('NotificationFromServer', notification);
    });

    // Handle connection events
    this.connection.onclose((error) => {
      this.notifyConnectionStatus(false);
      this.scheduleReconnect();
    });

    this.connection.onreconnecting((error) => {
      this.notifyConnectionStatus(false);
    });

    this.connection.onreconnected((connectionId) => {
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus(true);
    });

  }

  private processNotification(eventName: string, notification: any): void {
    
    // Convert server notification to BasicNotification format
    // Server sends: { Message: string, Label: number }
    const basicNotification: BasicNotification = {
      message: notification?.Message || notification?.message || 'New notification received',
      label: notification?.Label || notification?.label
    };


    // Notify all handlers
    this.handlers.forEach(handler => {
      try {
        handler.onNotificationReceived(basicNotification);
      } catch (error) {
      }
    });
  }

//   // Map server Label enum to client label strings
//   private mapServerLabelToClient(serverLabel: number | string): BasicNotification['label'] {
//     // Server uses enum: Information = 0, Success = 1, Warning = 2, Error = 3
//     if (typeof serverLabel === 'number') {
//       switch (serverLabel) {
//         case 1: return 'Success';
//         case 2: return 'Warning';
//         case 3: return 'Error';
//         case 0:
//         default: return 'Information';
//       }
//     }
    
//     // Fallback to string mapping
//     return this.mapToNotificationLabel(serverLabel?.toString() || 'Information');
//   }

//   // Map backend notification types to our BasicNotification labels
//   private mapToNotificationLabel(label: string): BasicNotification['label'] {
//     const upperLabel = label.toUpperCase();
//     switch (upperLabel) {
//       case 'SUCCESS':
//       case 'SUCCEED':
//         return 'Success';
//       case 'WARNING':
//       case 'WARN':
//         return 'Warning';
//       case 'ERROR':
//       case 'DANGER':
//       case 'FAIL':
//         return 'Error';
//       case 'INFO':
//       case 'INFORMATION':
//       default:
//         return 'Information';
//     }
//   }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);

    setTimeout(async () => {
      try {
        await this.start();
      } catch (error) {
      }
    }, delay);
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.handlers.forEach(handler => {
      handler.onConnectionStatusChanged(connected);
    });
  }

}


let signalRServiceInstance: SignalRService | null = null;

export const createSignalRService = (hubUrl: string): SignalRService => {
  if (!signalRServiceInstance) {
    signalRServiceInstance = new SignalRService(hubUrl);
  }
  return signalRServiceInstance;
};

export const getSignalRService = (): SignalRService | null => {
  return signalRServiceInstance;
};

