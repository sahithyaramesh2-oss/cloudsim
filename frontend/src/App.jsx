import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import SimulatorPage from "./pages/SimulatorPage";
import DatasetsPage from "./pages/DatasetsPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <div className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
