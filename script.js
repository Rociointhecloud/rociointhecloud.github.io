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
      why: {
        es: "Cruzar fuentes suena fácil hasta que comparas cosas que no son comparables.",
        en: "Combining sources sounds easy until you compare things that aren’t actually comparable."
      },
      what: {
        es: "Integración con pandas: normalización de formatos, definición coherente de métricas y proceso reproducible.",
        en: "Pandas integration: format normalization, consistent metrics definitions, and a reproducible process."
      },
      outcome: {
        es: "Dataset consistente, listo para analizar sin trampas de escalas ni definiciones ambiguas.",
        en: "A consistent dataset, ready for analysis without scale traps or ambiguous definitions."
      }
    },
    "digital-wellness-etl-pipeline": {
      why: {
        es: "Un dashboard no sirve si el pipeline es frágil o depende de quien lo creó.",
        en: "A dashboard is pointless if the pipeline is fragile or depends on its creator."
      },
      what: {
        es: "MySQL → Python → Excel. Claridad de métricas, reglas explícitas y límites documentados.",
        en: "MySQL → Python → Excel. Clear metrics, explicit rules, and documented limits."
      },
      outcome: {
        es: "Pipeline reproducible y dashboard usable sin dependencia del autor.",
        en: "Reproducible pipeline and a usable dashboard without dependency on the author."
      }
    },
    "clinical-diabetes-risk-glp1-analysis": {
      why: {
        es: "En salud, si no se entiende el dato, se usa mal.",
        en: "In healthcare, if data isn’t understood, it gets misused."
      },
      what: {
        es: "EDA + análisis estadístico interpretable con supuestos y sesgos visibles.",
        en: "EDA + interpretable statistical analysis with assumptions and bias made explicit."
      },
      outcome: {
        es: "Conclusiones defendibles y líneas claras para investigación futura.",
        en: "Defensible conclusions and clear directions for future research."
      }
    },
    "kiva-microloan-dashboard-excel": {
      why: {
        es: "Excel bien estructurado es velocidad con orden cuando hay que decidir rápido.",
        en: "Well-structured Excel is speed with order when decisions must be made fast."
      },
      what: {
        es: "Power Query + dashboard sobre 42k+ registros con KPIs claros.",
        en: "Power Query + dashboard over 42k+ records with clear KPIs."
      },
      outcome: {
        es: "Lectura de negocio inmediata sin sobrecargar de visuales innecesarios.",
        en: "Immediate business reading without overloading with unnecessary visuals."
      }
    }
  }
});

/* ==========================================================
   I18N (auto por ruta + fallback)
========================================================== */

function detectLangFromPath() {
  // Si estás en /en/ o /en/index.html => EN
  const p = window.location.pathname.toLowerCase();
  return p.startsWith("/en") ? "en" : "es";
}

let LANG = detectLangFromPath();

const UI = {
  es: {
    loading: "Cargando proyectos…",
    noProjectsTitle: "No hay proyectos disponibles",
    noProjectsBody: "Revisa la conexión o el usuario configurado.",
    errorTitle: "Error al cargar proyectos",
    updated: "Actualizado:",
    viewRepo: "Ver repo",
    demo: "Demo",
    viewDecisions: "Ver decisiones",
    hideDecisions: "Ocultar decisiones",
    why: "Por qué importa:",
    what: "Qué hice:",
    outcome: "Resultado:"
  },
  en: {
    loading: "Loading projects…",
    noProjectsTitle: "No projects available",
    noProjectsBody: "Check your connection or the configured username.",
    errorTitle: "Failed to load projects",
    updated: "Updated:",
    viewRepo: "View repo",
    demo: "Demo",
    viewDecisions: "View decisions",
    hideDecisions: "Hide decisions",
    why: "Why it matters:",
    what: "What I did:",
    outcome: "Outcome:"
  }
};

function t(key) {
  return (UI[LANG] && UI[LANG][key]) || UI.es[key] || key;
}

/* ==========================================================
   NAV: Language buttons => navegan a / o /en/
========================================================== */

function setupLangSwitch() {
  const btns = document.querySelectorAll(".lang-btn");
  if (!btns.length) return;

  const isEn = LANG === "en";

  btns.forEach(btn => {
    const lang = btn.dataset.lang;
    const pressed = (lang === "en" && isEn) || (lang === "es" && !isEn);
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");

    btn.addEventListener("click", () => {
      if (lang === LANG) return;

      // Mantén la experiencia limpia: redirige, no "traduce" en caliente
      if (lang === "en") {
        window.location.href = "/en/";
      } else {
        window.location.href = "/";
      }
    });
  });
}

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

  // EN: en-GB suele ser más natural para CV (Feb 2026)
  const locale = LANG === "en" ? "en-GB" : "es-ES";

  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short"
  });
}

function safeText(text, fallback = "—") {
  const t0 = String(text ?? "").trim();
  return t0 ? t0 : fallback;
}

function detectTags(text = "") {
  const hay = text.toLowerCase();
  const tags = [];

  if (/\betl\b/.test(hay)) tags.push("ETL");
  if (/\bdashboard\b/.test(hay)) tags.push("Dashboard");
  if (/\bexcel\b/.test(hay)) tags.push("Excel");
  if (hay.includes("power query")) tags.push("Power Query");
  if (hay.includes("power bi") || /\bpbi\b/.test(hay)) tags.push("Power BI");
  if (hay.includes("diabetes") || hay.includes("clinical") || hay.includes("nhs")) tags.push(LANG === "en" ? "Health" : "Salud");
  if (hay.includes("kiva") || hay.includes("microloan")) tags.push(LANG === "en" ? "Impact" : "Impacto");

  return tags;
}

/* ==========================================================
   GITHUB API (timeout + cache en sesión)
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
  const base = CONFIG.projectNarratives[repoName];

  if (base) {
    return {
      why: base.why?.[LANG] || base.why?.es || "",
      what: base.what?.[LANG] || base.what?.es || "",
      outcome: base.outcome?.[LANG] || base.outcome?.es || ""
    };
  }

  // fallback general
  return LANG === "en"
    ? {
        why: "If data isn’t understood, decisions get weaker.",
        what: "Cleaning, analysis, and documented decisions.",
        outcome: "A usable result with visible limits."
      }
    : {
        why: "Si el dato no se entiende, la decisión será débil.",
        what: "Limpieza, análisis y decisiones documentadas.",
        outcome: "Resultado usable con límites visibles."
      };
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
    .map(
      t => `<span class="tag ${t.brand ? "brand" : ""}">${escapeHtml(t.label)}</span>`
    )
    .join("");

  const demoBtn = repo.homepage
    ? `<a class="btn btn-ghost" href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer">${t("demo")}</a>`
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
          <span class="tag">${escapeHtml(t("updated"))} ${escapeHtml(updated)}</span>
        </div>
      </div>

      <p class="card-desc">
        ${escapeHtml(
          safeText(
            repo.description,
            LANG === "en"
              ? "Project documented with context, decisions, and clear limits."
              : "Proyecto documentado con contexto, decisiones y límites claros."
          )
        )}
      </p>

      <div class="card-actions">
        <a class="btn btn-primary" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(t("viewRepo"))}
        </a>
        ${demoBtn}
        <button class="btn btn-ghost js-details"
          type="button"
          aria-expanded="false"
          aria-controls="${detailsId}">
          ${escapeHtml(t("viewDecisions"))}
        </button>
      </div>

      <div class="details" id="${detailsId}" hidden>
        <div class="recruiter-only">
          <p class="mini"><strong>${escapeHtml(t("why"))}</strong> ${escapeHtml(n.why)}</p>
          <p class="mini"><strong>${escapeHtml(t("what"))}</strong> ${escapeHtml(n.what)}</p>
          <p class="mini"><strong>${escapeHtml(t("outcome"))}</strong> ${escapeHtml(n.outcome)}</p>
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
    btn.textContent = open ? t("viewDecisions") : t("hideDecisions");
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
        <h3 class="h3">${escapeHtml(t("noProjectsTitle"))}</h3>
        <p class="muted">${escapeHtml(t("noProjectsBody"))}</p>
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
  setupLangSwitch();

  const grid = $("#projectsGrid");
  if (grid) {
    grid.innerHTML = `
      <div class="card" style="grid-column: span 12;">
        <p class="muted">${escapeHtml(t("loading"))}</p>
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
          <h3 class="h3">${escapeHtml(t("errorTitle"))}</h3>
          <p class="muted">${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
