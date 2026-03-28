import React from "react";

export default function StoreFeedback({ error, feedback }) {
  if (!error && !feedback) return null;

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          style={{
            backgroundColor: "var(--usercard-bg)",
            borderColor: "var(--usercard-border)",
            color: "var(--sidebar)",
          }}>
          {error}
        </div>
      )}

      {feedback && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          style={{
            backgroundColor: "var(--dash-title-bg)",
            borderColor: "var(--usercard-border)",
            color: "var(--dash-title-text)",
          }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
