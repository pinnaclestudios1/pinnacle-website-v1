"use client";

/**
 * Last-resort error boundary (replaces the root layout), so it must be self-contained.
 * Used for maintenance-style failures: "The Dot is fixing the mountain".
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f1e7",
          color: "#1e1e1e",
          fontFamily: "Georgia, serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ff5b27",
              marginBottom: "2rem",
            }}
          />
          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 400,
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            The Dot is fixing the mountain.
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", color: "#5e5e5c", lineHeight: 1.6 }}>
            We&rsquo;ll be back at the summit shortly.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              height: 48,
              padding: "0 1.5rem",
              border: 0,
              borderRadius: 8,
              background: "#ff5b27",
              color: "#1e1e1e",
              fontWeight: 500,
              fontFamily: "system-ui, sans-serif",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
