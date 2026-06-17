export interface BasicNotification {
  title?: string;
  message: string;
  label: LabelType;
}

export enum LabelType {
  Information,
  Success,
  Warning,
  Error
}

export interface DatabaseNotification {
  id: string;
  topic: string;
  title: string;
  description: string;
  content: string;
  isRead: boolean;
  link?: string;
  deepLink?: string;
  code?: string;
  data?: string;
  createdOn: string;
  categoryName?: string;
  categoryId?: string;
}


export interface NotificationHandler {
  onNotificationReceived: (notification: BasicNotification) => void;
  onConnectionStatusChanged: (connected: boolean) => void;
}

export interface NotificationState {
  // Database notifications
  databaseNotifications: DatabaseNotification[];
  unreadCount: number;
  isLoadingNotifications: boolean;

  // Connection status
  isConnected: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}
