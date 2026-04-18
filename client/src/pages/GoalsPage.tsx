import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { goalsApi, programsApi } from "../api/endpoints";
import { Goal, Program } from "../api/types";
import { ErrorBanner } from "../components/ErrorBanner";

export const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const [programId, setProgramId] = useState("");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("reps");
  const [submitting, setSubmitting] = useState(false);

  const programById = useMemo(
    () => Object.fromEntries(programs.map((p) => [p._id, p])),
    [programs]
  );

  const refresh = useCallback(async () => {
    try {
      const [g, p] = await Promise.all([goalsApi.list(), programsApi.list()]);
      setGoals(g);
      setPrograms(p);
      if (!programId && p.length > 0) setProgramId(p[0]._id);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!programId) {
      setError(new Error("Create a program before adding goals."));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await goalsApi.create({
        programId,
        title,
        targetValue: Number(targetValue),
        unit,
      });
      setTitle("");
      setTargetValue("");
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const onAchieve = async (id: string) => {
    try {
      await goalsApi.markAchieved(id);
      await refresh();
    } catch (err) {
      setError(err);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await goalsApi.remove(id);
      await refresh();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <h1>Goals</h1>
        <p className="muted">Set measurable targets inside your programs.</p>
      </header>

      <ErrorBanner error={error} />

      <form onSubmit={onCreate} className="form-grid">
        <label>
          Program
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a program…
            </option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bench press 80kg"
            required
            minLength={2}
          />
        </label>
        <label>
          Target value
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            min={0}
            required
          />
        </label>
        <label>
          Unit
          <input value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Add goal"}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading goals…</p>
      ) : goals.length === 0 ? (
        <p className="muted">No goals yet.</p>
      ) : (
        <ul className="card-list">
          {goals.map((g) => (
            <li key={g._id} className={`card ${g.isAchieved ? "achieved" : ""}`}>
              <div>
                <h3>
                  {g.title}{" "}
                  {g.isAchieved && <span className="chip chip-success">Achieved</span>}
                </h3>
                <p className="muted">
                  {g.currentValue} / {g.targetValue} {g.unit} ·{" "}
                  {programById[g.programId]?.name ?? "Unknown program"}
                </p>
              </div>
              <div className="btn-row">
                {!g.isAchieved && (
                  <button className="btn-ghost" onClick={() => onAchieve(g._id)}>
                    Mark achieved
                  </button>
                )}
                <button className="btn-danger" onClick={() => onDelete(g._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
