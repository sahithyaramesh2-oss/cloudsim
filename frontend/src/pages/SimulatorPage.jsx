import { useEffect, useMemo, useState } from "react";
import { fetchSimulators, runSimulation } from "../api/simulatorApi";

function SimulatorPage() {
  const [simulators, setSimulators] = useState([]);
  const [selectedId, setSelectedId] = useState("sgpfs-final");
  const [lengthInput, setLengthInput] = useState("5000,10000,20000,30000,40000");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [runError, setRunError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSimulators();
        setSimulators(data);
        if (data.length > 0 && !data.some((item) => item.id === selectedId)) {
          setSelectedId(data[0].id);
        }
      } catch (error) {
        setLoadError(error.message || "Unable to fetch simulator options.");
      }
    }

    load();
  }, [selectedId]);

  const selectedSimulator = useMemo(
    () => simulators.find((item) => item.id === selectedId) || null,
    [simulators, selectedId]
  );

  function parseLengths(raw) {
    return raw
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  async function handleRun(event) {
    event.preventDefault();
    setRunError("");
    setLoading(true);

    try {
      const payload = { simulator_id: selectedId };
      if (selectedSimulator?.supports_custom_lengths) {
        const lengths = parseLengths(lengthInput);
        if (lengths.length === 0) {
          throw new Error("Provide at least one positive cloudlet length.");
        }
        payload.cloudlet_lengths = lengths;
      }

      const data = await runSimulation(payload);
      setResult(data);
    } catch (error) {
      setRunError(error.message || "Simulation failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page stack-lg">
      <section className="section-heading reveal-up">
        <p className="eyebrow">Workflow Page</p>
        <h1>Real Simulator Runner</h1>
        <p>
          Execute real Java CloudSim classes through the backend and inspect parsed
          cloudlet metrics from actual simulator output.
        </p>
      </section>

      <section className="runner-card reveal-delay-1">
        <form className="sim-form" onSubmit={handleRun}>
          <label htmlFor="simulator">Simulator Class</label>
          <select
            id="simulator"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {simulators.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {selectedSimulator?.supports_custom_lengths && (
            <>
              <label htmlFor="lengths">Cloudlet Lengths (comma separated)</label>
              <input
                id="lengths"
                value={lengthInput}
                onChange={(event) => setLengthInput(event.target.value)}
                placeholder="5000,10000,20000,30000,40000"
              />
            </>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading || !selectedSimulator}>
            {loading ? "Running..." : "Run Simulation"}
          </button>

          {loadError && <p className="error-text">{loadError}</p>}
          {runError && <p className="error-text">{runError}</p>}
        </form>
      </section>

      {result && (
        <>
          <section className="stats-grid reveal-delay-2">
            <article className="stat-card">
              <p className="stat-value">{result.summary.total_cloudlets}</p>
              <p className="stat-label">Total Cloudlets</p>
            </article>
            <article className="stat-card">
              <p className="stat-value">{result.summary.finished_cloudlets}</p>
              <p className="stat-label">Finished Cloudlets</p>
            </article>
            <article className="stat-card">
              <p className="stat-value">{result.summary.makespan}</p>
              <p className="stat-label">Makespan</p>
            </article>
          </section>

          {result.schedule_order.length > 0 && (
            <section className="dataset-card reveal-delay-3">
              <h2>SGPFS Scheduling Order</h2>
              <div className="table-wrap">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Cloudlet ID</th>
                      <th>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule_order.map((entry) => (
                      <tr key={`${entry.cloudlet_id}-${entry.length}`}>
                        <td>{entry.cloudlet_id}</td>
                        <td>{entry.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="dataset-card reveal-delay-3">
            <h2>Cloudlet Execution Results</h2>
            <div className="table-wrap">
              <table className="result-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>DC ID</th>
                    <th>VM ID</th>
                    <th>CPU Time</th>
                    <th>Start</th>
                    <th>Finish</th>
                    <th>Length</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cloudlets.map((cloudlet) => (
                    <tr key={`${cloudlet.cloudlet_id}-${cloudlet.start_time}-${cloudlet.finish_time}`}>
                      <td>{cloudlet.cloudlet_id}</td>
                      <td>{cloudlet.status}</td>
                      <td>{cloudlet.datacenter_id ?? "-"}</td>
                      <td>{cloudlet.vm_id ?? "-"}</td>
                      <td>{cloudlet.cpu_time ?? "-"}</td>
                      <td>{cloudlet.start_time ?? "-"}</td>
                      <td>{cloudlet.finish_time ?? "-"}</td>
                      <td>{cloudlet.length ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dataset-card reveal-delay-3">
            <h2>Raw Console Output</h2>
            <pre className="output-block">{result.raw_output}</pre>
          </section>
        </>
      )}
    </div>
  );
}

export default SimulatorPage;
