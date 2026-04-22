import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchPendingLogs, approveLog, returnLog } from "../../services/logService";

export default function ReviewLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingLogs()
      .then(setLogs)
      .catch(() => setError("Failed to load logs."))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await approveLog(id);
      setLogs(logs.filter(l => l.id !== id));
    } catch { setError("Failed to approve."); }
    finally { setActionLoading(null); }
  };

  const handleReturn = async (id) => {
    if (!feedback[id]?.trim()) return alert("Please enter feedback before returning.");
    setActionLoading(id + "_return");
    try {
      await returnLog(id, feedback[id]);
      setLogs(logs.filter(l => l.id !== id));
    } catch { setError("Failed to return log."); }
    finally { setActionLoading(null); }
  };

  return (
    <Layout title="Review Student Logs">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && logs.length === 0 && <p>No logs pending review. ✅</p>}
      {logs.map(log => (
        <div key={log.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0 }}>{log.student_name} — Week {log.week_number}</h3>
            <span style={{ color: "#d97706" }}>pending</span>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Submitted: {log.submitted_at?.slice(0, 10)}</p>
          <p><strong>{log.title}</strong></p>
          <p style={{ lineHeight: 1.6 }}>{log.content}</p>

          <textarea
            placeholder="Enter feedback (required to return)"
            value={feedback[log.id] || ""}
            onChange={e => setFeedback({ ...feedback, [log.id]: e.target.value })}
            rows={3}
            style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: "0.75rem" }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => handleApprove(log.id)}
              disabled={actionLoading === log.id + "_approve"}
              style={{ padding: "0.6rem 1.2rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
              {actionLoading === log.id + "_approve" ? "Approving..." : "✅ Approve"}
            </button>
            <button
              onClick={() => handleReturn(log.id)}
              disabled={actionLoading === log.id + "_return"}
              style={{ padding: "0.6rem 1.2rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
              {actionLoading === log.id + "_return" ? "Returning..." : "↩ Return"}
            </button>
          </div>
        </div>
      ))}
    </Layout>
  );
}