import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',   iconColor: 'text-blue-500',   dot: 'bg-blue-500' },
  success: { icon: CheckCircle,   bg: 'bg-emerald-50',border: 'border-emerald-200',iconColor: 'text-emerald-500',dot: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200',  iconColor: 'text-amber-500',  dot: 'bg-amber-500' },
  error:   { icon: XCircle,       bg: 'bg-red-50',    border: 'border-red-200',    iconColor: 'text-red-500',    dot: 'bg-red-500' },
};

const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ notification: n, onRead, onRemove }) => {
  const { icon: Icon, bg, border, iconColor, dot } = typeConfig[n.type];

  return (
    <div
      className={`relative flex gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm
        ${n.read ? 'bg-white border-slate-100' : `${bg} ${border}`}`}
      onClick={() => onRead(n.id)}
    >
      {!n.read && (
        <span className={`absolute top-3 right-8 w-2 h-2 rounded-full ${dot}`} />
      )}
      <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
        </p>
      </div>
      <button
        className="flex-shrink-0 text-slate-300 hover:text-red-400 transition-colors"
        onClick={(e) => { e.stopPropagation(); onRemove(n.id); }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="badge-blue">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                  onRemove={removeNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 text-center">
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <Check size={12} className="inline mr-1" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
