import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { fetchUsers } from "../../services/userService";

const roleColor = { student: "#2563eb", supervisor: "#7c3aed", academic: "#0891b2", admin: "#dc2626" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? users : users.filter(u => u.role === filter);

  return (
    <Layout title="Manage Users">
      <div style={{ marginBottom: "1rem", display: "flex", gap: 8 }}>
        {["all", "student", "supervisor", "academic", "admin"].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ padding: "0.4rem 0.9rem", borderRadius: 6, border: "1px solid #cbd5e1", background: filter === r ? "#2563eb" : "#fff", color: filter === r ? "#fff" : "#1e293b", cursor: "pointer", textTransform: "capitalize" }}>
            {r}
          </button>
        ))}
      </div>

      {loading && <p>Loading users...</p>}
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Name", "Username", "Email", "Role"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "#64748b" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.75rem 1rem" }}>{u.full_name}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{u.username}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ background: roleColor[u.role] + "20", color: roleColor[u.role], padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, textTransform: "capitalize" }}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}