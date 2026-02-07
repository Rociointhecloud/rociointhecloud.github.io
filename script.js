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
      why: "Cruzar fuentes suena fácil… hasta que comparas cosas que no son comparables y te crees un cuento.",
      what: "Integré datasets (2019) con pandas: normalicé formatos, unifiqué definiciones y dejé el proceso repetible.",
      outcome: "Dataset listo para explorar relaciones sin trampas de escalas, unidades o nombres bonitos."
    },
    "digital-wellness-etl-pipeline": {
      why: "Un dashboard no vale si el pipeline es frágil o si solo lo entiende quien lo montó.",
      what: "Proyecto en equipo: MySQL → Python → Excel. Como PO, forcé claridad: qué métricas importan, cómo se calculan y qué límites tienen.",
      outcome: "Pipeline reproducible + dashboard utilizable para hábitos digitales (sueño/estrés/bienestar) sin depender del autor."
    },
    "clinical-diabetes-risk-glp1-analysis": {
      why: "En salud, “me da igual el porqué” no existe: si no se entiende, se usa mal.",
      what: "EDA + análisis estadístico interpretable con datos NHS: señales, supuestos y sesgos visibles desde el README.",
      outcome: "Conclusiones defendibles: qué parece estar pasando, qué no puedo afirmar y qué investigaría después."
    },
    "kiva-microloan-dashboard-excel": {
      why: "Excel bien hecho no es nostalgia: es velocidad con orden cuando hay que decidir sin montar un sistema entero.",
      what: "Power Query + dashboard sobre 42k+ micropréstamos: limpieza, segmentación y KPIs con lectura rápida.",
      outcome: "Conversación de negocio lista: patrones por país/sector/año sin perderte en 20 gráficos."
    }
  }
};

/* =========================
   HELPERS
========================= */
const $ = (sel, root = document) => root.querySelector(sel);

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

function safeText(text, fallback = "—") {
  const t = String(text ?? "").trim();
  return t ? t : fallback;
}

function detectTags(text) {
  const hay = text.toLowerCase();
  const tags = [];

  if (/\betl\b/.test(hay)) tags.push("ETL");
  if (/\bdashboard\b/.test(hay)) tags.push("Dashboard");
  if (/\bexcel\b/.test(hay)) tags.push("Excel");

  // Evita el "power" genérico: solo etiquetas si hay coincidencia real
  if (hay.includes("power query")) tags.push("Power Query");
  if (hay.includes("power bi") || /\bpbi\b/.test(hay)) tags.push("Power BI");

  if (hay.includes("diabetes") || hay.includes("clinical") || hay.includes("nhs")) tags.push("Salud");
  if (hay.includes("kiva") || hay.includes("microloan")) tags.push("Impacto");

  return tags;
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
  if (!user) return [];

  const repos = await fetchAllRepos(user);

  const cleaned = repos
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      html_url: r.html_url,
      description: r.description || "",
      language: r.language || "—",
      stargazers_count: r.stargazers_count || 0,
      updated_at: r.updated_at,
      homepage: (r.homepage || "").trim()
    }));

  // Solo repos fijados, en tu orden
  const allow = new Set(CONFIG.pinnedRepos);
  const onlyPinned = cleaned.filter((r) => allow.has(r.name));
  onlyPinned.sort((a, b) => CONFIG.pinnedRepos.indexOf(a.name) - CONFIG.pinnedRepos.indexOf(b.name));

  return onlyPinned;
}

/* =========================
   RENDER
========================= */
function repoTags(repo) {
  const tags = [];

  // Lenguaje (primero)
  if (repo.language && repo.language !== "—") tags.push({ label: repo.language, kind: "brand" });

  // Heurísticas por nombre/desc
  const hay = `${repo.name} ${repo.description}`.trim();
  const detected = detectTags(hay);

  detected.forEach((label) => tags.push({ label, kind: "" }));

  // Limita a 4 max (incluye lenguaje)
  return tags.slice(0, 4);
}

function narrativeFor(repoName) {
  return CONFIG.projectNarratives[repoName] || {
    why: "Importa porque si el dato no se entiende, se toma una mala decisión con mucha seguridad.",
    what: "Limpieza, análisis y decisiones anotadas para que otra persona pueda continuar sin depender de mí.",
    outcome: "Entrega usable: contexto, límites claros y resultado defendible."
  };
}

function renderRepoCard(repo, index) {
  const n = narrativeFor(repo.name);
  const tags = repoTags(repo);
  const updated = formatDate(repo.updated_at);

  // ids estables para accesibilidad (sin tocar HTML/CSS)
  const detailsId = `details-${index}-${repo.name}`.replace(/[^a-zA-Z0-9-_]/g, "");

  const tagsHtml = tags
    .map((t) => {
      const cls = `tag ${t.kind === "brand" ? "brand" : ""}`.trim();
      return `<span class="${cls}">${escapeHtml(t.label)}</span>`;
    })
    .join("");

  const desc = safeText(
    repo.description,
    "Proyecto en progreso. Entra al repo para ver contexto, decisiones y resultado."
  );

  const demoBtn = repo.homepage
    ? `<a class="btn btn-ghost" href="${escapeHtml(repo.homepage)}" target="_blank" rel="noreferrer noopener">Demo</a>`
    : "";

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

      <p class="card-desc">${escapeHtml(desc)}</p>

      <div class="card-actions">
        <a class="btn btn-primary" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer noopener">Ver repo</a>
        ${demoBtn}
        <button class="btn btn-ghost js-details"
                type="button"
                aria-expanded="false"
                aria-controls="${escapeHtml(detailsId)}">
          Ver decisiones
        </button>
      </div>

      <div class="details" id="${escapeHtml(detailsId)}" hidden>
        <div class="recruiter-only">
          <h4>Lectura rápida</h4>
          <p class="mini"><strong>Por qué importa:</strong> ${escapeHtml(n.why)}</p>
          <p class="mini"><strong>Qué hice:</strong> ${escapeHtml(n.what)}</p>
          <p class="mini"><strong>Resultado:</strong> ${escapeHtml(n.outcome)}</p>
        </div>

        <div class="tech-only">
          <h4>Qué mirar si evalúas rápido</h4>
          <p class="mini">
            README con contexto, decisiones y límites. Estructura limpia del repo, pasos reproducibles y —si aplica—
            demo/artefactos para validar sin instalar nada raro.
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
      const details = $(".details", card);
      const isOpen = !details.hasAttribute("hidden");

      if (isOpen) {
        details.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Ver decisiones";
      } else {
        details.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        btn.textContent = "Ocultar decisiones";
      }
    });
  });

  // Teclado: Enter/Espacio sobre la tarjeta abre el panel (sin interferir con links/botones)
  root.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("keydown", (e) => {
      const isActivation = e.key === "Enter" || e.key === " ";
      if (!isActivation) return;

      const target = e.target;
      const isInteractive = target.closest("a, button, input, select, textarea");
      if (isInteractive) return;

      e.preventDefault();
      const btn = $(".js-details", card);
      if (btn) btn.click();
    });
  });
}

function renderProjects(repos) {
  const grid = $("#projectsGrid");
  if (!grid) return;

  if (!repos.length) {
    grid.innerHTML = `
      <div class="card" style="grid-column: span 12;">
        <h3 class="h3">No pude cargar proyectos</h3>
        <p class="muted">Revisa tu conexión o el username en <code>script.js</code>.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = repos.map((r, i) => renderRepoCard(r, i)).join("");
  wireCardInteractions(grid);
}

/* =========================
   APP
========================= */
async function init() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
