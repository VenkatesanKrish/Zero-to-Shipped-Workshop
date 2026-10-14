export default function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <span className="brand-mark">0&rarr;</span>
        <span className="brand-name">
          Shipped<span className="brand-dim">/resume-parser</span>
        </span>
      </a>
      <nav className="nav-links">
        <a href="#how">How it works</a>
        <a href="#skills">Skill map</a>
        <a className="nav-cta" href="#top">
          Scan my resume
        </a>
      </nav>
    </header>
  );
}
