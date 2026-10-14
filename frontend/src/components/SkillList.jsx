/** One list of skills, as chips.
 *
 *  `variant` is "ok", "miss" or "bonus" and drives the styling. The `weight`
 *  tag only shows when there is one — the server sends plain names, so it
 *  renders nothing rather than an empty " · ". */
export default function SkillList({ title, variant, skills }) {
  const empty = skills.length === 0;

  const emptyText = {
    ok: "No overlap yet — none of the skills this job asks for appear in your resume.",
    miss: "Nothing missing — you cover every skill we tracked for this job.",
    bonus: "Nothing extra to show.",
  }[variant];

  return (
    <div className="skill-block">
      <h3 className="skill-heading">
        <span className={`dot dot-${variant}`} aria-hidden="true" />
        {title} <span className="count">{skills.length}</span>
      </h3>

      {empty ? (
        <p className="empty-note">{emptyText}</p>
      ) : (
        <ul className="chips">
          {skills.map((skill) => (
            <li key={skill.name} className={`chip chip-${variant}`}>
              {skill.name}
              {skill.weight && <span className="chip-tag"> · {skill.weight}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
