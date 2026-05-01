import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { fetchDashboard, fetchUsers } from "../../services/userService";
import { fetchLogs } from "../../services/logService";
import { fetchPlacements } from "../../services/placementService";

const statusConfig = {
  DRAFT: { color: "#d97706", bg: "#fef3c7" },
  PENDING_WORK_APPROVAL: { color: "#2563eb", bg: "#eff6ff" },
  RETURNED: { color: "#dc2626", bg: "#fef2f2" },
  RESUBMITTED: { color: "#7c3aed", bg: "#f5f3ff" },
  PENDING_ACADEMIC_EVALUATION: { color: "#0891b2", bg: "#ecfeff" },
  COMPLETED: { color: "#16a34a", bg: "#f0fdf4" },
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchUsers(), fetchLogs(), fetchPlacements()])
      .then(([dash, u, l, p]) => {
        setData(dash);
        setUsers(u);
        setLogs(l);
        setPlacements(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logFilter === "ALL" ? logs : logs.filter(l => l.status === logFilter);

  const getUserName = (id) => {
    const u = users.find(u => u.id === id);
    return u ? `${u.first_name} ${u.last_name}` : `ID: ${id}`;
  };

  const stats = [
    { label: "Total Students", value: users.filter(u => u.role === "STUDENT").length, color: "#2563eb" },
    { label: "Total Placements", value: placements.length, color: "#7c3aed" },
    { label: "Total Logs", value: logs.length, color: "#0891b2" },
    { label: "Pending Work Review", value: logs.filter(l => l.status === "PENDING_WORK_APPROVAL" || l.status === "RESUBMITTED").length, color: "#d97706" },
    { label: "Pending Academic", value: logs.filter(l => l.status === "PENDING_ACADEMIC_EVALUATION").length, color: "#7c3aed" },
    { label: "Completed", value: logs.filter(l => l.status === "COMPLETED").length, color: "#16a34a" },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "logs", label: `All Logs (${logs.length})` },
    { key: "users", label: `Users (${users.length})` },
    { key: "placements", label: `Placements (${placements.length})` },
  ];

  return (
    <Layout title="Admin Dashboard">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", padding: "1rem", borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8rem" }}>{s.label}</p>
            <h2 style={{ margin: "0.25rem 0 0", color: s.color }}>{loading ? "..." : s.value}</h2>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#fff", padding: "1rem 1.5rem", borderRadius: 10, marginBottom: "1.5rem", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/admin/users")} style={btn("#2563eb")}>Manage Users</button>
        <button onClick={() => navigate("/admin/placements")} style={btn("#7c3aed")}>Manage Placements</button>
        <button onClick={() => navigate("/admin/register")} style={btn("#16a34a")}>Register User</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: "1.5rem", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ flex: 1, padding: "0.75rem", background: activeTab === t.key ? "#2563eb" : "#fff", color: activeTab === t.key ? "#fff" : "#64748b", border: "none", cursor: "pointer", fontWeight: activeTab === t.key ? 600 : 400, fontSize: "0.85rem" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10 }}>
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
          {logs.slice(0, 10).map(log => {
            const cfg = statusConfig[log.status] || { color: "#64748b", bg: "#f8fafc" };
            return (
              <div key={log.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{log.student_name}</strong> — Week {log.week_number}
                  <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                    {log.placement_company} | {log.submitted_at?.slice(0, 10) || "Not submitted"}
                  </p>
                </div>
                <span style={{ color: cfg.color, background: cfg.bg, padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                  {log.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
            {["ALL", "DRAFT", "PENDING_WORK_APPROVAL", "RESUBMITTED", "RETURNED", "PENDING_ACADEMIC_EVALUATION", "COMPLETED"].map(s => (
              <button key={s} onClick={() => setLogFilter(s)}
                style={{ padding: "0.3rem 0.7rem", borderRadius: 6, border: "1px solid #cbd5e1", background: logFilter === s ? "#2563eb" : "#fff", color: logFilter === s ? "#fff" : "#1e293b", cursor: "pointer", fontSize: "0.8rem" }}>
                {s === "ALL" ? "All" : s} ({s === "ALL" ? logs.length : logs.filter(l => l.status === s).length})
              </button>
            ))}
          </div>
          {filteredLogs.map(log => {
            const cfg = statusConfig[log.status] || { color: "#64748b", bg: "#f8fafc" };
            return (
              <div key={log.id} style={{ background: "#fff", padding: "1.25rem", borderRadius: 10, marginBottom: 10, borderLeft: `4px solid ${cfg.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <strong>Week {log.week_number}</strong> — {log.student_name} ({log.student_email})
                    <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                      Company: {log.placement_company}
                    </p>
                    <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                      Submitted: {log.submitted_at?.slice(0, 10) || "Not yet"}
                      {log.resubmitted_at && ` | Resubmitted: ${log.resubmitted_at.slice(0, 10)}`}
                    </p>
                    {log.supervisor_rating && (
                      <p style={{ margin: "0.25rem 0 0", color: "#2563eb", fontSize: "0.85rem" }}>
                        Work Rating: {log.supervisor_rating}/5 | {log.supervisor_feedback}
                      </p>
                    )}
                    {log.academic_grade && (
                      <p style={{ margin: "0.25rem 0 0", color: "#16a34a", fontSize: "0.85rem" }}>
                        Academic Grade: {log.academic_grade} | {log.academic_comments}
                      </p>
                    )}
                    {log.supervisor_rejection_reason && (
                      <p style={{ margin: "0.25rem 0 0", color: "#dc2626", fontSize: "0.85rem" }}>
                        Rejected: {log.supervisor_rejection_reason}
                      </p>
                    )}
                  </div>
                  <span style={{ color: cfg.color, background: cfg.bg, padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {log.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Name", "Email", "Role", "Logs", "Placement"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const userLogs = logs.filter(l => l.student === u.id);
                const placement = placements.find(p => p.student === u.id);
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.75rem 1rem" }}>{u.first_name} {u.last_name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.85rem" }}>{u.email}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>{u.role}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
                      {u.role === "STUDENT" ? `${userLogs.length} logs` : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: placement ? "#16a34a" : "#dc2626" }}>
                      {u.role === "STUDENT" ? (placement ? placement.company_name : "Not assigned") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Placements Tab */}
      {activeTab === "placements" && (
        <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Student", "Company", "Supervisor", "Start", "End", "Logs"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placements.map(p => {
                const studentLogs = logs.filter(l => l.placement === p.id);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.75rem 1rem" }}>{getUserName(p.student)}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>{p.company_name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.85rem" }}>{getUserName(p.workplace_supervisor)}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.85rem" }}>{p.start_date}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.85rem" }}>{p.end_date}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
                      {studentLogs.length} total |
                      <span style={{ color: "#16a34a" }}> {studentLogs.filter(l => l.status === "COMPLETED").length} done</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const btn = bg => ({ padding: "0.6rem 1.2rem", background: bg, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 });