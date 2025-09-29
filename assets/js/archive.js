//vista dos Archivo APOD

const API_KEY = (window.NASA_KEY && String(window.NASA_KEY)) || "DEMO_KEY";
const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";

const $grid = document.getElementById("archive-grid");
const $filters = document.getElementById("filters");
const $dateTo = document.getElementById("date-to");
const $perPage = document.getElementById("per-page");
const $onlyImages = document.getElementById("only-images");
const $prev = document.getElementById("prev-page");
const $next = document.getElementById("next-page");
const $rangeLabel = document.getElementById("range-label");

/* Utilidades */
const fmt = (d) => new Date(d).toISOString().slice(0,10);
const clampDate = (d) => {
  const min = new Date("1995-06-16");
  const max = new Date();
  if (d < min) return min;
  if (d > max) return max;
  return d;
};
function parseISO(s){
  const [y,m,dd] = String(s).split("-").map(Number);
  const d = new Date(Date.UTC(y, (m||1)-1, dd||1));
  // adaptar a zona local sin romper YYYY-MM-DD
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
function addDays(d, delta){
  const nd = new Date(d);
  nd.setDate(nd.getDate() + delta);
  return nd;
}
function showSkeleton(cols = 3, rows = 2){
  $grid.innerHTML = "";
  for(let i=0;i<cols*rows;i++){
    const sk = document.createElement("div");
    sk.className = "card";
    sk.innerHTML = `<div class="card__media" style="background:linear-gradient(90deg,#121722,#0e121b,#121722);background-size:200% 100%;animation:shimmer 1.2s linear infinite"></div>
                    <div class="card__body"><div class="muted">Cargando…</div></div>`;
    $grid.appendChild(sk);
  }
}
function setRangeLabel(from, to){
  $rangeLabel.textContent = `Mostrando del ${fmt(from)} al ${fmt(to)}.`;
}