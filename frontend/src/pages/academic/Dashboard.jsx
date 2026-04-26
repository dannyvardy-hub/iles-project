
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { fetchDashboard } from "../../services/userService";
import { fetchLogs, academicEvaluateLog } from "../../services/logService";

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
    if (!grades[id]?.trim()) return alert("Please enter a grade before submitting.");
    setActionLoading(id);
    setError("");
    try {
      await academicEvaluateLog(id, grades[id], comments[id] || "");
      const updated = allLogs.map(l =>
        l.id === id
          ? { ...l, status: "COMPLETED", academic_grade: grades[id], academic_comments: comments[id] }
          : l
      );
      setAllLogs(updated);
      if (filter === "ALL") {
        setLogs(updated);
      } else {
        setLogs(updated.filter(l => l.status === filter));
      }
    } catch (err) {
      setError(err.response?.data?.error || JSON.stringify(err.response?.data) || "Failed to evaluate.");
    } finally {
      setActionLoading(null);
    }
  };

  const filterButtons = [
    { key: "PENDING_ACADEMIC_EVALUATION", label: "Needs Evaluation" },
    { key: "COMPLETED", label: "Evaluated" },
    { key: "ALL", label: "All Logs" },
  ];

  return (
    <Layout title="Academic Supervisor Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: "1.5rem" }}>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #7c3aed" }}>
          <p style={{ margin: 0, color: "#64748b" }}>Needs Evaluation</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#7c3aed" }}>
            {loading ? "..." : allLogs.filter(l => l.status === "PENDING_ACADEMIC_EVALUATION").length}
          </h2>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, borderLeft: "4px solid #16a34a" }}>
          <p style={{ margin: 0, color: "#64748b" }}>Evaluated</p>
          <h2 style={{ margin: "0.25rem 0 0", color: "#16a34a" }}>
            {loading ? "..." : allLogs.filter(l => l.status === "COMPLETED").length}
          </h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {filterButtons.map(b => (
          <button key={b.key} onClick={() => handleFilter(b.key)}
            style={{
              padding: "0.5rem 1rem", borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: filter === b.key ? "#2563eb" : "#fff",
              color: filter === b.key ? "#fff" : "#1e293b",
              cursor: "pointer", fontWeight: filter === b.key ? 600 : 400
            }}>
            {b.label}
            {b.key !== "ALL" && (
              <span style={{ marginLeft: 6, background: filter === b.key ? "rgba(255,255,255,0.3)" : "#f1f5f9", padding: "0.1rem 0.4rem", borderRadius: 10, fontSize: "0.8rem" }}>
                {b.key === "PENDING_ACADEMIC_EVALUATION"
                  ? allLogs.filter(l => l.status === "PENDING_ACADEMIC_EVALUATION").length
                  : allLogs.filter(l => l.status === "COMPLETED").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && logs.length === 0 && (
        <p style={{ color: "#64748b" }}>
          {filter === "PENDING_ACADEMIC_EVALUATION"
            ? "No logs waiting for evaluation. Logs need to be approved by workplace supervisor first."
            : filter === "COMPLETED"
            ? "No evaluated logs yet."
            : "No logs found."}
        </p>
      )}

      {logs.map(log => (
        <div key={log.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: 0 }}>Week {log.week_number}</h3>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Student: <strong>{log.student_name || `ID: ${log.student}`}</strong>
              </p>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Submitted: {log.submitted_at?.slice(0, 10)}
              </p>
            </div>
            <span style={{
              fontWeight: 700, fontSize: "0.85rem",
              color: log.status === "COMPLETED" ? "#16a34a" : "#7c3aed",
              background: log.status === "COMPLETED" ? "#f0fdf4" : "#f5f3ff",
              padding: "0.3rem 0.7rem", borderRadius: 20
            }}>
              {log.status === "COMPLETED" ? "Evaluated" : "Needs Evaluation"}
            </span>
          </div>

          <h4 style={{ marginBottom: 4, marginTop: "1rem" }}>Activities</h4>
          <p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.activities}</p>

          {log.learning_outcomes && (
            <>
              <h4 style={{ marginBottom: 4 }}>Learning Outcomes</h4>
              <p style={{ lineHeight: 1.6, marginTop: 0 }}>{log.learning_outcomes}</p>
            </>
          )}

          {log.supervisor_rating && (
            <div style={{ background: "#eff6ff", padding: "0.75rem 1rem", borderRadius: 8, marginTop: "0.75rem", borderLeft: "4px solid #2563eb" }}>
              <strong>Work Supervisor Assessment</strong>
              <p style={{ margin: "0.25rem 0 0" }}>
                Rating: <strong>{log.supervisor_rating}/5</strong>
                {log.supervisor_rating === 5 && " — Excellent"}
                {log.supervisor_rating === 4 && " — Good"}
                {log.supervisor_rating === 3 && " — Average"}
                {log.supervisor_rating === 2 && " — Below Average"}
                {log.supervisor_rating === 1 && " — Poor"}
              </p>
              {log.supervisor_feedback && (
                <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>{log.supervisor_feedback}</p>
              )}
            </div>
          )}

          {log.status === "PENDING_ACADEMIC_EVALUATION" && (
            <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <h4 style={{ marginTop: 0, color: "#7c3aed" }}>Submit Your Evaluation</h4>
              <label style={lbl}>Grade (e.g. A, B+, 75%) *</label>
              <input
                value={grades[log.id] || ""}
                onChange={e => setGrades({ ...grades, [log.id]: e.target.value })}
                placeholder="Enter grade"
                style={{ ...inp, marginBottom: "1rem" }}
              />
              <label style={lbl}>Academic Comments</label>
              <textarea
                value={comments[log.id] || ""}
                onChange={e => setComments({ ...comments, [log.id]: e.target.value })}
                rows={3}
                placeholder="How well do the tasks align with learning objectives?"
                style={{ ...inp, resize: "vertical", marginBottom: "0.75rem" }}
              />
              <button
                onClick={() => handleEvaluate(log.id)}
                disabled={actionLoading === log.id}
                style={{ padding: "0.6rem 1.5rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {actionLoading === log.id ? "Submitting..." : "Submit Evaluation"}
              </button>
            </div>
          )}

          {log.status === "COMPLETED" && (
            <div style={{ marginTop: "1rem", background: "#f0fdf4", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #16a34a" }}>
              <strong>Your Evaluation</strong>
              <p style={{ margin: "0.5rem 0 0" }}>Grade: <strong style={{ fontSize: "1.1rem", color: "#16a34a" }}>{log.academic_grade}</strong></p>
              {log.academic_comments && (
                <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>{log.academic_comments}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </Layout>
  );
}

<<<<<<< HEAD
<<<<<<< HEAD

const card = {
  padding: "15px",
  background: "#fff",
  borderRadius: "10px",
};

export default function Dashboard() {

import Layout from "../../components/Layout";

export default function AcademicDashboard() {
  return (
    <Layout title="Academic Supervisor">

      <div style={{ display: "grid", gap: "15px" }}>

        <div style={card}>
          <h3>🎯 Students to Evaluate</h3>
          <button>View Students</button>
        </div>

        <div style={card}>
          <h3>📊 Scoring</h3>
          <button>Open Evaluation Form</button>
        </div>

      </div>

    </Layout>
  );
}

const card = {
  padding: "15px",
  background: "#fff",
  borderRadius: "10px",
};

const btnStyle = (bg) => ({ padding: "0.75rem", background: bg, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "1rem" });

=======
const btn = bg => ({
  padding: "0.6rem 1.2rem", background: bg, color: "#fff",
  border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600
});
>>>>>>> d8b3e49 (Merge frontend and backend)
=======
const lbl = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" };
<<<<<<< HEAD
const inp = { display: "block", width: "100%", padding: "0.6rem", marginBottom: "1rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" };
>>>>>>> 1d27c8d (admin able to make palcements)
=======
const inp = { display: "block", width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" };
>>>>>>> cccbfc6 ( amendement on frontend admin and academic users)
