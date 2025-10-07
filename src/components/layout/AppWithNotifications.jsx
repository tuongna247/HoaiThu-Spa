import React from 'react';
import NotificationProvider from '../notifications/NotificationProvider';
import TestErrorBoundary from '../test/TestErrorBoundary';

const AppWithNotifications = ({ children }) => {
  return (
    <TestErrorBoundary>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </TestErrorBoundary>
  );
};

export default AppWithNotifications;