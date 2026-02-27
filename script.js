/* ==========================================================
   CONFIG
========================================================== */

const CONFIG = Object.freeze({
  githubUsername: "Rociointhecloud",
  pinnedRepos: [
    "happiness-population-internet-data-cleaning",
    "digital-wellness-etl-pipeline",
    "clinical-diabetes-risk-glp1-analysis",
    "kiva-microloan-dashboard-excel"
  ],
  projectNarratives: {
    "happiness-population-internet-data-cleaning": {
      why: "Cruzar fuentes suena fácil hasta que comparas cosas que no son comparables.",
      what: "Integración con pandas: normalización de formatos, definición coherente de métricas y proceso reproducible.",
      outcome: "Dataset consistente, listo para analizar sin trampas de escalas ni definiciones ambiguas."
    },
    "digital-wellness-etl-pipeline": {
      why: "Un dashboard no sirve si el pipeline es frágil o depende de quien lo creó.",
      what: "MySQL → Python → Excel. Claridad de métricas, reglas explícitas y límites documentados.",
      outcome: "Pipeline reproducible y dashboard usable sin dependencia del autor."
    },
    "clinical-diabetes-risk-glp1-analysis": {
      why: "En salud, si no se entiende el dato, se usa mal.",
      what: "EDA + análisis estadístico interpretable con supuestos y sesgos visibles.",
      outcome: "Conclusiones defendibles y líneas claras para investigación futura."
    },
    "kiva-microloan-dashboard-excel": {
      why: "Excel bien estructurado es velocidad con orden cuando hay que decidir rápido.",
      what: "Power Query + dashboard sobre 42k+ registros con KPIs claros.",
      outcome: "Lectura de negocio inmediata sin sobrecargar de visuales innecesarios."
    }
  }
});


/* ==========================================================
   HELPERS
========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short"
  });
}

function safeText(text, fallback = "—") {
  const t = String(text ?? "").trim();
  return t ? t : fallback;
}

function detectTags(text = "") {
  const hay = text.toLowerCase();
  const tags = [];

  if (/\betl\b/.test(hay)) tags.push("ETL");
  if (/\bdashboard\b/.test(hay)) tags.push("Dashboard");
  if (/\bexcel\b/.test(hay)) tags.push("Excel");
  if (hay.includes("power query")) tags.push("Power Query");
  if (hay.includes("power bi") || /\bpbi\b/.test(hay)) tags.push("Power BI");
  if (hay.includes("diabetes") || hay.includes("clinical") || hay.includes("nhs")) tags.push("Salud");
  if (hay.includes("kiva") || hay.includes("microloan")) tags.push("Impacto");

  return tags;
}


/* ==========================================================
   GITHUB API (con timeout + cache en sesión)
========================================================== */

async function fetchJSON(url, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal
    });

    if (!res.ok) throw new Error(`GitHub API (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

async function fetchAllRepos(username) {
  const cacheKey = `gh_repos_${username}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const perPage = 100;
  let page = 1;
  let out = [];

  while (true) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const batch = await fetchJSON(url);
    if (!Array.isArray(batch) || batch.length === 0) break;

    out = out.concat(batch);
    if (batch.length < perPage) break;
    page++;
  }

  sessionStorage.setItem(cacheKey, JSON.stringify(out));
  return out;
}

async function loadRepos() {
  const user = CONFIG.githubUsername.trim();
  if (!user) return [];

  const repos = await fetchAllRepos(user);

  const cleaned = repos
    .filter(r => !r.fork)
    .map(r => ({
      name: r.name,
      html_url: r.html_url,
      description: r.description || "",
      language: r.language || "",
      stargazers_count: r.stargazers_count || 0,
      updated_at: r.updated_at,
      homepage: (r.homepage || "").trim()
    }));

  const allow = new Set(CONFIG.pinnedRepos);

  const onlyPinned = cleaned.filter(r => allow.has(r.name));
  onlyPinned.sort(
    (a, b) =>
      CONFIG.pinnedRepos.indexOf(a.name) -
      CONFIG.pinnedRepos.indexOf(b.name)
  );

  return onlyPinned;
}


/* ==========================================================
   RENDER
========================================================== */

function narrativeFor(repoName) {
  return (
    CONFIG.projectNarratives[repoName] || {
      why: "Si el dato no se entiende, la decisión será débil.",
      what: "Limpieza, análisis y decisiones documentadas.",
      outcome: "Resultado usable con límites visibles."
    }
  );
}

function repoTags(repo) {
  const tags = [];

  if (repo.language) tags.push({ label: repo.language, brand: true });

  const hay = `${repo.name} ${repo.description}`;
  detectTags(hay).forEach(label => tags.push({ label }));

  return tags.slice(0, 4);
}

function renderRepoCard(repo, index) {
  const n = narrativeFor(repo.name);
  const tags = repoTags(repo);
  const updated = formatDate(repo.updated_at);
  const detailsId = `details-${index}`;

  const tagsHtml = tags
    .map(t =>
      `<span class="tag ${t.brand ? "brand" : ""}">
        ${escapeHtml(t.label)}
      </span>`
    )
    .join("");

  const demoBtn = repo.homepage
    ? `<a class="btn btn-ghost" href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer">Demo</a>`
    : "";

  return `
    <article class="card" tabindex="0">
      <div class="card-top">
        <h3 class="card-title">
          <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(repo.name)}
          </a>
        </h3>
        <div class="card-meta">
          ${tagsHtml}
          <span class="tag">Actualizado: ${escapeHtml(updated)}</span>
        </div>
      </div>

      <p class="card-desc">
        ${escapeHtml(
          safeText(
            repo.description,
            "Proyecto documentado con contexto, decisiones y límites claros."
          )
        )}
      </p>

      <div class="card-actions">
        <a class="btn btn-primary" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
          Ver repo
        </a>
        ${demoBtn}
        <button class="btn btn-ghost js-details"
          type="button"
          aria-expanded="false"
          aria-controls="${detailsId}">
          Ver decisiones
        </button>
      </div>

      <div class="details" id="${detailsId}" hidden>
        <div class="recruiter-only">
          <p class="mini"><strong>Por qué importa:</strong> ${escapeHtml(n.why)}</p>
          <p class="mini"><strong>Qué hice:</strong> ${escapeHtml(n.what)}</p>
          <p class="mini"><strong>Resultado:</strong> ${escapeHtml(n.outcome)}</p>
        </div>
      </div>
    </article>
  `;
}

function wireCardInteractions(root) {
  root.addEventListener("click", e => {
    const btn = e.target.closest(".js-details");
    if (!btn) return;

    const card = btn.closest(".card");
    const details = $(".details", card);
    const open = !details.hasAttribute("hidden");

    details.toggleAttribute("hidden");
    btn.setAttribute("aria-expanded", String(!open));
    btn.textContent = open ? "Ver decisiones" : "Ocultar decisiones";
  });

  root.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    if (e.target.closest("a,button")) return;

    e.preventDefault();
    const btn = $(".js-details", card);
    if (btn) btn.click();
  });
}

function renderProjects(repos) {
  const grid = $("#projectsGrid");
  if (!grid) return;

  if (!repos.length) {
    grid.innerHTML = `
      <div class="card" style="grid-column: span 12;">
        <h3 class="h3">No hay proyectos disponibles</h3>
        <p class="muted">Revisa la conexión o el usuario configurado.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = repos.map(renderRepoCard).join("");
  wireCardInteractions(grid);
}


/* ==========================================================
   INIT
========================================================== */

async function init() {
  const grid = $("#projectsGrid");
  if (grid) {
    grid.innerHTML = `
      <div class="card" style="grid-column: span 12;">
        <p class="muted">Cargando proyectos…</p>
      </div>
    `;
  }

  try {
    const repos = await loadRepos();
    renderProjects(repos);
  } catch (err) {
    if (grid) {
      grid.innerHTML = `
        <div class="card" style="grid-column: span 12;">
          <h3 class="h3">Error al cargar proyectos</h3>
          <p class="muted">${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
