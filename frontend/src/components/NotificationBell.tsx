import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/index';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../store/apiSlice';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const { data: notifications, isLoading } = useGetNotificationsQuery({}, { skip: !isAuth });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsList = Array.isArray(notifications) ? notifications : (notifications?.items || []);
  const unreadCount = notificationsList.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-primary transition-colors border-none bg-transparent outline-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllRead()}
                  className="text-[10px] font-black text-secondary uppercase hover:underline border-none bg-transparent cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-10 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : notificationsList.length === 0 ? (
                <div className="p-10 text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-slate-200">notifications_off</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notifications yet</p>
                </div>
              ) : (
                notificationsList.map((n: any) => (
                  <div 
                    key={n.notificationId} 
                    onClick={() => !n.isRead && markRead(n.notificationId)}
                    className={`p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${n.isRead ? 'opacity-60' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      n.type === 'success' ? 'bg-secondary/10 text-secondary' : 
                      n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'
                    }`}>
                      <span className="material-symbols-outlined text-xl">
                        {n.type === 'success' ? 'check_circle' : n.type === 'warning' ? 'warning' : 'info'}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-primary leading-tight uppercase tracking-tight">{n.title}</p>
                        <p className="text-[8px] font-black text-slate-400 whitespace-nowrap uppercase">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{n.message}</p>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-secondary mt-2 shadow-[0_0_8px_rgba(27,109,36,0.6)]"></div>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50/50 text-center">
              <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 border-none bg-transparent cursor-pointer">
                View All Activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
