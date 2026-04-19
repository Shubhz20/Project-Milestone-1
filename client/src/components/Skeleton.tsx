interface Props {
  /** Pixel height. Default 14. */
  height?: number;
  /** CSS width (e.g. "40%" or "120px"). Default "100%". */
  width?: string;
  /** Optional class name passthrough. */
  className?: string;
  /** Rounded corners radius. */
  radius?: number;
}

/**
 * Lightweight shimmer placeholder — used anywhere we'd otherwise show a
 * plain "Loading…" string. The pulse animation is driven by CSS in
 * styles.css under `.skeleton`.
 */
export const Skeleton = ({
  height = 14,
  width = "100%",
  radius = 6,
  className = "",
}: Props) => (
  <div
    className={`skeleton ${className}`}
    style={{
      height,
      width,
      borderRadius: radius,
    }}
    aria-hidden="true"
  />
);

export const SkeletonBlock = ({ rows = 3 }: { rows?: number }) => (
  <div className="skeleton-stack">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} height={18} width={i % 2 === 0 ? "100%" : "70%"} />
    ))}
  </div>
);
