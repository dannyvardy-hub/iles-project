import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchLogs, deleteLog } from "../../services/logService";

const statusConfig = {
  DRAFT: { color: "#d97706", bg: "#fef3c7", label: "Draft" },
  PENDING_WORK_APPROVAL: { color: "#2563eb", bg: "#eff6ff", label: "Pending Work Approval" },
  RETURNED: { color: "#dc2626", bg: "#fef2f2", label: "Returned — Update & Resubmit" },
  RESUBMITTED: { color: "#7c3aed", bg: "#f5f3ff", label: "Resubmitted" },
  PENDING_ACADEMIC_EVALUATION: { color: "#0891b2", bg: "#ecfeff", label: "Pending Academic Evaluation" },
  COMPLETED: { color: "#16a34a", bg: "#f0fdf4", label: "Completed" },
};

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this draft log?")) return;
    try {
      await deleteLog(id);
      setLogs(logs.filter(l => l.id !== id));
    } catch {
      alert("Failed to delete log.");
    }
  };

  return (
    <Layout title="My Weekly Logs">
      <button
        onClick={() => navigate("/student/logs/create")}
        style={{ padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, marginBottom: "1rem" }}>
        + Create New Log
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && logs.length === 0 && <p>No logs yet. Create your first log above.</p>}

      <div>
        {logs.map(log => {
          const cfg = statusConfig[log.status] || { color: "#64748b", bg: "#f8fafc", label: log.status };
          return (
            <div
              key={log.id}
              onClick={() => navigate(`/student/logs/${log.id}`)}
              style={{ background: "#fff", padding: "1rem 1.25rem", borderRadius: 8, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${cfg.color}` }}
            >
              <div>
                <strong>Week {log.week_number}</strong>
                {log.resubmitted_at && (
                  <span style={{ marginLeft: 8, fontSize: "0.75rem", background: "#f5f3ff", color: "#7c3aed", padding: "0.1rem 0.4rem", borderRadius: 10 }}>
                    Resubmitted
                  </span>
                )}
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  {log.status === "RETURNED"
                    ? "Rejected by supervisor — click to update and resubmit"
                    : log.submitted_at
                    ? `Submitted: ${log.submitted_at.slice(0, 10)}`
                    : `Created: ${log.created_at?.slice(0, 10)}`}
                </p>
                {log.status === "RETURNED" && log.supervisor_rejection_reason && (
                  <p style={{ margin: "0.25rem 0 0", color: "#dc2626", fontSize: "0.85rem" }}>
                    Reason: {log.supervisor_rejection_reason}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: cfg.color, background: cfg.bg, padding: "0.25rem 0.6rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {cfg.label}
                </span>
                {log.status === "DRAFT" && (
                  <button
                    onClick={(e) => handleDelete(e, log.id)}
                    style={{ padding: "0.3rem 0.7rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}