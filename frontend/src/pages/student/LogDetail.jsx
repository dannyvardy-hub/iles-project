import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchLogById, submitLog, updateLog, fetchLogHistory } from "../../services/logService";

const statusConfig = {
  DRAFT: { color: "#d97706", label: "Draft" },
  PENDING_WORK_APPROVAL: { color: "#2563eb", label: "Pending Work Approval" },
  RETURNED: { color: "#dc2626", label: "Returned — Update & Resubmit" },
  RESUBMITTED: { color: "#7c3aed", label: "Resubmitted" },
  PENDING_ACADEMIC_EVALUATION: { color: "#0891b2", label: "Pending Academic Evaluation" },
  COMPLETED: { color: "#16a34a", label: "Completed" },
};

export default function LogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    Promise.all([fetchLogById(id), fetchLogHistory(id)])
      .then(([logData, historyData]) => {
        setLog(logData);
        setHistory(historyData);
        setEditForm({
          activities: logData.activities,
          learning_outcomes: logData.learning_outcomes,
          challenges: logData.challenges,
        });
      })
      .catch(() => setError("Could not load log."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveEdit = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateLog(id, editForm);
      setLog(updated);
      setEditing(false);
      setSuccessMsg("Log updated. You can now resubmit.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      await submitLog(id);
      const [updated, hist] = await Promise.all([fetchLogById(id), fetchLogHistory(id)]);
      setLog(updated);
      setHistory(hist);
      setSuccessMsg(
        updated.status === "RESUBMITTED"
          ? "Log resubmitted successfully. Awaiting supervisor review."
          : "Log submitted successfully. Awaiting work supervisor approval."
      );
    } catch (err) {
      setError(err.response?.data?.error || JSON.stringify(err.response?.data) || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout title="Log Detail"><p>Loading...</p></Layout>;
  if (error && !log) return <Layout title="Log Detail"><p style={{ color: "red" }}>{error}</p></Layout>;

  const cfg = statusConfig[log.status] || { color: "#64748b", label: log.status };
  const canEdit = log.status === "RETURNED";
  const canSubmit = log.status === "DRAFT" || log.status === "RETURNED";

  return (
    <Layout title={`Week ${log.week_number} Log`}>
      <button onClick={() => navigate("/student/logs")}
        style={{ marginBottom: "1rem", background: "none", border: "1px solid #cbd5e1", padding: "0.4rem 0.9rem", borderRadius: 6, cursor: "pointer" }}>
        ← Back to Logs
      </button>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: 0 }}>Week {log.week_number}</h3>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              {log.placement_company} | Deadline: {log.submission_deadline?.slice(0, 10)}
            </p>
            {log.submitted_at && (
              <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Submitted: {log.submitted_at.slice(0, 10)}
              </p>
            )}
            {log.resubmitted_at && (
              <p style={{ margin: "0.25rem 0 0", color: "#7c3aed", fontSize: "0.85rem" }}>
                Resubmitted: {log.resubmitted_at.slice(0, 10)}
              </p>
            )}
          </div>
          <span style={{ color: cfg.color, fontWeight: 700, fontSize: "0.85rem", background: "#f8fafc", padding: "0.3rem 0.8rem", borderRadius: 20 }}>
            {cfg.label}
          </span>
        </div>

        {/* Rejection reason */}
        {log.status === "RETURNED" && log.supervisor_rejection_reason && (
          <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: 8, marginBottom: "1rem", borderLeft: "4px solid #dc2626" }}>
            <strong style={{ color: "#dc2626" }}>Rejected by Work Supervisor</strong>
            <p style={{ margin: "0.5rem 0 0" }}><strong>Reason:</strong> {log.supervisor_rejection_reason}</p>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              Please update your log below and resubmit.
            </p>
          </div>
        )}

        {/* Editable fields when returned */}
        {editing && canEdit ? (
          <div>
            <label style={lbl}>Activities *</label>
            <textarea
              value={editForm.activities}
              onChange={e => setEditForm({ ...editForm, activities: e.target.value })}
              rows={5}
              style={{ ...inp, resize: "vertical" }}
            />
            <label style={lbl}>Learning Outcomes</label>
            <textarea
              value={editForm.learning_outcomes}
              onChange={e => setEditForm({ ...editForm, learning_outcomes: e.target.value })}
              rows={3}
              style={{ ...inp, resize: "vertical" }}
            />
            <label style={lbl}>Challenges</label>
            <textarea
              value={editForm.challenges}
              onChange={e => setEditForm({ ...editForm, challenges: e.target.value })}
              rows={3}
              style={{ ...inp, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSaveEdit} disabled={saving}
                style={{ padding: "0.6rem 1.2rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)}
                style={{ padding: "0.6rem 1.2rem", background: "#fff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h4>Activities</h4>
            <p style={{ lineHeight: 1.7 }}>{log.activities}</p>
            {log.learning_outcomes && (<><h4>Learning Outcomes</h4><p style={{ lineHeight: 1.7 }}>{log.learning_outcomes}</p></>)}
            {log.challenges && (<><h4>Challenges</h4><p style={{ lineHeight: 1.7 }}>{log.challenges}</p></>)}
          </div>
        )}

        {/* Work supervisor feedback */}
        {log.supervisor_rating && (
          <div style={{ marginTop: "1rem", background: "#eff6ff", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #2563eb" }}>
            <strong>Work Supervisor Assessment</strong>
            <p style={{ margin: "0.5rem 0 0" }}>Rating: <strong>{log.supervisor_rating}/5</strong></p>
            {log.supervisor_feedback && <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>{log.supervisor_feedback}</p>}
          </div>
        )}

        {/* Academic grade */}
        {log.academic_grade && (
          <div style={{ marginTop: "1rem", background: "#f0fdf4", padding: "1rem", borderRadius: 8, borderLeft: "4px solid #16a34a" }}>
            <strong>Academic Evaluation</strong>
            <p style={{ margin: "0.5rem 0 0" }}>Grade: <strong style={{ fontSize: "1.2rem", color: "#16a34a" }}>{log.academic_grade}</strong></p>
            {log.academic_comments && <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>{log.academic_comments}</p>}
          </div>
        )}

        {successMsg && <p style={{ color: "#16a34a", fontWeight: 600, marginTop: "1rem" }}>{successMsg}</p>}
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
          {canEdit && !editing && (
            <button onClick={() => setEditing(true)}
              style={{ padding: "0.7rem 1.5rem", background: "#d97706", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
              Edit Log
            </button>
          )}
          {canSubmit && !editing && (
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: "0.7rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
              {submitting ? "Submitting..." : log.status === "RETURNED" ? "Resubmit to Supervisor" : "Submit to Work Supervisor"}
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Full History</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>{h.previous_status}</strong> → <strong>{h.new_status}</strong>
                  <span style={{ marginLeft: 8, fontSize: "0.8rem", color: "#64748b" }}>by {h.changed_by_name} ({h.changed_by_role})</span>
                </span>
                <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{h.timestamp?.slice(0, 10)}</span>
              </div>
              {h.comment && <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>{h.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

const lbl = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" };
const inp = { display: "block", width: "100%", padding: "0.6rem", marginBottom: "1rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" };