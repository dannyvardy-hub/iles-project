import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { fetchLogs, workApproveLog } from "../../services/logService";

const statusColor = {
  PENDING_WORK_APPROVAL: "#2563eb",
  PENDING_ACADEMIC_EVALUATION: "#7c3aed",
  COMPLETED: "#16a34a",
  RETURNED: "#dc2626",
};

export default function ReviewLogs() {
  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING_WORK_APPROVAL");

  useEffect(() => {
    fetchLogs()
      .then(data => {
        setAllLogs(data);
        setLogs(data.filter(l => l.status === "PENDING_WORK_APPROVAL"));
      })
      .catch(() => setError("Failed to load logs."))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (s) => {
  setFilter(s);
  if (s === "ALL") {
    setLogs(allLogs);
  } else {
    setLogs(allLogs.filter(l => l.status === s));
  }
};

  const handleApprove = async (id) => {
    if (!ratings[id]) return alert("Please select a rating before approving.");
    setActionLoading(id + "APPROVE");
    try {
      await workApproveLog(id, "APPROVE", ratings[id], feedbacks[id] || "");
      const update = prev => prev.map(l => l.id === id ? { ...l, status: "PENDING_ACADEMIC_EVALUATION" } : l);
      setAllLogs(update);
      setLogs(update);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (id) => {
    if (!feedbacks[id]?.trim()) return alert("Please enter feedback before returning.");
    setActionLoading(id + "RETURN");
    try {
      await workApproveLog(id, "RETURN", null, feedbacks[id]);
      const update = prev => prev.map(l => l.id === id ? { ...l, status: "RETURNED" } : l);
      setAllLogs(update);
      setLogs(update);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to return.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Layout title="Student Logs">
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        {["ALL", "PENDING_WORK_APPROVAL", "PENDING_ACADEMIC_EVALUATION", "COMPLETED", "RETURNED"].map(s => (
          <button key={s} onClick={() => handleFilter(s)}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #cbd5e1", background: filter === s ? "#2563eb" : "#fff", color: filter === s ? "#fff" : "#1e293b", cursor: "pointer", fontSize: "0.8rem" }}>
            {s === "PENDING_WORK_APPROVAL" ? "Pending Review" : s === "PENDING_ACADEMIC_EVALUATION" ? "Sent to Academic" : s}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && logs.length === 0 && (
        <p style={{ color: "#64748b" }}>No logs found for this filter.</p>
      )}

      {logs.map(log => (
        <div key={log.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0 }}>Week {log.week_number}</h3>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Student: <strong>{log.student_name || `ID: ${log.student}`}</strong>
              </p>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Submitted: {log.submitted_at?.slice(0, 10)}
              </p>
            </div>
            <span style={{ color: statusColor[log.status] || "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>
              {log.status === "PENDING_WORK_APPROVAL" ? "Needs Your Review" : log.status}
            </span>
          </div>

          <h4>Activities</h4>
          <p style={{ lineHeight: 1.6 }}>{log.activities}</p>
          {log.learning_outcomes && (<><h4>Learning Outcomes</h4><p style={{ lineHeight: 1.6 }}>{log.learning_outcomes}</p></>)}
          {log.challenges && (<><h4>Challenges</h4><p style={{ lineHeight: 1.6 }}>{log.challenges}</p></>)}

          {log.status === "PENDING_WORK_APPROVAL" && (
            <div style={{ marginTop: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.875rem" }}>
                  Performance Rating (1-5) *
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setRatings({ ...ratings, [log.id]: r })}
                      style={{ width: 40, height: 40, borderRadius: 6, border: "1px solid #cbd5e1", background: ratings[log.id] === r ? "#2563eb" : "#fff", color: ratings[log.id] === r ? "#fff" : "#1e293b", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                      {r}
                    </button>
                  ))}
                </div>
                {ratings[log.id] && (
                  <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                    {["", "Poor", "Below Average", "Average", "Good", "Excellent"][ratings[log.id]]}
                  </p>
                )}
              </div>

              <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" }}>
                Feedback / Comments
              </label>
              <textarea
                placeholder="Enter performance feedback (required to return)"
                value={feedbacks[log.id] || ""}
                onChange={e => setFeedbacks({ ...feedbacks, [log.id]: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: "0.75rem" }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handleApprove(log.id)} disabled={actionLoading === log.id + "APPROVE"}
                  style={{ padding: "0.6rem 1.2rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {actionLoading === log.id + "APPROVE" ? "Processing..." : "Approve & Send to Academic"}
                </button>
                <button onClick={() => handleReturn(log.id)} disabled={actionLoading === log.id + "RETURN"}
                  style={{ padding: "0.6rem 1.2rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {actionLoading === log.id + "RETURN" ? "Processing..." : "Return to Student"}
                </button>
              </div>
            </div>
          )}

          {log.status === "PENDING_ACADEMIC_EVALUATION" && (
            <div style={{ marginTop: "1rem", background: "#f5f3ff", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #7c3aed" }}>
              <p style={{ margin: 0, color: "#7c3aed", fontWeight: 600 }}>
                Approved — Rating: {log.supervisor_rating}/5 | Sent to academic supervisor for evaluation.
              </p>
            </div>
          )}
        </div>
      ))}
    </Layout>
  );
}