import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { programsApi, workoutsApi } from "../api/endpoints";
import { Program, WorkoutSession } from "../api/types";
import { ErrorBanner } from "../components/ErrorBanner";

const fmtDuration = (minutes?: number) => {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const WorkoutsPage = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [programId, setProgramId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const programById = useMemo(
    () => Object.fromEntries(programs.map((p) => [p._id, p])),
    [programs]
  );

  const active = useMemo(() => sessions.find((s) => !s.endTime), [sessions]);

  const refresh = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([workoutsApi.list(), programsApi.list()]);
      setSessions(s);
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

  const onStart = async (e: FormEvent) => {
    e.preventDefault();
    if (!programId) return;
    setBusy(true);
    setError(null);
    try {
      await workoutsApi.start(programId, notes || undefined);
      setNotes("");
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const onEnd = async (id: string) => {
    setBusy(true);
    try {
      await workoutsApi.end(id);
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <h1>Workouts</h1>
        <p className="muted">Start a session, stop when you're done, and review your history.</p>
      </header>

      <ErrorBanner error={error} />

      {active ? (
        <div className="card active-session">
          <div>
            <h3>Active session · {programById[active.programId]?.name ?? "program"}</h3>
            <p className="muted">Started {new Date(active.startTime).toLocaleString()}</p>
          </div>
          <button className="btn-primary" disabled={busy} onClick={() => onEnd(active._id)}>
            {busy ? "Ending…" : "End workout"}
          </button>
        </div>
      ) : (
        <form onSubmit={onStart} className="form-grid">
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
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            Notes (optional)
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Felt strong today…"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={busy || programs.length === 0}>
            Start workout
          </button>
        </form>
      )}

      <h2>History</h2>
      {loading ? (
        <p className="muted">Loading history…</p>
      ) : sessions.filter((s) => s.endTime).length === 0 ? (
        <p className="muted">No completed sessions yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Program</th>
              <th>Duration</th>
              <th>Calories</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sessions
              .filter((s) => s.endTime)
              .map((s) => (
                <tr key={s._id}>
                  <td>{new Date(s.startTime).toLocaleDateString()}</td>
                  <td>{programById[s.programId]?.name ?? "—"}</td>
                  <td>{fmtDuration(s.durationMinutes)}</td>
                  <td>{s.caloriesBurned ?? "—"}</td>
                  <td className="muted">{s.notes ?? ""}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
