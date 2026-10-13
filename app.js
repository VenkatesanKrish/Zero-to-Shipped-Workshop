/* =========================================================
   0 to Shipped — resume parser
   Front end only. Text extraction happens in the browser
   with pdf.js; the scoring is a weighted keyword match.
   Swap `extractText` for a fetch() to your API when you have one.
   ========================================================= */

/* ---------------------------------------------------------
   1. The skills dictionary — this IS the "target role".
   weight: core = 3, tool = 2, bonus = 1.
   The score is covered weight / total weight, so a core
   skill is worth three bonuses.
   --------------------------------------------------------- */
const SKILLS = [
  { name: "JavaScript", weight: "core", aliases: ["javascript", "js", "es6", "ecmascript"] },
  { name: "TypeScript", weight: "core", aliases: ["typescript", "ts"] },
  { name: "HTML", weight: "core", aliases: ["html", "html5"] },
  { name: "CSS", weight: "core", aliases: ["css", "css3", "scss", "sass"] },
  { name: "React", weight: "core", aliases: ["react", "react.js", "reactjs"] },
  { name: "Node.js", weight: "core", aliases: ["node.js", "nodejs", "node"] },
  { name: "REST APIs", weight: "core", aliases: ["rest api", "rest apis", "restful", "rest"] },
  { name: "Git", weight: "core", aliases: ["git", "github", "gitlab", "version control"] },
  { name: "SQL", weight: "core", aliases: ["sql", "postgres", "postgresql", "mysql"] },
  { name: "Testing", weight: "core", aliases: ["jest", "vitest", "unit test", "unit testing", "playwright", "cypress"] },

  { name: "Docker", weight: "tool", aliases: ["docker", "container", "containers"] },
  { name: "CI/CD", weight: "tool", aliases: ["ci/cd", "ci cd", "continuous integration", "github actions", "pipeline"] },
  { name: "AWS", weight: "tool", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"] },
  { name: "Tailwind", weight: "tool", aliases: ["tailwind", "tailwindcss"] },
  { name: "Python", weight: "tool", aliases: ["python", "django", "flask", "fastapi"] },
  { name: "Express", weight: "tool", aliases: ["express", "express.js", "expressjs"] },
  { name: "MongoDB", weight: "tool", aliases: ["mongodb", "mongo", "mongoose"] },
  { name: "Accessibility", weight: "tool", aliases: ["accessibility", "a11y", "aria", "wcag"] },
  { name: "Performance", weight: "tool", aliases: ["performance", "lighthouse", "core web vitals", "optimisation", "optimization"] },

  { name: "GraphQL", weight: "bonus", aliases: ["graphql", "apollo"] },
  { name: "Redis", weight: "bonus", aliases: ["redis", "caching"] },
  { name: "Kubernetes", weight: "bonus", aliases: ["kubernetes", "k8s", "helm"] },
  { name: "WebSockets", weight: "bonus", aliases: ["websocket", "websockets", "socket.io", "sse"] },
  { name: "Next.js", weight: "bonus", aliases: ["next.js", "nextjs", "nuxt"] },
  { name: "Figma", weight: "bonus", aliases: ["figma", "wireframe", "wireframes", "design system"] },
  { name: "Agile", weight: "bonus", aliases: ["agile", "scrum", "kanban", "sprint"] },
];

const WEIGHT = { core: 3, tool: 2, bonus: 1 };

/* ---------------------------------------------------------
   2. Elements
   --------------------------------------------------------- */
const els = {
  dropzone: document.getElementById("dropzone"),
  input: document.getElementById("file-input"),
  fileRow: document.getElementById("file-row"),
  fileName: document.getElementById("file-name"),
  resetBtn: document.getElementById("reset-btn"),
  status: document.getElementById("status"),
  results: document.getElementById("results"),
  ring: document.getElementById("ring-fill"),
  score: document.getElementById("score-value"),
  verdict: document.getElementById("verdict"),
  statFound: document.getElementById("stat-found"),
  statMissing: document.getElementById("stat-missing"),
  statWords: document.getElementById("stat-words"),
  listPresent: document.getElementById("list-present"),
  listMissing: document.getElementById("list-missing"),
  countPresent: document.getElementById("count-present"),
  countMissing: document.getElementById("count-missing"),
  emptyPresent: document.getElementById("empty-present"),
  emptyMissing: document.getElementById("empty-missing"),
  scanAgain: document.getElementById("scan-again"),
};

const MAX_BYTES = 5 * 1024 * 1024;
const RING = 339.292; // matches --ring in styles.css

/* ---------------------------------------------------------
   3. Text extraction
   --------------------------------------------------------- */

/** Read a PDF (or plain .txt) File and return its text. */
async function extractText(file) {
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    return file.text();
  }

  // pdf.js is pulled in lazily so the page still renders if the CDN is blocked.
  const pdfjs = await import(
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.mjs"
  );
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n");
}

/* ---------------------------------------------------------
   4. Scoring
   --------------------------------------------------------- */

/** Is this alias present in the text as a whole word?
 *  Lookarounds stop "Java" matching inside "JavaScript" and
 *  "go" matching inside "going". */
function containsAlias(text, alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = /^[a-z0-9]/.test(alias) ? "(?<![a-z0-9+#]|[a-z0-9]\\.)" : "";
  const end = /[a-z0-9]$/.test(alias) ? "(?![a-z0-9+#]|\\.[a-z0-9])" : "";
  return new RegExp(start + escaped + end).test(text);
}

/** Compare raw resume text against SKILLS. Returns a plain result object. */
function scoreResume(rawText) {
  // Normalise: lowercase, unify dashes/quotes/spaces, collapse whitespace.
  const text = rawText
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");

  const present = [];
  const missing = [];
  let covered = 0;
  let total = 0;

  for (const skill of SKILLS) {
    const points = WEIGHT[skill.weight];
    total += points;
    if (skill.aliases.some((alias) => containsAlias(text, alias))) {
      present.push(skill);
      covered += points;
    } else {
      missing.push(skill);
    }
  }

  return {
    score: Math.round((covered / total) * 100),
    present,
    missing,
    words: text.split(" ").filter(Boolean).length,
  };
}

/* ---------------------------------------------------------
   5. Rendering
   --------------------------------------------------------- */

function ringColour(score) {
  if (score >= 70) return "#34d399"; // --ok
  if (score >= 40) return "#fbbf24"; // amber
  return "#fb7185";                  // --miss
}

function verdictFor(score, missing) {
  const topGaps = missing
    .filter((s) => s.weight === "core")
    .slice(0, 3)
    .map((s) => s.name);

  if (score >= 70) {
    return "Strong match — this resume already covers most of what the target role asks for.";
  }
  if (score >= 40) {
    const gaps = topGaps.length ? ` Start with ${topGaps.join(", ")}.` : "";
    return `Solid base with clear gaps.${gaps}`;
  }
  const gaps = topGaps.length ? ` The biggest gaps: ${topGaps.join(", ")}.` : "";
  return `Early days — the core skills are mostly missing.${gaps}`;
}

function chip(skill, state) {
  const li = document.createElement("li");
  li.className = `chip chip-${state}`;
  li.textContent = skill.name;
  if (state === "miss") {
    const tag = document.createElement("span");
    tag.className = "chip-tag";
    tag.textContent = ` · ${skill.weight}`;
    li.append(tag);
  }
  return li;
}

function render(result) {
  // Ring: dashoffset 0 = full circle. Animate from empty on each render.
  els.ring.style.stroke = ringColour(result.score);
  els.ring.style.strokeDashoffset = RING; // reset, then animate on next frame
  requestAnimationFrame(() => {
    els.ring.style.strokeDashoffset = RING * (1 - result.score / 100);
  });

  els.score.textContent = result.score;
  els.verdict.textContent = verdictFor(result.score, result.missing);

  els.statFound.textContent = result.present.length;
  els.statMissing.textContent = result.missing.length;
  els.statWords.textContent = result.words.toLocaleString();

  els.listPresent.replaceChildren(...result.present.map((s) => chip(s, "ok")));
  els.listMissing.replaceChildren(...result.missing.map((s) => chip(s, "miss")));

  els.countPresent.textContent = result.present.length;
  els.countMissing.textContent = result.missing.length;
  els.emptyPresent.hidden = result.present.length > 0;
  els.emptyMissing.hidden = result.missing.length > 0;

  els.results.hidden = false;
}

/* ---------------------------------------------------------
   6. Wiring
   --------------------------------------------------------- */

function setStatus(message, kind = "") {
  els.status.textContent = message;
  els.status.className = `status ${kind}`.trim();
}

function showFile(file) {
  els.fileName.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;
  els.fileRow.hidden = false;
}

function reset() {
  els.input.value = "";
  els.fileRow.hidden = true;
  els.results.hidden = true;
  els.status.textContent = "";
  els.status.className = "status";
  els.ring.style.strokeDashoffset = RING;
  els.score.textContent = "0";
}

async function handleFile(file) {
  if (!file) return;

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

  if (!isPdf && !isTxt) {
    setStatus("That is not a PDF. Export your resume as PDF and try again.", "is-error");
    return;
  }
  if (file.size > MAX_BYTES) {
    setStatus("That file is over 5 MB — try a smaller export.", "is-error");
    return;
  }

  showFile(file);
  setStatus("Reading your resume…");

  try {
    const text = await extractText(file);

    if (text.replace(/\s/g, "").length < 50) {
      setStatus(
        "Almost no text came out. If your resume is a scan or an image, it needs a text layer (export from Word/Docs rather than photographing it).",
        "is-error"
      );
      return;
    }

    const result = scoreResume(text);
    render(result);

    setStatus(
      `Scored ${result.present.length} of ${SKILLS.length} tracked skills.`,
      "is-ok"
    );
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    setStatus(
      "Could not read that PDF. It may be encrypted or damaged — try re-exporting it.",
      "is-error"
    );
  }
}

// Click and keyboard on the dropzone both open the file picker.
els.dropzone.addEventListener("click", () => els.input.click());
els.dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    els.input.click();
  }
});

els.input.addEventListener("change", (event) => handleFile(event.target.files[0]));
els.resetBtn.addEventListener("click", reset);
els.scanAgain.addEventListener("click", () => {
  reset();
  document.getElementById("top").scrollIntoView({ behavior: "smooth" });
  els.input.click();
});

// Drag and drop. preventDefault on dragover is required or the
// browser opens the PDF in a new tab instead of firing 'drop'.
["dragenter", "dragover"].forEach((type) =>
  els.dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    els.dropzone.classList.add("is-dragging");
  })
);

["dragleave", "drop"].forEach((type) =>
  els.dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    els.dropzone.classList.remove("is-dragging");
  })
);

els.dropzone.addEventListener("drop", (event) => {
  handleFile(event.dataTransfer.files[0]);
});
