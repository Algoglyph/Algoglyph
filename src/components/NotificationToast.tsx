import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const notification = useWorkspaceStore((state) => state.notification);
  const hideNotification = useWorkspaceStore((state) => state.hideNotification);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />;
      default:
        return <Info size={16} className="text-purple-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-emerald-500/40 bg-zinc-950 text-zinc-100';
      case 'error':
        return 'border-rose-500/40 bg-zinc-950 text-zinc-100';
      default:
        return 'border-zinc-800 bg-zinc-950 text-zinc-100';
    }
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl shadow-black/80 transition-all duration-300 ${getBorderColor()}`}
      style={{ minWidth: '320px', maxWidth: '90vw' }}
    >
      {getIcon()}
      <span className="font-mono text-xs text-zinc-100 select-none flex-1 leading-normal">
        {notification.message}
      </span>
      <button
        onClick={hideNotification}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer flex-shrink-0 ml-1"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};
