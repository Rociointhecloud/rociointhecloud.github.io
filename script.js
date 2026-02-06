:root{
  --brand:#2f6f5e;
  --brand-2:#245648;
  --bg:#0b0f0e;
  --surface:#0f1614;
  --card:#121c19;
  --text:#eaf3f0;
  --muted:#b8c7c1;
  --line:rgba(234,243,240,.12);
  --shadow: 0 12px 30px rgba(0,0,0,.35);

  --radius:18px;
  --max:1100px;

  --focus: 0 0 0 4px rgba(47,111,94,.35);
}

*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background:
    radial-gradient(900px 500px at 10% 10%, rgba(47,111,94,.20), transparent 60%),
    radial-gradient(900px 500px at 90% 0%, rgba(47,111,94,.12), transparent 60%),
    var(--bg);
  color:var(--text);
  line-height:1.55;
}

img{max-width:100%; height:auto; display:block}
a{color:inherit}
.container{max-width:var(--max); margin:0 auto; padding:0 20px}

.sr-only{
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}

.skip-link{
  position:absolute; left:12px; top:12px;
  background:var(--text);
  color:#08110e;
  padding:10px 12px;
  border-radius:12px;
  transform:translateY(-200%);
  transition:transform .2s ease;
  z-index:999;
}
.skip-link:focus{transform:translateY(0); outline:none; box-shadow: var(--focus)}

.site-header{
  position:sticky; top:0;
  backdrop-filter: blur(12px);
  background: rgba(11,15,14,.65);
  border-bottom:1px solid var(--line);
  z-index:20;
}
.nav{
  display:flex; align-items:center; justify-content:space-between;
  gap:16px;
  padding:14px 0;
}

/* Brand */
.brand{
  display:inline-flex;
  align-items:center;
  gap:10px;
  text-decoration:none;
  font-weight:700;
  letter-spacing:.2px;
}

/* ✅ Logo matches HTML (48px) */
.brand-mark{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:48px;
  height:48px;
  border-radius:12px;
  overflow:hidden;
  flex:0 0 auto;
  background: rgba(47,111,94,.12);
  border:1px solid rgba(47,111,94,.22);
  box-shadow: 0 0 0 4px rgba(47,111,94,.10);
}
.brand-mark img{
  width:48px;
  height:48px;
  object-fit:contain;
}

/* Subtle polish */
.brand:hover .brand-mark{
  border-color: rgba(47,111,94,.35);
  background: rgba(47,111,94,.16);
}
.brand:focus{
  outline:none;
  box-shadow: var(--focus);
  border-radius:14px;
  padding:6px 8px;
  margin:-6px -8px;
}

.nav-actions{display:flex; align-items:center; gap:14px; flex-wrap:wrap}
.nav-link{
  text-decoration:none;
  color:var(--muted);
  font-weight:600;
  font-size:14px;
  padding:8px 10px;
  border-radius:12px;
}
.nav-link:hover{color:var(--text); background: rgba(234,243,240,.06)}
.nav-link:focus{outline:none; box-shadow:var(--focus); background: rgba(234,243,240,.06)}

.section{padding:64px 0}
.section.alt{background: rgba(234,243,240,.03); border-top:1px solid var(--line); border-bottom:1px solid var(--line)}
.section-head{margin-bottom:18px}

.h1{font-size:42px; line-height:1.1; letter-spacing:-.6px; margin:10px 0 12px}
.h2{font-size:28px; line-height:1.2; margin:0 0 10px}
.h3{font-size:18px; margin:0 0 8px}
.eyebrow{margin:0 0 10px; color:var(--muted); font-weight:700; letter-spacing:.14em; text-transform:uppercase; font-size:12px}
.lead{font-size:18px; color:var(--muted); margin:0 0 18px; max-width:62ch}
.subhead{margin:0; color:var(--muted); max-width:75ch}
.accent{color: #c8f0e4}
.muted{color:var(--muted)}

.hero{padding-top:34px}
.hero-grid{
  display:grid;
  grid-template-columns: 1.15fr .85fr;
  gap:26px;
  align-items:start;
}
.hero-figure{
  background: rgba(234,243,240,.04);
  border:1px solid var(--line);
  border-radius: var(--radius);
  overflow:hidden;
  box-shadow: var(--shadow);
}
.hero-figure img{
  width:100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
.hero-card{
  margin-top:14px;
  background: linear-gradient(180deg, rgba(47,111,94,.16), rgba(18,28,25,.86));
  border:1px solid rgba(47,111,94,.22);
  border-radius: var(--radius);
  padding:16px;
}

.cta-row{display:flex; gap:12px; flex-wrap:wrap; margin:14px 0 10px}

.btn{
  display:inline-flex; align-items:center; justify-content:center;
  gap:10px;
  padding:10px 14px;
  border-radius: 14px;
  border:1px solid transparent;
  text-decoration:none;
  font-weight:700;
  cursor:pointer;
  user-select:none;
}
.btn:focus{outline:none; box-shadow: var(--focus)}
.btn-primary{
  background: linear-gradient(180deg, var(--brand), var(--brand-2));
  border-color: rgba(47,111,94,.35);
  color: #06110e;
}
.btn-primary:hover{filter:brightness(1.03)}
.btn-ghost{
  background: rgba(234,243,240,.05);
  border-color: var(--line);
  color: var(--text);
}
.btn-ghost:hover{background: rgba(234,243,240,.08)}

.quick-facts{
  list-style:none; padding:0; margin:12px 0 0;
  display:flex; flex-wrap:wrap; gap:10px;
}
.pill{
  display:inline-flex;
  padding:8px 10px;
  border-radius: 999px;
  border:1px solid var(--line);
  background: rgba(234,243,240,.04);
  color: var(--muted);
  font-weight:600;
  font-size:13px;
}

/* Projects grid + cards */
.grid{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap:14px;
}
.card{
  grid-column: span 6;
  background: rgba(18,28,25,.82);
  border:1px solid var(--line);
  border-radius: var(--radius);
  padding:16px;
  box-shadow: 0 8px 18px rgba(0,0,0,.22);
}
.card:hover{border-color: rgba(47,111,94,.28)}
.card:focus-within{box-shadow: var(--shadow), var(--focus)}
.card-top{display:flex; align-items:flex-start; justify-content:space-between; gap:14px}
.card-title{
  margin:0;
  font-size:18px;
  line-height:1.25;
  letter-spacing:-.2px;
}
.card-title a{text-decoration:none}
.card-title a:hover{text-decoration:underline}
.card-meta{display:flex; gap:10px; flex-wrap:wrap; margin-top:8px}

.tag{
  border:1px solid var(--line);
  background: rgba(234,243,240,.04);
  color: var(--muted);
  border-radius: 999px;
  padding:6px 10px;
  font-size:12px;
  font-weight:700;
}
.tag.brand{
  border-color: rgba(47,111,94,.28);
  background: rgba(47,111,94,.12);
  color: #c8f0e4;
}
.card-desc{margin:12px 0 0; color: var(--muted)}
.card-actions{display:flex; gap:10px; flex-wrap:wrap; margin-top:14px}

.details{
  margin-top:12px;
  border-top:1px dashed rgba(234,243,240,.18);
  padding-top:12px;
}
.details h4{margin:0 0 8px; font-size:14px}
.details p{margin:0 0 10px; color:var(--muted)}
.details .mini{font-size:13px}

/* Story */
.story-grid{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap:14px;
  margin-top:18px;
}
.story-grid .card{grid-column: span 4}
.quote{
  margin-top:16px;
  padding:14px 16px;
  border-radius: var(--radius);
  border:1px solid rgba(47,111,94,.22);
  background: rgba(47,111,94,.10);
}

/* Timeline */
.timeline{
  list-style:none; padding:0; margin:18px 0 0;
  display:flex; flex-direction:column; gap:14px;
}
.timeline-item{
  display:grid;
  grid-template-columns: 18px 1fr;
  gap:12px;
  align-items:start;
  padding:14px;
  border-radius: var(--radius);
  border:1px solid var(--line);
  background: rgba(234,243,240,.03);
}
.timeline-dot{
  width:12px; height:12px; border-radius:999px;
  background: var(--brand);
  margin-top:6px;
  box-shadow: 0 0 0 4px rgba(47,111,94,.18);
}

/* Contact + footer */
.contact-row{display:flex; gap:12px; flex-wrap:wrap; margin-top:10px}

.site-footer{
  border-top:1px solid var(--line);
  padding:18px 0;
  background: rgba(11,15,14,.65);
}
.footer-inner{display:flex; justify-content:space-between; gap:12px; align-items:center}
.footer-inner a{text-decoration:none}
.footer-inner a:hover{text-decoration:underline}

/* Recruiter mode vs Tech mode */
body[data-mode="recruiter"] .details .tech-only{display:none}
body[data-mode="tech"] .details .recruiter-only{display:none}

/* Responsive */
@media (max-width: 920px){
  .hero-grid{grid-template-columns: 1fr}
  .card{grid-column: span 12}
  .story-grid .card{grid-column: span 12}
}

/* Small screens: logo downshift */
@media (max-width: 520px){
  .brand-mark,
  .brand-mark img{
    width:40px;
    height:40px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  *{transition:none !important; animation:none !important}
}
