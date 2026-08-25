import React, { useState, useEffect } from "react";
import { Notification, User } from "../db/types";
import { 
  Bell, Smartphone, Mail, RefreshCw, MessageSquare, X
} from "lucide-react";

interface NotificationCenterProps {
  currentUser: User | null;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ currentUser, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<"All" | Notification["type"]>("All");

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const headers: Record<string, string> = currentUser?.authToken 
        ? { Authorization: `Bearer ${currentUser.authToken}` }
        : {};
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`, { headers });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const headers: Record<string, string> = currentUser?.authToken 
        ? { Authorization: `Bearer ${currentUser.authToken}` }
        : {};
      await fetch(`/api/notifications/${id}/read`, { method: "PUT", headers });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed marking read:", err);
    }
  };

  const getNotificationDestination = (notification: Notification) => {
    const notificationText = `${notification.title} ${notification.message}`.toLowerCase();

    if (currentUser?.role === "SUPER_ADMIN" || notificationText.includes("admin")) {
      return "admin-dashboard";
    }
    if (currentUser?.role === "STUDIO_ADMIN") {
      return "studio-dashboard";
    }
    if (notificationText.includes("print")) {
      return "customer-dashboard-prints";
    }
    return "customer-dashboard";
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    onClose();
    onNavigate(getNotificationDestination(notification));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const roleLabel = currentUser?.role.replace("_", " ").toLowerCase() || "user";

  const filteredList = notifications.filter(n => {
    if (filterType === "All") return true;
    return n.type === filterType;
  });

  return (
    <div className="fixed top-[4.5rem] right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" /> Notifications
                </h3>
                <p className="text-[11px] text-slate-400">Updates for your {roleLabel} account</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter notifications by status */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <div className="flex gap-1">
                {(["All", "info", "success", "warning", "error"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      filterType === type 
                        ? "bg-amber-500 text-slate-950" 
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {type === "All" ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[min(28rem,calc(100vh-12rem))] overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <p className="text-xs">Fetching alerts...</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                  <p className="text-xs">No notifications recorded.</p>
                </div>
              ) : (
                filteredList.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      !n.isRead 
                        ? "bg-slate-800/80 border-amber-500/30 shadow-sm" 
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                    } w-full text-left hover:border-amber-400/60 hover:bg-slate-800`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {n.channel === "SMS" ? (
                          <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Smartphone className="w-3.5 h-3.5" />
                          </span>
                        ) : n.channel === "Email" ? (
                          <span className="p-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Bell className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="text-xs font-bold text-white">{n.title}</span>
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{n.message}</p>

                    {n.recipientContact && (
                      <div className="mt-2 text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono flex items-center justify-between">
                        <span>Recipient: {n.recipientContact}</span>
                        <span className="text-emerald-400 font-semibold">✓ Dispatched</span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
              <span className="text-[11px] text-slate-500">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</span>
            </div>
    </div>
  );
};
