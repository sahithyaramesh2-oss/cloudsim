function AboutPage() {
  return (
    <div className="page stack-lg">
      <section className="section-heading reveal-up">
        <p className="eyebrow">Project Context</p>
        <h1>About This Frontend</h1>
        <p>
          This interface is designed to make your CloudSim codebase easier to demo,
          explain, and extend. It mirrors the structure of simulator logic while
          keeping navigation simple for first-time users.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-card reveal-delay-1">
          <h2>Why React</h2>
          <p>
            React with route-based pages enables modular growth when you add charting,
            API integration, or simulation result viewers.
          </p>
        </article>
        <article className="about-card reveal-delay-2">
          <h2>Design Direction</h2>
          <p>
            The visual language leans technical and editorial: bold typography,
            layered gradients, and high-contrast cards without generic template feel.
          </p>
        </article>
      </section>
    </div>
  );
}

export default AboutPage;
