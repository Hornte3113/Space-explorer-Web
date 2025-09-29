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

let state = {
  cursorEnd: clampDate(new Date()),
  perPage: Number($perPage.value || 12),
  imagesOnly: true
};

/* Fetch por rango (start_date..end_date). NASA devuelve array ascendente por fecha. */
async function fetchRange(endDate, days){
  const end = clampDate(endDate);
  const start = clampDate(addDays(end, -(days - 1)));
  const url = new URL(APOD_ENDPOINT);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("thumbs", "true");
  url.searchParams.set("start_date", fmt(start));
  url.searchParams.set("end_date", fmt(end));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  // Ordenamos descendente (recientes primero)
  data.sort((a,b) => (a.date < b.date ? 1 : -1));
  return { items: data, start, end };
}

function render(items){
  $grid.innerHTML = "";
  const filtered = state.imagesOnly
    ? items.filter(it => it.media_type === "image")
    : items;

  if(!filtered.length){
    $grid.innerHTML = `<p class="muted">No hay elementos para este rango.</p>`;
    return;
  }

  for(const item of filtered){
    const img = item.url || item.hdurl || item.thumbnail_url;
    const a = document.createElement("a");
    a.className = "card";
    a.href = `./apod.html?date=${encodeURIComponent(item.date)}`;
    a.setAttribute("role","listitem");
    a.innerHTML = `
      <div class="card__media" style="background-image:url('${img}');"></div>
      <div class="card__body">
        <h3 class="card__title">${(item.title || "APOD").replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[s]))}</h3>
        <p class="card__meta">${item.date}</p>
      </div>
    `;
     $grid.appendChild(a);
  }
}