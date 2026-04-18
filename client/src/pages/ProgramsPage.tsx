import { FormEvent, useCallback, useEffect, useState } from "react";
import { programsApi } from "../api/endpoints";
import { PROGRAM_CATEGORIES, Program } from "../api/types";
import { ErrorBanner } from "../components/ErrorBanner";

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<typeof PROGRAM_CATEGORIES[number]>("general");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setPrograms(await programsApi.list());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await programsApi.create({ name, description: description || undefined, category });
      setName("");
      setDescription("");
      setCategory("general");
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this program? Associated goals will remain.")) return;
    try {
      await programsApi.remove(id);
      await refresh();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <h1>Programs</h1>
        <p className="muted">Group related workouts into focused programs.</p>
      </header>

      <ErrorBanner error={error} />

      <form onSubmit={onCreate} className="form-grid">
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marathon training"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {PROGRAM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="span-2">
          Description (optional)
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Add program"}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading programs…</p>
      ) : programs.length === 0 ? (
        <p className="muted">No programs yet — create one above.</p>
      ) : (
        <ul className="card-list">
          {programs.map((p) => (
            <li key={p._id} className="card">
              <div>
                <h3>{p.name}</h3>
                <p className="muted">
                  <span className="chip">{p.category}</span>
                  {p.description && <> · {p.description}</>}
                </p>
              </div>
              <button className="btn-danger" onClick={() => onDelete(p._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
