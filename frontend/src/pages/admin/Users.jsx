import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { fetchUsers, registerUser, deleteUser } from "../../services/userService";
import { fetchPlacements, createPlacement } from "../../services/placementService";
import { fetchCriteria, submitCriteria } from "../../services/evaluationService";

const roleColor = {
  STUDENT: "#2563eb",
  WORKPLACE_SUPERVISOR: "#7c3aed",
  ACADEMIC_SUPERVISOR: "#0891b2",
  ADMIN: "#dc2626"
};

const roleLabel = {
  STUDENT: "Student",
  WORKPLACE_SUPERVISOR: "Workplace Supervisor",
  ACADEMIC_SUPERVISOR: "Academic Supervisor",
  ADMIN: "Admin"
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showPlacementForm, setShowPlacementForm] = useState(false);
  const [form, setForm] = useState({
    email: "", first_name: "", last_name: "", role: "STUDENT", password: ""
  });
  const [placementForm, setPlacementForm] = useState({
    student: "", workplace_supervisor: "", company_name: "", start_date: "", end_date: ""
  });
  const [criteriaForm, setCriteriaForm] = useState([
    { name: "Technical Skills", weight: 40 },
    { name: "Communication", weight: 30 },
    { name: "Professionalism", weight: 30 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [placementSubmitting, setPlacementSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placementError, setPlacementError] = useState("");
  const [success, setSuccess] = useState("");
  const [newUserId, setNewUserId] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchPlacements(), fetchCriteria()])
      .then(([u, p, c]) => {
        setUsers(u);
        setPlacements(p);
        setCriteria(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const students = users.filter(u => u.role === "STUDENT");
  const supervisors = users.filter(u => u.role === "WORKPLACE_SUPERVISOR");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePlacementChange = e => setPlacementForm({ ...placementForm, [e.target.name]: e.target.value });

  const handleCriteriaChange = (index, field, value) => {
    const updated = [...criteriaForm];
    updated[index][field] = value;
    setCriteriaForm(updated);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const newUser = await registerUser(form);
      setUsers(prev => [...prev, newUser]);
      setNewUserId(newUser.id);

      if (form.role === "STUDENT") {
        setPlacementForm(prev => ({ ...prev, student: newUser.id }));
        setStep(2);
      } else if (form.role === "ACADEMIC_SUPERVISOR") {
        setStep(3);
      } else {
        setSuccess(`User ${form.email} created successfully.`);
        setShowForm(false);
        setStep(1);
      }
    } catch (err) {
      const errors = err.response?.data;
      setError(typeof errors === "object" ? JSON.stringify(errors) : "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    setPlacementError(""); setPlacementSubmitting(true);
    try {
      const newP = await createPlacement(placementForm);
      setPlacements(prev => [...prev, newP]);
      setSuccess("User and placement created successfully.");
      setShowForm(false);
      setStep(1);
      setForm({ email: "", first_name: "", last_name: "", role: "STUDENT", password: "" });
      setPlacementForm({ student: "", workplace_supervisor: "", company_name: "", start_date: "", end_date: "" });
    } catch (err) {
      const errors = err.response?.data;
      setPlacementError(typeof errors === "object" ? JSON.stringify(errors) : "Failed to create placement.");
    } finally {
      setPlacementSubmitting(false);
    }
  };

  const handleCriteriaSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      for (const c of criteriaForm) {
        await submitCriteria({ name: c.name, weight: c.weight, is_active: true });
      }
      const updated = await fetchCriteria();
      setCriteria(updated);
      setSuccess("Academic supervisor and evaluation criteria created successfully.");
      setShowForm(false);
      setStep(1);
      setForm({ email: "", first_name: "", last_name: "", role: "STUDENT", password: "" });
    } catch (err) {
      setError("Failed to save criteria.");
    } finally {
      setSubmitting(false);
    }
  };

  const openPlacementForm = (studentId) => {
    setPlacementForm(prev => ({ ...prev, student: studentId }));
    setShowPlacementForm(true);
    setPlacementError("");
  };

  const handlePlacementOnly = async (e) => {
    e.preventDefault();
    setPlacementError(""); setPlacementSubmitting(true);
    try {
      const newP = await createPlacement(placementForm);
      setPlacements(prev => [...prev, newP]);
      setSuccess("Placement created successfully.");
      setShowPlacementForm(false);
      setPlacementForm({ student: "", workplace_supervisor: "", company_name: "", start_date: "", end_date: "" });
    } catch (err) {
      const errors = err.response?.data;
      setPlacementError(typeof errors === "object" ? JSON.stringify(errors) : "Failed to create placement.");
    } finally {
      setPlacementSubmitting(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete user.");
    }
  };

  const getStudentPlacement = (studentId) => placements.find(p => p.student === studentId);
  const filtered = filter === "all" ? users : users.filter(u => u.role === filter);

  return (
    <Layout title="Manage Users">
      {success && <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: "1rem" }}>{success}</p>}
      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "STUDENT", "WORKPLACE_SUPERVISOR", "ACADEMIC_SUPERVISOR", "ADMIN"].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ padding: "0.4rem 0.9rem", borderRadius: 6, border: "1px solid #cbd5e1", background: filter === r ? "#2563eb" : "#fff", color: filter === r ? "#fff" : "#1e293b", cursor: "pointer", fontSize: "0.85rem" }}>
              {r === "all" ? "All" : roleLabel[r]}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(!showForm); setStep(1); setError(""); setSuccess(""); }}
          style={{ padding: "0.4rem 1rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15 }}>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
            {["1. User Details",
              form.role === "STUDENT" ? "2. Placement" : "2. Criteria"
            ].map((label, i) => (
              <div key={i} style={{
                padding: "0.4rem 0.9rem", borderRadius: 20, fontSize: "0.85rem", fontWeight: 600,
                background: step === i + 1 ? "#2563eb" : step > i + 1 ? "#16a34a" : "#f1f5f9",
                color: step >= i + 1 ? "#fff" : "#64748b"
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Step 1 - User details */}
          {step === 1 && (
            <>
              <h3 style={{ marginTop: 0 }}>
                Create New User
                {form.role === "STUDENT" && <span style={{ color: "#d97706", fontSize: "0.85rem", fontWeight: 400, marginLeft: 8 }}>— Placement required in next step</span>}
                {form.role === "ACADEMIC_SUPERVISOR" && <span style={{ color: "#0891b2", fontSize: "0.85rem", fontWeight: 400, marginLeft: 8 }}>— Evaluation criteria required in next step</span>}
              </h3>
              <form onSubmit={handleAdd}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <div>
                    <label style={lbl}>First Name</label>
                    <input name="first_name" value={form.first_name} onChange={handleChange} required style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Last Name</label>
                    <input name="last_name" value={form.last_name} onChange={handleChange} required style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Role</label>
                    <select name="role" value={form.role} onChange={handleChange} style={inp}>
                      <option value="STUDENT">Student</option>
                      <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
                      <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  style={{ marginTop: 15, padding: "0.6rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {submitting ? "Creating..." : form.role === "STUDENT" ? "Next: Set Placement →" : form.role === "ACADEMIC_SUPERVISOR" ? "Next: Set Criteria →" : "Create User"}
                </button>
              </form>
            </>
          )}

          {/* Step 2 - Placement for student */}
          {step === 2 && form.role === "STUDENT" && (
            <>
              <h3 style={{ marginTop: 0 }}>Assign Placement <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>*Required</span></h3>
              {placementError && <p style={{ color: "red" }}>{placementError}</p>}
              <form onSubmit={handlePlacementSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <div>
                    <label style={lbl}>Workplace Supervisor</label>
                    <select name="workplace_supervisor" value={placementForm.workplace_supervisor} onChange={handlePlacementChange} required style={inp}>
                      <option value="">-- Select supervisor --</option>
                      {supervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Company Name</label>
                    <input name="company_name" value={placementForm.company_name} onChange={handlePlacementChange} required style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Start Date</label>
                    <input name="start_date" type="date" value={placementForm.start_date} onChange={handlePlacementChange} required style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>End Date</label>
                    <input name="end_date" type="date" value={placementForm.end_date} onChange={handlePlacementChange} required style={inp} />
                  </div>
                </div>
                <button type="submit" disabled={placementSubmitting}
                  style={{ marginTop: 15, padding: "0.6rem 1.5rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {placementSubmitting ? "Saving..." : "Create User & Placement"}
                </button>
              </form>
            </>
          )}

          {/* Step 3 - Criteria for academic supervisor */}
          {step === 3 && form.role === "ACADEMIC_SUPERVISOR" && (
            <>
              <h3 style={{ marginTop: 0 }}>Set Evaluation Criteria <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>*Required</span></h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem" }}>These criteria will be used to evaluate student logs. Weights must add up to 100.</p>
              <form onSubmit={handleCriteriaSubmit}>
                {criteriaForm.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={lbl}>Criterion Name</label>
                      <input value={c.name} onChange={e => handleCriteriaChange(i, "name", e.target.value)} required style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>Weight (%)</label>
                      <input type="number" value={c.weight} onChange={e => handleCriteriaChange(i, "weight", e.target.value)} required style={inp} />
                    </div>
                  </div>
                ))}
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  Total: <strong style={{ color: criteriaForm.reduce((s, c) => s + Number(c.weight), 0) === 100 ? "#16a34a" : "#dc2626" }}>
                    {criteriaForm.reduce((s, c) => s + Number(c.weight), 0)}%
                  </strong> (must be 100%)
                </p>
                <button type="submit" disabled={submitting || criteriaForm.reduce((s, c) => s + Number(c.weight), 0) !== 100}
                  style={{ marginTop: 10, padding: "0.6rem 1.5rem", background: "#0891b2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {submitting ? "Saving..." : "Finish & Save"}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Placement form for existing students */}
      {showPlacementForm && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 10, marginBottom: 15, borderLeft: "4px solid #2563eb" }}>
          <h3 style={{ marginTop: 0 }}>Assign Placement</h3>
          {placementError && <p style={{ color: "red" }}>{placementError}</p>}
          <form onSubmit={handlePlacementOnly}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
              <div>
                <label style={lbl}>Student</label>
                <select name="student" value={placementForm.student} onChange={handlePlacementChange} required style={inp}>
                  <option value="">-- Select student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Workplace Supervisor</label>
                <select name="workplace_supervisor" value={placementForm.workplace_supervisor} onChange={handlePlacementChange} required style={inp}>
                  <option value="">-- Select supervisor --</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Company Name</label>
                <input name="company_name" value={placementForm.company_name} onChange={handlePlacementChange} required style={inp} />
              </div>
              <div>
                <label style={lbl}>Start Date</label>
                <input name="start_date" type="date" value={placementForm.start_date} onChange={handlePlacementChange} required style={inp} />
              </div>
              <div>
                <label style={lbl}>End Date</label>
                <input name="end_date" type="date" value={placementForm.end_date} onChange={handlePlacementChange} required style={inp} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button type="submit" disabled={placementSubmitting}
                style={{ padding: "0.6rem 1.5rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {placementSubmitting ? "Saving..." : "Save Placement"}
              </button>
              <button type="button" onClick={() => setShowPlacementForm(false)}
                style={{ padding: "0.6rem 1.5rem", background: "#fff", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p>Loading...</p>}
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Name", "Email", "Role", "Placement", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.85rem", color: "#64748b" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const placement = getStudentPlacement(u.id);
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>{u.first_name} {u.last_name}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ background: (roleColor[u.role] || "#64748b") + "20", color: roleColor[u.role] || "#64748b", padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600 }}>
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
                    {u.role === "STUDENT" ? (
                      placement
                        ? <span style={{ color: "#16a34a" }}>{placement.company_name}</span>
                        : <span style={{ color: "#dc2626", fontWeight: 600 }}>Not assigned</span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {u.role === "STUDENT" && (
                        <button onClick={() => openPlacementForm(u.id)}
                          style={{ padding: "0.3rem 0.7rem", background: placement ? "#7c3aed" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}>
                          {placement ? "Update Placement" : "Assign Placement"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(u.id, u.email)}
                        style={{ padding: "0.3rem 0.7rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const lbl = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" };
const inp = { display: "block", width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" };