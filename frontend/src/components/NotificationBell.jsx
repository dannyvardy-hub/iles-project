import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } from "../services/notificationService";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const data = await fetchUnreadCount();
            setUnreadCount(data.count);
        } catch { }
    };

    const handleOpen = async () => {
        setOpen(!open);
        if (!open) {
            setLoading(true);
            try {
                const data = await fetchNotifications();
                setNotifications(data);
            } catch { }
            finally { setLoading(false); }
        }
    };

    const handleMarkRead = async (id, logId) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
                onClick={handleOpen}
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "0.4rem" }}
            >
                <span style={{ fontSize: "1.4rem" }}>🔔</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: 0, right: 0,
                        background: "#dc2626", color: "#fff",
                        borderRadius: "50%", width: 18, height: 18,
                        fontSize: "0.7rem", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontWeight: 700
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: "absolute", right: 0, top: "110%",
                    width: 360, maxHeight: 480, overflowY: "auto",
                    background: "#fff", borderRadius: 10,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    zIndex: 1000, border: "1px solid #e2e8f0"
                }}>
                    <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: "#1e293b" }}>Notifications</strong>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead}
                                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.8rem" }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {loading && <p style={{ padding: "1rem", color: "#64748b", textAlign: "center" }}>Loading...</p>}
                    {!loading && notifications.length === 0 && (
                        <p style={{ padding: "1.5rem", color: "#64748b", textAlign: "center" }}>No notifications yet.</p>
                    )}

                    {notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => handleMarkRead(n.id, n.log)}
                            style={{
                                padding: "0.875rem 1.25rem",
                                borderBottom: "1px solid #f8fafc",
                                cursor: "pointer",
                                background: n.is_read ? "#fff" : "#eff6ff",
                                transition: "background 0.2s"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <p style={{ margin: 0, fontSize: "0.875rem", color: "#1e293b", lineHeight: 1.5, flex: 1 }}>
                                    {!n.is_read && (
                                        <span style={{ display: "inline-block", width: 8, height: 8, background: "#2563eb", borderRadius: "50%", marginRight: 8 }} />
                                    )}
                                    {n.message}
                                </p>
                            </div>
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
                                {n.sender_name} • {timeAgo(n.created_at)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}