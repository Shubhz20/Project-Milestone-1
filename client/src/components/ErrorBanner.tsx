import { ApiError } from "../api/client";

interface Props {
  error: unknown;
}

/**
 * Renders API errors in a consistent, a11y-friendly banner. Falls back to a
 * generic message for unexpected (non-ApiError) throws.
 */
export const ErrorBanner = ({ error }: Props) => {
  if (!error) return null;
  const message = error instanceof ApiError ? error.message : "Something went wrong.";
  const details = error instanceof ApiError && Array.isArray(error.details) ? error.details : null;

  return (
    <div role="alert" className="error-banner">
      <strong>{message}</strong>
      {details && (
        <ul>
          {details.map((d: any, i: number) => (
            <li key={i}>
              {d.field ? `${d.field}: ` : ""}
              {d.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
