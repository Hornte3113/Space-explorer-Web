/* =========================
   Vista 3: Detalle APOD
   ========================= */
const API_KEY = (window.NASA_KEY && String(window.NASA_KEY)) || "DEMO_KEY";
const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";

/* DOM */
const $title = document.getElementById("apod-title");
const $dateText = document.getElementById("apod-date");
const $credit = document.getElementById("apod-credit");
const $desc = document.getElementById("apod-desc");
const $media = document.getElementById("media");
const $picker = document.getElementById("pick-date");
const $prev = document.getElementById("prev");
const $next = document.getElementById("next");
const $openHd = document.getElementById("open-hd");

/* Utils */
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
  // mantener zona local correcta para el control date
  return new Date(y, (m||1)-1, dd||1);
}
function addDays(d, delta){
  const nd = new Date(d);
  nd.setDate(nd.getDate() + delta);
  return nd;
}
function getParam(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

/* Data */
async function fetchAPOD(dateStr){
  const url = new URL(APOD_ENDPOINT);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("thumbs", "true");
  if (dateStr) url.searchParams.set("date", dateStr);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* Render */
function renderMedia(data){
  const isVideo = data.media_type === "video";
  const imgUrl = data.hdurl || data.url || data.thumbnail_url;

  if(isVideo){
    // Si es YouTube/Vimeo u otro, incrustamos responsivo
    $media.innerHTML = `
      <div class="video-wrap">
        <iframe src="${data.url}" title="${(data.title||'APOD')}"
          loading="lazy" allowfullscreen referrerpolicy="no-referrer">
        </iframe>
      </div>`;
    $openHd.onclick = () => window.open(data.url, "_blank", "noopener,noreferrer");
  }else{
    $media.innerHTML = `
      <figure class="detail__figure">
        <img src="${imgUrl}" alt="${(data.title||'APOD')}" loading="eager" />
        ${data.copyright ? `<figcaption>© ${data.copyright}</figcaption>` : ""}
      </figure>`;
    $openHd.onclick = () => window.open(imgUrl, "_blank", "noopener,noreferrer");
  }
}

function render(data){
  const d = data.date ? parseISO(data.date) : new Date();

  $title.textContent = data.title || "Astronomy Picture of the Day";
  $dateText.textContent = `APOD — ${data.date || "hoy"}`;
  $credit.textContent = data.copyright ? `Créditos: ${data.copyright}` : "Créditos: NASA / APOD";
  $desc.textContent = data.explanation || "";

  renderMedia(data);

  // picker y document title
  $picker.value = fmt(d);
  document.title = `${$title.textContent} — Cosmos Diario`;

  // habilitar/estado de prev/next
  const minDate = new Date("1995-06-16");
  const today = clampDate(new Date());
  $prev.disabled = d <= minDate;
  $next.disabled = d >= today;

  // actualizar query param en la URL (sin recargar)
  const u = new URL(location.href);
  u.searchParams.set("date", fmt(d));
  history.replaceState({}, "", u.toString());
}

/* Carga por fecha */
async function load(dateStr){
  try{
    $media.innerHTML = `<div class="skeleton-media" aria-hidden="true"></div>`;
    const data = await fetchAPOD(dateStr);
    render(data);
  }catch(e){
    console.warn(e);
    $title.textContent = "No se pudo cargar este APOD";
    $desc.textContent = "Intenta con otra fecha.";
    $media.innerHTML = "";
  }
}

/* Eventos */
$picker.addEventListener("change", (e) => {
  const d = clampDate(parseISO(e.target.value));
  load(fmt(d));
});
$prev.addEventListener("click", () => {
  const d = clampDate(addDays(parseISO($picker.value || fmt(new Date())), -1));
  load(fmt(d));
});
$next.addEventListener("click", () => {
  const d = clampDate(addDays(parseISO($picker.value || fmt(new Date())), +1));
  load(fmt(d));
});

/* Init */
(function init(){
  // Rango válido para el <input type="date">
  const min = "1995-06-16";
  const max = fmt(new Date());
  $picker.min = min;
  $picker.max = max;

  const q = getParam("date");
  const initial = q ? clampDate(parseISO(q)) : new Date();
  load(fmt(initial));
})();
