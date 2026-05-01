import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { fetchLogs, workApproveLog } from "../../services/logService";

const statusConfig = {
  PENDING_WORK_APPROVAL: { color: "#2563eb", label: "Needs Review" },
  RESUBMITTED: { color: "#7c3aed", label: "Resubmitted — Needs Review" },
  PENDING_ACADEMIC_EVALUATION: { color: "#0891b2", label: "Sent to Academic" },
  RETURNED: { color: "#dc2626", label: "Rejected" },
  COMPLETED: { color: "#16a34a", label: "Completed" },
};

const filterButtons = [
  { key: "PENDING", label: "Needs Review" },
  { key: "PENDING_ACADEMIC_EVALUATION", label: "Sent to Academic" },
  { key: "RETURNED", label: "Rejected" },
  { key: "COMPLETED", label: "Completed" },
  { key: "ALL", label: "All" },
];

export default function ReviewLogs() {
  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [rejections, setRejections] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    fetchLogs()
      .then(data => {
        setAllLogs(data);
        setLogs(data.filter(l =>
          l.status === "PENDING_WORK_APPROVAL" || l.status === "RESUBMITTED"
        ));
      })
      .catch(() => setError("Failed to load logs."))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (f) => {
    setFilter(f);
    if (f === "ALL") {
      setLogs(allLogs);
    } else if (f === "PENDING") {
      setLogs(allLogs.filter(l =>
        l.status === "PENDING_WORK_APPROVAL" || l.status === "RESUBMITTED"
      ));
    } else {
      setLogs(allLogs.filter(l => l.status === f));
    }
  };

  const handleApprove = async (id) => {
    if (!ratings[id]) return alert("Please select a rating before approving.");
    setActionLoading(id + "APPROVE");
    try {
      await workApproveLog(id, "APPROVE", ratings[id], feedbacks[id] || "", "");
      const update = prev => prev.map(l =>
        l.id === id ? { ...l, status: "PENDING_ACADEMIC_EVALUATION", supervisor_rating: ratings[id] } : l
      );
      setAllLogs(update);
      handleFilter(filter);
      setAllLogs(prev => {
        const updated = prev.map(l =>
          l.id === id ? { ...l, status: "PENDING_ACADEMIC_EVALUATION", supervisor_rating: ratings[id] } : l
        );
        if (filter === "PENDING") {
          setLogs(updated.filter(l => l.status === "PENDING_WORK_APPROVAL" || l.status === "RESUBMITTED"));
        } else if (filter === "ALL") {
          setLogs(updated);
        } else {
          setLogs(updated.filter(l => l.status === filter));
        }
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejections[id]?.trim()) return alert("Please enter a rejection reason.");
    setActionLoading(id + "REJECT");
    try {
      await workApproveLog(id, "REJECT", null, "", rejections[id]);
      setAllLogs(prev => {
        const updated = prev.map(l =>
          l.id === id ? { ...l, status: "RETURNED", supervisor_rejection_reason: rejections[id] } : l
        );
        if (filter === "PENDING") {
          setLogs(updated.filter(l => l.status === "PENDING_WORK_APPROVAL" || l.status === "RESUBMITTED"));
        } else if (filter === "ALL") {
          setLogs(updated);
        } else {
          setLogs(updated.filter(l => l.status === filter));
        }
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject.");
    } finally {
      setActionLoading(null);
    }
  };

  const getCount = (f) => {
    if (f === "PENDING") return allLogs.filter(l => l.status === "PENDING_WORK_APPROVAL" || l.status === "RESUBMITTED").length;
    return allLogs.filter(l => l.status === f).length;
  };

  return (
    <Layout title="Student Logs">
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {filterButtons.map(b => (
          <button key={b.key} onClick={() => handleFilter(b.key)}
            style={{
              padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid #cbd5e1",
              background: filter === b.key ? "#2563eb" : "#fff",
              color: filter === b.key ? "#fff" : "#1e293b",
              cursor: "pointer", fontWeight: filter === b.key ? 600 : 400, fontSize: "0.85rem"
            }}>
            {b.label}
            {b.key !== "ALL" && (
              <span style={{ marginLeft: 6, background: filter === b.key ? "rgba(255,255,255,0.3)" : "#f1f5f9", padding: "0.1rem 0.5rem", borderRadius: 10, fontSize: "0.8rem" }}>
                {getCount(b.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && logs.length === 0 && (
        <p style={{ color: "#64748b" }}>No logs found for this filter.</p>
      )}

      {logs.map(log => {
        const cfg = statusConfig[log.status] || { color: "#64748b", label: log.status };
        const needsReview = log.status === "PENDING_WORK_APPROVAL" || log.status === "RESUBMITTED";

        return (
          <div key={log.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${cfg.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  Week {log.week_number}
                  {log.status === "RESUBMITTED" && (
                    <span style={{ marginLeft: 10, fontSize: "0.8rem", background: "#f5f3ff", color: "#7c3aed", padding: "0.2rem 0.5rem", borderRadius: 10 }}>
                      Updated & Resubmitted
                    </span>
                  )}
                </h3>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  Student: <strong>{log.student_name}</strong> | {log.placement_company}
                </p>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  Submitted: {log.submitted_at?.slice(0, 10)}
                  {log.resubmitted_at && ` | Resubmitted: ${log.resubmitted_at.slice(0, 10)}`}
                </p>
              </div>
              <span style={{ color: cfg.color, fontWeight: 700, fontSize: "0.8rem", background: "#f8fafc", padding: "0.3rem 0.7rem", borderRadius: 20 }}>
                {cfg.label}
              </span>
            </div>

            <h4 style={{ marginBottom: 4, marginTop: "1rem" }}>Activities</h4>
            <p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.activities}</p>

            {log.learning_outcomes && (<><h4 style={{ marginBottom: 4 }}>Learning Outcomes</h4><p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.learning_outcomes}</p></>)}
            {log.challenges && (<><h4 style={{ marginBottom: 4 }}>Challenges</h4><p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.challenges}</p></>)}

            {needsReview && (
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lbl}>Performance Rating (1-5) — Required to Approve</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} onClick={() => setRatings({ ...ratings, [log.id]: r })}
                        style={{ width: 44, height: 44, borderRadius: 8, border: "2px solid", borderColor: ratings[log.id] === r ? "#2563eb" : "#cbd5e1", background: ratings[log.id] === r ? "#2563eb" : "#fff", color: ratings[log.id] === r ? "#fff" : "#1e293b", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                        {r}
                      </button>
                    ))}
                    {ratings[log.id] && (
                      <span style={{ alignSelf: "center", color: "#64748b", fontSize: "0.85rem" }}>
                        — {["", "Poor", "Below Average", "Average", "Good", "Excellent"][ratings[log.id]]}
                      </span>
                    )}
                  </div>
                </div>

                <label style={lbl}>Feedback / Comments (optional for approval)</label>
                <textarea
                  placeholder="Enter performance feedback..."
                  value={feedbacks[log.id] || ""}
                  onChange={e => setFeedbacks({ ...feedbacks, [log.id]: e.target.value })}
                  rows={2}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: "0.75rem" }}
                />

                <label style={lbl}>Rejection Reason (required to reject)</label>
                <textarea
                  placeholder="Explain why this log is being rejected..."
                  value={rejections[log.id] || ""}
                  onChange={e => setRejections({ ...rejections, [log.id]: e.target.value })}
                  rows={2}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: "0.75rem" }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => handleApprove(log.id)} disabled={actionLoading === log.id + "APPROVE"}
                    style={{ padding: "0.6rem 1.2rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                    {actionLoading === log.id + "APPROVE" ? "Processing..." : "Approve & Send to Academic"}
                  </button>
                  <button onClick={() => handleReject(log.id)} disabled={actionLoading === log.id + "REJECT"}
                    style={{ padding: "0.6rem 1.2rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                    {actionLoading === log.id + "REJECT" ? "Processing..." : "Reject & Return to Student"}
                  </button>
                </div>
              </div>
            )}

            {log.status === "PENDING_ACADEMIC_EVALUATION" && (
              <div style={{ marginTop: "1rem", background: "#ecfeff", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #0891b2" }}>
                <p style={{ margin: 0, color: "#0891b2", fontWeight: 600 }}>
                  Approved — Rating: {log.supervisor_rating}/5 | Sent to academic supervisor.
                </p>
              </div>
            )}

            {log.status === "COMPLETED" && (
              <div style={{ marginTop: "1rem", background: "#f0fdf4", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #16a34a" }}>
                <p style={{ margin: 0, color: "#16a34a", fontWeight: 600 }}>
                  Completed — Academic Grade: {log.academic_grade}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </Layout>
  );
}

const lbl = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" };