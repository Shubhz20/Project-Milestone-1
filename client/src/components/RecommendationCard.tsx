import { ProgramRecommendation } from "../api/types";

interface Props {
  rec: ProgramRecommendation;
  /** Disable the action while a network request is in-flight. */
  busy?: boolean;
  /** Called when the user wants to instantiate this template as a real program. */
  onAdopt?: (templateKey: string) => void;
  /** True if a program with this template's name already exists. */
  alreadyAdopted?: boolean;
}

const intensityColor = {
  low: "rgba(52, 211, 153, 0.15)",
  moderate: "rgba(56, 189, 248, 0.15)",
  high: "rgba(244, 114, 182, 0.18)",
};

export const RecommendationCard = ({
  rec,
  busy,
  onAdopt,
  alreadyAdopted,
}: Props) => {
  const { template: t, score, rationale, estimatedCaloriesPerSession } = rec;
  return (
    <article
      className="reco-card"
      style={{
        background: intensityColor[t.intensity] ?? "rgba(255,255,255,0.04)",
      }}
    >
      <header className="reco-card-head">
        <div>
          <h3>{t.name}</h3>
          <p className="muted reco-meta">
            <span className="chip">{t.category}</span>
            <span className="chip">{t.intensity} intensity</span>
            <span className="chip">min level: {t.minLevel}</span>
            <span className="chip">{t.suggestedMinutes}-min sessions</span>
          </p>
        </div>
        <div className="reco-score" title="Personalised match score (0–100)">
          <strong>{score}</strong>
          <span>/100</span>
        </div>
      </header>
      <p>{t.description}</p>

      <div className="reco-insight">
        <strong>~{estimatedCaloriesPerSession} kcal</strong> estimated per
        session at your current weight.
      </div>

      {rationale.length > 0 && (
        <details className="reco-rationale">
          <summary>Why we suggest this</summary>
          <ul>
            {rationale.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </details>
      )}

      {onAdopt && (
        <div className="btn-row">
          <button
            className="btn-primary"
            disabled={busy || alreadyAdopted}
            onClick={() => onAdopt(t.key)}
          >
            {alreadyAdopted
              ? "Already in your programs"
              : busy
              ? "Adding…"
              : "Add to my programs"}
          </button>
        </div>
      )}
    </article>
  );
};
