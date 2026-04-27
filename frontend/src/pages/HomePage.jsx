import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Scheduler Experiments",
    text: "Run comparative tests for space-shared, time-shared, and dynamic workload schedulers with consistent inputs."
  },
  {
    title: "PlanetLab Profiles",
    text: "Explore real traces from historical PlanetLab workloads and test allocation policy behavior under pressure."
  },
  {
    title: "Publication-Ready Outputs",
    text: "Generate repeatable scenarios and summarize key metrics for reports, classes, and research artifacts."
  }
];

const stats = [
  { value: "30+", label: "CloudSim Core Classes" },
  { value: "10+", label: "Trace Date Sets" },
  { value: "4", label: "Primary User Flows" }
];

function HomePage() {
  return (
    <div className="page stack-lg">
      <section className="hero reveal-up">
        <div className="hero-copy">
          <p className="eyebrow">Cloud Infrastructure Simulation</p>
          <h1>Design cloud experiments that feel clear, fast, and reproducible.</h1>
          <p>
            This React frontend wraps your CloudSim project with practical pages for
            scenario planning, dataset navigation, and newcomer onboarding.
          </p>
          <div className="hero-actions">
            <Link to="/simulator" className="btn btn-primary">
              Open Simulator Flow
            </Link>
            <Link to="/datasets" className="btn btn-muted">
              Browse Datasets
            </Link>
          </div>
        </div>
        <aside className="hero-panel reveal-delay-1">
          <h2>Quick Start Focus</h2>
          <ul>
            <li>Pick a VM allocation policy</li>
            <li>Load workload traces</li>
            <li>Run and compare utilization curves</li>
          </ul>
          <p className="mono">Research-oriented UX, now with cleaner flow.</p>
        </aside>
      </section>

      <section className="stats-grid reveal-delay-2">
        {stats.map((item) => (
          <article key={item.label} className="stat-card">
            <p className="stat-value">{item.value}</p>
            <p className="stat-label">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="card-grid">
        {highlights.map((item, idx) => (
          <article key={item.title} className={`feature-card reveal-delay-${idx + 1}`}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
