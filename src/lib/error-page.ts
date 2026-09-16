/**
 * Generates a generic error page HTML for server-side errors
 */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        color: #333;
        display: grid;
        place-items: center;
        min-height: 100vh;
        padding: 1.5rem;
      }
      .card {
        max-width: 28rem;
        width: 100%;
        text-align: center;
        padding: 2.5rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }
      h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: #1f2937;
      }
      p {
        color: #6b7280;
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      button, a {
        padding: 0.625rem 1.25rem;
        border-radius: 0.5rem;
        font: inherit;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid transparent;
        font-weight: 500;
        transition: all 0.2s;
      }
      .primary {
        background: #1f2937;
        color: white;
      }
      .primary:hover {
        background: #111827;
        transform: translateY(-1px);
      }
      .secondary {
        background: white;
        color: #1f2937;
        border-color: #d1d5db;
      }
      .secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>💥 Something went wrong</h1>
      <p>We encountered an unexpected error while loading this page. This has been logged, and our team will look into it.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
