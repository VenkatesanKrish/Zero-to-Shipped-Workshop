/* The skills dictionary — this IS the "target role".
   weight: core = 3, tool = 2, bonus = 1.
   The score is covered weight / total weight, so one core
   skill is worth three bonuses. Add a role by adding a file
   like this one and passing it to analyze(). */

export const SKILLS = [
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

export const WEIGHT = { core: 3, tool: 2, bonus: 1 };
