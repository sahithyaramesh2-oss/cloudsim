import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/simulator", label: "Simulator" },
  { to: "/datasets", label: "Datasets" },
  { to: "/about", label: "About" }
];

function NavBar() {
  return (
    <header className="top-nav">
      <NavLink to="/" className="brand">
        <span className="brand-mark">CL</span>
        <span className="brand-copy">
          <strong>CloudSim Lab</strong>
          <small>Model. Simulate. Compare.</small>
        </span>
      </NavLink>
      <nav className="nav-links" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default NavBar;
