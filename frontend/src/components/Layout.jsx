import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = {
  student: [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "My Logs", path: "/student/logs" },
    { label: "Submit Log", path: "/student/logs/create" },
  ],
  supervisor: [
    { label: "Dashboard", path: "/supervisor/dashboard" },
    { label: "Review Logs", path: "/supervisor/review" },
  ],
  academic: [
    { label: "Dashboard", path: "/academic/dashboard" },
    { label: "Students", path: "/academic/students" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Users", path: "/admin/users" },
  ],
};

export default function Layout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#1e293b", color: "#fff", padding: "1.5rem 1rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "2rem", color: "#94a3b8" }}>ILES System</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {links.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              style={{
                background: "none", border: "none", color: "#e2e8f0",
                textAlign: "left", padding: "0.6rem 0.8rem", cursor: "pointer",
                borderRadius: 6, fontSize: "0.95rem",
              }}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto", display: "block", width: "100%",
            marginTop: "3rem", background: "#ef4444", border: "none",
            color: "#fff", padding: "0.6rem", borderRadius: 6, cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "2rem", background: "#f8fafc" }}>
        <h1 style={{ marginBottom: "1.5rem", color: "#1e293b" }}>{title}</h1>
        {children}
      </main>
    </div>
  );
}