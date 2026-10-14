export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <h2>How the score is worked out</h2>
      <div className="how-grid">
        <article>
          <span className="step">01</span>
          <h3>Extract</h3>
          <p>
            The server reads the text layer of every page of your PDF. No text layer
            (a scanned image) means nothing to compare.
          </p>
        </article>
        <article>
          <span className="step">02</span>
          <h3>Match</h3>
          <p>
            Each skill in the dictionary has aliases — <code>JavaScript</code>,{" "}
            <code>JS</code>, <code>ES6</code> — and is looked for as a whole word, so
            "Java" never matches "JavaScript".
          </p>
        </article>
        <article>
          <span className="step">03</span>
          <h3>Weigh</h3>
          <p>
            Core skills carry more weight than tooling. The score is the weight of the
            job's requirements you cover divided by all of them, as a percentage.
          </p>
        </article>
      </div>
    </section>
  );
}
