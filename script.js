/* =========================
   CONFIG
========================= */
const CONFIG = {
  githubUsername: "Rociointhecloud",
  pinnedRepos: [
    "happiness-population-internet-data-cleaning",
    "digital-wellness-etl-pipeline",
    "clinical-diabetes-risk-glp1-analysis",
    "kiva-microloan-dashboard-excel"
  ],
  projectNarratives: {
    "happiness-population-internet-data-cleaning": {
      why: "Cuando mezclas fuentes (felicidad, población, internet), el riesgo no es el análisis: es la comparación injusta.",
      what: "Limpieza e integración (2019) con Python/pandas. Normalización de formatos, consistencia y dataset listo para análisis.",
      outcome: "Dataset coherente para explorar relaciones sin trampas por definiciones o escalas distintas."
    },
    "digital-wellness-etl-pipeline": {
      why: "Un dashboard solo sirve si el pipeline es fiable y el resultado se entiende sin necesitar a quien lo construyó.",
      what: "Proyecto en equipo: MySQL → Python → Excel. Rol: Product Owner. Entrega orientada a uso real y accesibilidad.",
      outcome: "Pipeline reproducible + dashboard utilizable para analizar hábitos digitales, sueño, estrés y bienestar."
    },
    "clinical-diabetes-risk-glp1-analysis": {
      why: "En salud, la interpretabilidad no es un extra: es parte de la responsabilidad.",
      what: "EDA end-to-end + modelado estadístico interpretable sobre riesgo de diabetes y tendencias de dispensación GLP-1 (NHS).",
      outcome: "Resultados defendibles y explicables: foco en señales útiles, supuestos claros y límites bien contados."
    },
    "kiva-microloan-dashboard-excel": {
      why: "Excel bien usado sigue siendo una herramienta potentísima cuando el objetivo es decidir rápido.",
      what: "Dashboard (42k+ micropréstamos) con limpieza en Power Query y análisis por sector, país y año.",
      outcome: "Lectura ágil del portfolio de préstamos: patrones por geografía y temática, listo para conversación de negocio."
    }
  }
};

/* =========================
   HELPERS
========================= */
const $ = (sel) => document.querySelector(sel);

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });
}

function getMode() {
  return document.body.getAttribute("data-mode") || "recruiter";
}

function setMode(mode) {
  document.body.setAttribute("data-mode", mode);
  const btn = $("#modeToggle");
  if (!btn) return;

  const isTech = mode === "tech";
  btn.setAttribute("aria-pressed", String(isTech));
  btn.textContent = `Modo: ${isTech ? "Tech" : "Recruiter"}`;
}

/* =========================
   GITHUB API
========================= */
async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub API error (${res.status})`);
  return res.json();
}

async function fetchAllRepos(username) {
  const perPage = 100;
  let page = 1;
  let out = [];

  while (true) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const batch = await fetchJSON(url);
    if (!Array.isArray(batch) || batch.length === 0) break;
    out = out.concat(batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return out;
}

async function loadRepos() {
  const user = CONFIG.githubUsername.trim();
  if (!user || user === "TU_GITHUB_USERNAME") return [];

  const repos = await fetchAllRepos(user);

  // Limpieza básica y sin forks
  const cleaned = repos
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      html_url: r.html_url,
      description: r.description || "",
      language: r.language || "—",
      topics: Array.isArray(r.topics) ? r.topics : [],
      stargazers_count: r.stargazers_count || 0,
      updated_at: r.updated_at,
      homepage: (r.homepage || "").trim()
    }));

  // ✅ Solo tus 4 repos, en el orden que tú has definido
  const allow = new Set(CONFIG.pinnedRepos);
  const onlyPinned = cleaned.filter((r) => allow.has(r.name));

  // Orden exacto pinnedRepos
  onlyPinned.sort((a, b) => CONFIG.pinnedRepos.indexOf(a.name) - CONFIG.pinnedRepos.indexOf(b.name));

  return onlyPinned;
}

/* =========================
   RENDER
========================= */
function repoTags(repo) {
  const tags = [];

  if (repo.language && repo.language !== "—") tags.push({ label: repo.language, kind: "brand" });

  const hay = `${repo.name} ${repo.description}`.toLowerCase();
  if (hay.includes("etl")) tags.push({ label: "ETL", kind: "" });
  if (hay.includes("dashboard")) tags.push({ label: "Dashboard", kind: "" });
  if (hay.includes("excel")) tags.push({ label: "Excel", kind: "" });
  if (hay.includes("power")) tags.push({ label: "Power Query/BI", kind: "" });
  if (hay.includes("diabetes") || hay.includes("clinical") || hay.includes("nhs")) tags.push({ label: "Salud", kind: "" });
  if (hay.includes("kiva") || hay.includes("microloan")) tags.push({ label: "Impacto", kind: "" });

  return tags.slice(0, 4);
}

function narrativeFor(repoName) {
  return CONFIG.projectNarratives[repoName] || {
    why: "¿Por qué importa? Porque un insight solo vale si alguien puede usarlo para decidir.",
    what: "¿Qué hice? Limpieza, análisis y documentación orientada a uso real.",
    outcome: "¿Resultado? Una entrega defendible, reproducible y comprensible."
  };
}

function renderRepoCard(repo) {
  const n = narrativeFor(repo.name);
  const tags = repoTags(repo);
  const tagsHtml = tags
    .map((t) => {
      const cls = `tag ${t.kind === "brand" ? "brand" : ""}`.trim();
      return `<span class="${cls}">${escapeHtml(t.label)}</span>`;
    })
    .join("");

  const updated = formatDate(repo.updated_at);

  return `
    <article class="card" tabindex="0" aria-label="Proyecto ${escapeHtml(repo.name)}">
      <div class="card-top">
        <div>
          <h3 class="card-title">
            <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer noopener">
              ${escapeHtml(repo.name)}
            </a>
          </h3>

          <div class="card-meta" aria-label="Etiquetas del proyecto">
            ${tagsHtml}
            <span class="tag">Actualizado: ${escapeHtml(updated)}</span>
          </div>
        </div>
      </div>

      <p class="card-desc">${escapeHtml(repo.description || "Proyecto en progreso. Entra al repo para ver el contexto, el método y el resultado.")}</p>

      <div class="card-actions">
        <a class="btn btn-primary" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer noopener">Ver repo</a>
        ${repo.homepage ? `<a class="btn btn-ghost" href="${escapeHtml(repo.homepage)}" target="_blank" rel="noreferrer noopener">Demo</a>` : ""}
        <button class="btn btn-ghost js-details" type="button" aria-expanded="false">
          Ver enfoque
        </button>
      </div>

      <div class="details" hidden>
        <div class="recruiter-only">
          <h4>Lectura rápida (recruiter)</h4>
          <p class="mini"><strong>Por qué importa:</strong> ${escapeHtml(n.why)}</p>
          <p class="mini"><strong>Qué hice:</strong> ${escapeHtml(n.what)}</p>
          <p class="mini"><strong>Resultado:</strong> ${escapeHtml(n.outcome)}</p>
        </div>

        <div class="tech-only">
          <h4>Notas técnicas (sin drama)</h4>
          <p class="mini">
            En el repo verás estructura, limpieza/transformaciones, decisiones de modelado o visualización,
            y README pensado para seguir el hilo.
          </p>
          <p class="mini">
            Si algo no está documentado, lo considero deuda técnica. Y la deuda se paga.
          </p>
        </div>
      </div>
    </article>
  `;
}

function wireCardInteractions(root) {
  root.querySelectorAll(".js-details").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const details = card.querySelector(".details");
      const isOpen = !details.hasAttribute("hidden");

      if (isOpen) {
        details.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Ver enfoque";
      } else {
        details.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        btn.textContent = "Ocultar enfoque";
      }
    });
  });
}

function renderProjects(repos) {
  const grid = $("#projectsGrid");
  if (!grid) return;

  if (!repos.length) {
    grid.innerHTML = `
      <div class="card" style="grid-column: span 12;">
        <h3 class="h3">Aún no puedo mostrar proyectos</h3>
        <p class="muted">Revisa tu conexión o el username en <code>script.js</code>.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = repos.map(renderRepoCard).join("");
  wireCardInteractions(grid);
}

/* =========================
   APP
========================= */
async function init() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setMode("recruiter");

  const toggle = $("#modeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = getMode() === "recruiter" ? "tech" : "recruiter";
      setMode(next);
    });
  }

  try {
    const repos = await loadRepos();
    renderProjects(repos);
  } catch (err) {
    const grid = $("#projectsGrid");
    if (grid) {
      grid.innerHTML = `
        <div class="card" style="grid-column: span 12;">
          <h3 class="h3">Error al cargar proyectos</h3>
          <p class="muted">${escapeHtml(err.message)}</p>
          <p class="muted">Si estás en local, revisa conexión. Si estás en GitHub Pages, revisa el username.</p>
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
