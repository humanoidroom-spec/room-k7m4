import { project } from "../data/project";
import { Arrow, ResearchMedia } from "../components/Primitives";

function SignalDiagram() {
  return (
    <div
      className="hero-signal-system"
      aria-label="Human gaze, gesture and body behavior inform what, when and how the humanoid responds. Conceptual interaction diagram."
    >
      <div className="system-eyebrow">
        <span>HUMAN BEHAVIOR</span>
        <span>ROBOT RESPONSE</span>
      </div>
      <div className="signal-routing">
        <div className="signal-inputs">
          {["Gaze", "Gesture", "Body"].map((signal, index) => (
            <div key={signal}>
              <span>0{index + 1}</span>
              <strong>{signal}</strong>
              <i aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="signal-junction" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="signal-core">
          <span className="core-mark">R</span>
          <span>ROOM</span>
        </div>
        <div className="signal-output">
          <Arrow />
          <span>Action</span>
        </div>
      </div>
      <div className="signal-decisions">
        <span>WHAT</span>
        <span>WHEN</span>
        <span>HOW</span>
      </div>
      <p>
        From seeing a person
        <br />
        to understanding their intention.
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="overview">
      <div className="hero-intro wrap">
        <div className="eyebrow">
          <span className="edition-line" />
          HUMAN–HUMANOID INTERACTION <span>DATASET & BENCHMARK</span>
        </div>
        <div className="hero-heading">
          <div className="hero-title-block">
            <h1>
              Can humanoids
              <br />
              read the <em>room?</em>
            </h1>
            <p className="hero-deck">
              Human gaze. Human gesture. Human posture.
              <br />
              <strong>Grounded in robot action.</strong>
            </p>
            <div className="hero-actions">
              <a
                className="button primary"
                href="#tasks"
              >
                Explore interactions <Arrow diagonal />
              </a>
              <a className="text-link hero-explore" href="#experiments">
                View the benchmark <Arrow />
              </a>
            </div>
          </div>
          <SignalDiagram />
        </div>
      </div>
      <div className="hero-evidence wrap">
        <div className="evidence-rule">
          <span>01 / A SHARED SPACE</span>
          <span>REAL HUMAN–HUMANOID INTERACTIONS</span>
          <span>ROOM DATASET</span>
        </div>
        <div className="hero-visual">
          <ResearchMedia
            name={project.media.hero}
            poster={project.media.heroPoster}
            alt="Real ROOM experiments: a human and Unitree G1 collaborate on object handover, cart manipulation and tabletop interaction in a home environment."
            eager
          />
          <div className="hero-visual-top">
            <span>FIELD OBSERVATIONS</span>
            <span>UNITREE G1 · HUMAN IN THE LOOP</span>
          </div>
          <div className="hero-visual-bottom">
            <span className="scene-caption">
              A shared space.
              <br />
              <strong>A shared understanding.</strong>
            </span>
            <span className="source-stamp">EXPERIMENT SCENES · FIG. 01</span>
          </div>
        </div>
      </div>
      <div className="hero-bottom wrap">
        <div className="hero-release-links">
          <a href={project.links.dataset ?? "#resources"}>
            Dataset{" "}
            <span>{project.links.dataset ? "Explore" : "Coming soon"}</span>
            <Arrow diagonal />
          </a>
          <a href={project.links.code ?? "#resources"}>
            Code <span>{project.links.code ? "Explore" : "Coming soon"}</span>
            <Arrow diagonal />
          </a>
        </div>
        <a href="#why" aria-label="Scroll to why ROOM">
          <span>BEYOND TASK EXECUTION</span>
          <span className="down-arrow">↓</span>
        </a>
      </div>
    </section>
  );
}
