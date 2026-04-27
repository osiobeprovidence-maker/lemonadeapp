import React from 'react';
import { Bell, Heart, MessageCircle, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

export default function Notifications() {
  const { user, markNotificationsAsRead } = useApp();
  const notifications = user?.notifications || [];

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-3xl mx-auto pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-4xl">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markNotificationsAsRead}
            className="text-sm font-medium text-white/50 hover:text-white"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-white/30">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div 
                key={notif.id} 
                className={cn(
                  "flex items-start gap-4 p-5 rounded-2xl border transition-colors",
                  isUnread ? "bg-white/5 border-white/10" : "bg-transparent border-transparent hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
                  notif.type === 'release' ? "bg-blue-500/10 text-blue-400" :
                  notif.type === 'reply' ? "bg-green-500/10 text-green-400" :
                  notif.type === 'badge' ? "bg-orange-500/10 text-orange-400" :
                  "bg-lemon-muted/10 text-lemon-muted"
                )}>
                  {notif.type === 'release' ? <Star size={18} /> : 
                   notif.type === 'reply' ? <MessageCircle size={18} /> : 
                   notif.type === 'badge' ? <Heart size={18} /> :
                   <Bell size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={cn("font-bold text-base", isUnread ? "text-white" : "text-white/80")}>{notif.title}</h4>
                    <span className="text-xs font-medium text-white/40">{notif.time}</span>
                  </div>
                  <p className={cn("text-sm leading-relaxed", isUnread ? "text-white/70" : "text-white/50")}>{notif.description}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
