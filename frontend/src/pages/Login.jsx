import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as doLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const REDIRECT = {
  student: "/student/dashboard",
  supervisor: "/supervisor/dashboard",
  academic: "/academic/dashboard",
  admin: "/admin/dashboard",
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await doLogin(username, password);
      login(user);
      navigate(REDIRECT[user.role] || "/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 12, width: 380, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "0.25rem" }}>ILES Login</h2>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Internship Logging & Evaluation System</p>
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} required />
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: 4, fontWeight: 600, fontSize: "0.875rem" };
const inputStyle = { display: "block", width: "100%", padding: "0.6rem", marginBottom: "1rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" };
const btnStyle = { width: "100%", padding: "0.75rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 };