export async function fetchSimulators() {
  const response = await fetch("/api/simulators");
  if (!response.ok) {
    throw new Error("Failed to load simulators");
  }
  return response.json();
}

export async function runSimulation(payload) {
  const response = await fetch("/api/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.detail?.message || body?.detail || "Simulation request failed";
    throw new Error(typeof message === "string" ? message : "Simulation request failed");
  }

  return response.json();
}
