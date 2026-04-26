import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchLogById, submitLog, fetchLogHistory } from "../../services/logService";

const statusColor = {
  DRAFT: "#d97706",
  PENDING_WORK_APPROVAL: "#2563eb",
  PENDING_ACADEMIC_EVALUATION: "#7c3aed",
  COMPLETED: "#16a34a",
  RETURNED: "#dc2626",
};

const statusLabel = {
  DRAFT: "Draft",
  PENDING_WORK_APPROVAL: "Pending Work Approval",
  PENDING_ACADEMIC_EVALUATION: "Pending Academic Evaluation",
  COMPLETED: "Completed",
  RETURNED: "Returned — Please revise and resubmit",
};

export default function LogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    Promise.all([fetchLogById(id), fetchLogHistory(id)])
      .then(([logData, historyData]) => {
        setLog(logData);
        setHistory(historyData);
      })
      .catch(() => setError("Could not load log."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await submitLog(id);
      const updated = await fetchLogById(id);
      setLog(updated);
      setSuccessMsg("Log submitted successfully. Awaiting work supervisor approval.");
    } catch (err) {
      setError(err.response?.data?.error || JSON.stringify(err.response?.data) || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout title="Log Detail"><p>Loading...</p></Layout>;
  if (error && !log) return <Layout title="Log Detail"><p style={{ color: "red" }}>{error}</p></Layout>;

  return (
    <Layout title={`Week ${log.week_number} Log`}>
      <button onClick={() => navigate("/student/logs")}
        style={{ marginBottom: "1rem", background: "none", border: "1px solid #cbd5e1", padding: "0.4rem 0.9rem", borderRadius: 6, cursor: "pointer" }}>
        Back to Logs
      </button>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Week {log.week_number}</h3>
          <span style={{ color: statusColor[log.status], fontWeight: 700, fontSize: "0.85rem" }}>
            {statusLabel[log.status] || log.status}
          </span>
        </div>

        <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
          Deadline: {log.submission_deadline?.slice(0, 10)}
          {log.submitted_at && ` | Submitted: ${log.submitted_at.slice(0, 10)}`}
        </p>

        <h4>Activities</h4>
        <p style={{ lineHeight: 1.7 }}>{log.activities}</p>

        {log.learning_outcomes && (<><h4>Learning Outcomes</h4><p style={{ lineHeight: 1.7 }}>{log.learning_outcomes}</p></>)}
        {log.challenges && (<><h4>Challenges</h4><p style={{ lineHeight: 1.7 }}>{log.challenges}</p></>)}

        {log.supervisor_rating && (
          <div style={{ marginTop: "1rem", background: "#f0f9ff", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #2563eb" }}>
            <strong>Work Supervisor Feedback</strong>
            <p style={{ margin: "0.5rem 0 0" }}>Rating: <strong>{log.supervisor_rating}/5</strong></p>
            {log.supervisor_feedback && <p style={{ margin: "0.25rem 0 0" }}>{log.supervisor_feedback}</p>}
          </div>
        )}

        {log.academic_grade && (
          <div style={{ marginTop: "1rem", background: "#f0fdf4", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #16a34a" }}>
            <strong>Academic Evaluation</strong>
            <p style={{ margin: "0.5rem 0 0" }}>Grade: <strong>{log.academic_grade}</strong></p>
            {log.academic_comments && <p style={{ margin: "0.25rem 0 0" }}>{log.academic_comments}</p>}
          </div>
        )}

        {successMsg && <p style={{ color: "#16a34a", fontWeight: 600, marginTop: "1rem" }}>{successMsg}</p>}
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        {(log.status === "DRAFT" || log.status === "RETURNED") && (
          <button onClick={handleSubmit} disabled={submitting}
            style={{ marginTop: "1rem", padding: "0.7rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
            {submitting ? "Submitting..." : "Submit Log to Work Supervisor"}
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Status History</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>{h.previous_status}</strong> → <strong>{h.new_status}</strong></span>
                <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{h.timestamp?.slice(0, 10)}</span>
              </div>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>by {h.changed_by_name}</p>
              {h.comment && <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>{h.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}