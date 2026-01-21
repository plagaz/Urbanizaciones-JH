import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (message: string, severity: AlertColor = 'info', duration = 5000) => {
      const id = Date.now().toString();
      const notification: Notification = { id, message, severity, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    []
  );

  const showError = useCallback(
    (message: string) => { showNotification(message, 'error', 5000); },
    [showNotification]
  );

  const showSuccess = useCallback(
    (message: string) => { showNotification(message, 'success', 4000); },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string) => { showNotification(message, 'info', 4000); },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string) => { showNotification(message, 'warning', 5000); },
    [showNotification]
  );

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showError, showSuccess, showInfo, showWarning }}>
      {children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => { handleClose(notification.id); }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: 2, mr: 2 }}
        >
          <Alert
            onClose={() => { handleClose(notification.id); }}
            severity={notification.severity}
            sx={{ width: '100%', minWidth: 300 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe estar dentro de NotificationProvider');
  }
  return context;
}
