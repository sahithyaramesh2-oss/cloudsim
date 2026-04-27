const datasets = [
  {
    group: "PlanetLab 20110303",
    notes: "Contains multiple workload files such as surfsnel, rnp_dcc, and oneswarm traces."
  },
  {
    group: "PlanetLab 20110306",
    notes: "Good checkpoint for testing policy sensitivity with similar network-era usage patterns."
  },
  {
    group: "PlanetLab 20110420",
    notes: "Useful for late-series comparisons and trend stability checks over historical windows."
  }
];

function DatasetsPage() {
  return (
    <div className="page stack-lg">
      <section className="section-heading reveal-up">
        <p className="eyebrow">Data Navigation</p>
        <h1>Datasets</h1>
        <p>
          PlanetLab traces are central to realistic CPU utilization modeling. Start
          here before launching simulations.
        </p>
      </section>

      <section className="dataset-list">
        {datasets.map((dataset, idx) => (
          <article key={dataset.group} className={`dataset-card reveal-delay-${idx + 1}`}>
            <h2>{dataset.group}</h2>
            <p>{dataset.notes}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default DatasetsPage;
