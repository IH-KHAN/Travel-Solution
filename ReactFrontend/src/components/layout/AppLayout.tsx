import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useSocketNotifications } from '@/hooks/useSocketNotifications';

const AppLayout: React.FC = () => {
  // Connect Socket.IO notifications at layout level
  useSocketNotifications();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-end px-6 gap-3 shrink-0 shadow-sm">
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'text-sm font-medium',
          duration: 4000,
          style: { borderRadius: '12px', padding: '12px 16px' },
          success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
        }}
      />
    </div>
  );
};

export default AppLayout;
