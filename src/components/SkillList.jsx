/** One list of skills, as chips.
 *
 *  `variant` is "ok" or "miss" and drives the styling; missing chips also
 *  carry their weight, so the learner can see what to chase first. */
export default function SkillList({ title, variant, skills }) {
  const empty = skills.length === 0;

  return (
    <div className="skill-block">
      <h3 className="skill-heading">
        <span className={`dot dot-${variant === "ok" ? "ok" : "miss"}`} aria-hidden="true" />
        {title} <span className="count">{skills.length}</span>
      </h3>

      {empty ? (
        <p className="empty-note">
          {variant === "ok"
            ? "Nothing matched yet — try a resume with a skills or technologies section."
            : "Nothing missing — that is a very strong match for this dictionary."}
        </p>
      ) : (
        <ul className="chips">
          {skills.map((skill) => (
            <li key={skill.name} className={`chip chip-${variant}`}>
              {skill.name}
              {variant === "miss" && <span className="chip-tag"> · {skill.weight}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
