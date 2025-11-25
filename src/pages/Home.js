import React from "react";

function Home() {
  return (
    <div className="app-layout">
      <header className="page-header">
        <div className="page-header__content">
          <h1>Obey the Bell</h1>
          <p>
            Plan with intention, prioritise with clarity, and run your sessions
            without breaking flow. Sign in to sync tasks, journals, and goals
            across every screen.
          </p>
        </div>
        <div className="page-header__aside">
          <span className="pill">Productivity cockpit</span>
        </div>
      </header>

      <section className="page-section page-section--subtle">
        <div className="stack stack--dense">
          <h2>What’s inside</h2>
          <ul className="stack stack--dense" style={{ margin: 0, listStyle: "none" }}>
            <li>
              ✓ <strong>To Do</strong> – build focused Pomodoro runs and keep a tidy backlog.
            </li>
            <li>
              ✓ <strong>Priority matrix</strong> – drag tasks into Eisenhower quadrants for fast triage.
            </li>
            <li>
              ✓ <strong>Run mode</strong> – launch the bell, glide through cycles, and celebrate completion.
            </li>
            <li>
              ✓ <strong>Journals & calendar</strong> – reflect, plan, and keep your streak alive.
            </li>
          </ul>
          <p className="muted">
            Create an account or sign in with Google to load your existing Firebase workspace.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
