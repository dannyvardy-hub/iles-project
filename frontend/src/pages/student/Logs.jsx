import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchLogs } from "../../services/logService";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs()
      .then(setLogs)
      .catch(() => setError("Failed to load logs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="My Weekly Logs">
      <button onClick={() => navigate("/student/logs/create")} style={btnStyle}>+ Submit New Log</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && logs.length === 0 && <p>No logs submitted yet.</p>}
      <div style={{ marginTop: "1rem" }}>
        {logs.map(log => (
          <div key={log.id} onClick={() => navigate(`/student/logs/${log.id}`)}
            style={{ background: "#fff", padding: "1rem 1.25rem", borderRadius: 8, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div>
              <strong>Week {log.week_number} — {log.title}</strong>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>{log.submitted_at?.slice(0, 10)}</p>
            </div>
            <span style={{ color: statusColor(log.status), fontWeight: 600 }}>{log.status}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const statusColor = s => ({ approved: "#16a34a", pending: "#d97706", returned: "#dc2626" }[s] || "#64748b");
const btnStyle = { padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 };