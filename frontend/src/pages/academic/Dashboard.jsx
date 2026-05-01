import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { fetchDashboard } from "../../services/userService";
import { fetchLogs, academicEvaluateLog } from "../../services/logService";

const GRADE_OPTIONS = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

export default function AcademicDashboard() {
  const [data, setData] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});
  const [comments, setComments] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING_ACADEMIC_EVALUATION");

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchLogs()])
      .then(([dash, logsData]) => {
        setData(dash);
        setAllLogs(logsData);
        setLogs(logsData.filter(l => l.status === "PENDING_ACADEMIC_EVALUATION"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (f) => {
    setFilter(f);
    if (f === "ALL") {
      setLogs(allLogs);
    } else {
      setLogs(allLogs.filter(l => l.status === f));
    }
  };

  const handleEvaluate = async (id) => {
    if (!grades[id]?.trim()) return alert("Please select or enter a grade.");
    setActionLoading(id);
    setError("");
    try {
      await academicEvaluateLog(id, grades[id], comments[id] || "");
      setAllLogs(prev => {
        const updated = prev.map(l =>
          l.id === id
            ? { ...l, status: "COMPLETED", academic_grade: grades[id], academic_comments: comments[id] }
            : l
        );
        if (filter === "ALL") setLogs(updated);
        else setLogs(updated.filter(l => l.status === filter));
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.error || JSON.stringify(err.response?.data) || "Failed to evaluate.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = allLogs.filter(l => l.status === "PENDING_ACADEMIC_EVALUATION").length;
  const completedCount = allLogs.filter(l => l.status === "COMPLETED").length;

  const filterButtons = [
    { key: "PENDING_ACADEMIC_EVALUATION", label: "Needs Grading", count: pendingCount },
    { key: "COMPLETED", label: "Graded", count: completedCount },
    { key: "ALL", label: "All", count: allLogs.length },
  ];

  return (
    <Layout title="Academic Supervisor Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: "1.5rem" }}>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #7c3aed" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Needs Grading</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#7c3aed" }}>{loading ? "..." : pendingCount}</h2>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #16a34a" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Graded</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#16a34a" }}>{loading ? "..." : completedCount}</h2>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #2563eb" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Total Logs</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#2563eb" }}>{loading ? "..." : allLogs.length}</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {filterButtons.map(b => (
          <button key={b.key} onClick={() => handleFilter(b.key)}
            style={{
              padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid #cbd5e1",
              background: filter === b.key ? "#2563eb" : "#fff",
              color: filter === b.key ? "#fff" : "#1e293b",
              cursor: "pointer", fontWeight: filter === b.key ? 600 : 400
            }}>
            {b.label}
            <span style={{ marginLeft: 6, background: filter === b.key ? "rgba(255,255,255,0.3)" : "#f1f5f9", padding: "0.1rem 0.5rem", borderRadius: 10, fontSize: "0.8rem" }}>
              {b.count}
            </span>
          </button>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && logs.length === 0 && (
        <p style={{ color: "#64748b" }}>
          {filter === "PENDING_ACADEMIC_EVALUATION"
            ? "No logs waiting for grading. Logs must be approved by workplace supervisor first."
            : "No logs found."}
        </p>
      )}

      {logs.map(log => (
        <div key={log.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${log.status === "COMPLETED" ? "#16a34a" : "#7c3aed"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: 0 }}>Week {log.week_number}</h3>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Student: <strong>{log.student_name}</strong> ({log.student_email})
              </p>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Company: {log.placement_company} | Submitted: {log.submitted_at?.slice(0, 10)}
              </p>
              {log.resubmitted_at && (
                <p style={{ margin: "0.25rem 0 0", color: "#7c3aed", fontSize: "0.85rem" }}>
                  Resubmitted: {log.resubmitted_at.slice(0, 10)}
                </p>
              )}
            </div>
            <span style={{
              fontWeight: 700, fontSize: "0.85rem",
              color: log.status === "COMPLETED" ? "#16a34a" : "#7c3aed",
              background: log.status === "COMPLETED" ? "#f0fdf4" : "#f5f3ff",
              padding: "0.3rem 0.8rem", borderRadius: 20
            }}>
              {log.status === "COMPLETED" ? "Graded" : "Needs Grading"}
            </span>
          </div>

          <h4 style={{ marginTop: "1rem", marginBottom: 4 }}>Activities</h4>
          <p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.activities}</p>
          {log.learning_outcomes && (<><h4 style={{ marginBottom: 4 }}>Learning Outcomes</h4><p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.learning_outcomes}</p></>)}
          {log.challenges && (<><h4 style={{ marginBottom: 4 }}>Challenges</h4><p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.challenges}</p></>)}

          {log.supervisor_rating && (
            <div style={{ background: "#eff6ff", padding: "0.75rem 1rem", borderRadius: 8, marginTop: "0.75rem", borderLeft: "4px solid #2563eb" }}>
              <strong>Work Supervisor Assessment</strong>
              <p style={{ margin: "0.25rem 0 0" }}>
                Rating: <strong>{log.supervisor_rating}/5</strong> — {["", "Poor", "Below Average", "Average", "Good", "Excellent"][log.supervisor_rating]}
              </p>
              {log.supervisor_feedback && <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>{log.supervisor_feedback}</p>}
            </div>
          )}

          {log.status === "PENDING_ACADEMIC_EVALUATION" && (
            <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <h4 style={{ marginTop: 0, color: "#7c3aed" }}>Grade This Log</h4>

              <label style={lbl}>Select Grade *</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
                {GRADE_OPTIONS.map(g => (
                  <button key={g} onClick={() => setGrades({ ...grades, [log.id]: g })}
                    style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "2px solid", borderColor: grades[log.id] === g ? "#7c3aed" : "#cbd5e1", background: grades[log.id] === g ? "#7c3aed" : "#fff", color: grades[log.id] === g ? "#fff" : "#1e293b", cursor: "pointer", fontWeight: 600 }}>
                    {g}
                  </button>
                ))}
              </div>
              <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: -8 }}>Or type a custom grade:</p>
              <input
                value={grades[log.id] || ""}
                onChange={e => setGrades({ ...grades, [log.id]: e.target.value })}
                placeholder="e.g. A, B+, 85%"
                style={{ display: "block", width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: "1rem" }}
              />

              <label style={lbl}>Academic Comments</label>
              <textarea
                value={comments[log.id] || ""}
                onChange={e => setComments({ ...comments, [log.id]: e.target.value })}
                rows={3}
                placeholder="How well do the activities align with learning objectives?"
                style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: "0.75rem" }}
              />

              <button onClick={() => handleEvaluate(log.id)} disabled={actionLoading === log.id}
                style={{ padding: "0.6rem 1.5rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {actionLoading === log.id ? "Submitting..." : "Submit Grade"}
              </button>
            </div>
          )}

          {log.status === "COMPLETED" && (
            <div style={{ marginTop: "1rem", background: "#f0fdf4", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #16a34a" }}>
              <strong>Your Grade</strong>
              <p style={{ margin: "0.5rem 0 0" }}>
                Grade: <strong style={{ fontSize: "1.3rem", color: "#16a34a" }}>{log.academic_grade}</strong>
              </p>
              {log.academic_comments && <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>{log.academic_comments}</p>}
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Evaluated: {log.academic_evaluated_at?.slice(0, 10)}
              </p>
            </div>
          )}
        </div>
      ))}
    </Layout>
  );
}

const lbl = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" };