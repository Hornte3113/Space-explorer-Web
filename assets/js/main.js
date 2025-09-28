//configuracion del apod

const API_KEY = (window.NASA_KEY && String(window.NASA_KEY)) || "DEMO_KEY";
const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";

/* Elementos del DOM */
const $hero = document.querySelector(".hero");
const $title = document.getElementById("apod-title");
const $date = document.getElementById("apod-date");
const $credit = document.getElementById("apod-credit");
const $desc = document.getElementById("apod-desc");
const $ctaDetail = document.getElementById("cta-detail");
const $ctaArchive = document.getElementById("cta-archive");
const $openHd = document.getElementById("open-hd");
const $randomBtn = document.getElementById("random-apod"); 

const $galleryGrid = document.getElementById("gallery-grid");
const $reloadGallery = document.getElementById("reload-gallery");

const $triviaText = document.getElementById("trivia-text");
const $newTrivia = document.getElementById("new-trivia");

const $quoteText = document.getElementById("quote-text");
const $quoteAuthor = document.getElementById("quote-author");
const $newQuote = document.getElementById("new-quote");

/* Util */
const escapeHTML = (str = "") =>
  String(str).replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

/* Imagen de fondo del hero (CSS var) */
function setHeroImage(url){
  document.documentElement.style.setProperty("--hero-image", `url("${url}")`);
  requestAnimationFrame(() => $hero.classList.add("is-loaded"));
}
//Apod del dia
async function loadAPOD(dateStr = null){
  const url = new URL(APOD_ENDPOINT);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("thumbs", "true");
  if (dateStr) url.searchParams.set("date", dateStr);

  try{
    const res = await fetch(url.toString(), { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderAPOD(data);
  }catch(err){
    console.warn("Fallo APOD, usando respaldo local:", err);
    renderFallback();
  }
}

function renderAPOD(data){
  const isVideo = data.media_type === "video";
  const imgUrl = !isVideo
    ? (data.hdurl || data.url)
    : (data.thumbnail_url || data.url);

  $title.textContent = data.title || "Astronomy Picture of the Day";
  $date.textContent = `APOD — ${data.date || "hoy"}`;
  $credit.textContent = data.copyright ? `Créditos: ${data.copyright}` : "Créditos: NASA / APOD";
  $desc.textContent = data.explanation || "";

  setHeroImage(imgUrl);

  $openHd.onclick = () => window.open(imgUrl, "_blank", "noopener,noreferrer");
  $ctaDetail.href = `./apod.html?date=${encodeURIComponent(data.date || "")}`;
  $ctaArchive.href = `#archivo`;

  document.title = `${data.title} — Cosmos Diario`;
}
/* Respaldo local si falla la API */
function renderFallback(){
  const fallback = {
    title: "The Great Lacerta Nebula",
    date: "—",
    credit: "Ian Moehring & Kevin Roylance",
    explanation:
      "Una de las nebulosas más grandes del cielo, de brillo tenue y difícil observación visual. Catalogada como Sharpless 126 (Sh2-126).",
    img: "./assets/img/nebulosa-lacerta.jpg"
  };

  $title.textContent = fallback.title;
  $date.textContent = "Imagen destacada";
  $credit.textContent = `Créditos: ${fallback.credit}`;
  $desc.textContent = fallback.explanation;
  setHeroImage(fallback.img);

  $openHd.onclick = () => window.open(fallback.img, "_blank", "noopener,noreferrer");
  $ctaDetail.href = "#";
  $ctaArchive.href = "#archivo";
}

/* Aleatorio (fecha entre 1995-06-16 y hoy) */
function randomDate(){
  const start = new Date("1995-06-16").getTime();
  const end = Date.now();
  const rand = new Date(start + Math.random() * (end - start));
  return rand.toISOString().slice(0,10);
}
$randomBtn?.addEventListener("click", () => {
  $hero.classList.remove("is-loaded");
  loadAPOD(randomDate());
});
/* Efecto parallax sutil */
let raf = null;
window.addEventListener("mousemove", (e) => {
  if(raf) return;
  raf = requestAnimationFrame(() => {
    const { innerWidth:w, innerHeight:h } = window;
    const x = (e.clientX / w - .5) * 4;
    const y = (e.clientY / h - .5) * 4;
    const el = document.querySelector(".hero__backdrop");
    if (el) el.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    raf = null;
  });
});
async function fetchAPOD(dateStr){
  const u = new URL(APOD_ENDPOINT);
  u.searchParams.set("api_key", API_KEY);
  u.searchParams.set("thumbs", "true");
  u.searchParams.set("date", dateStr);
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error("APOD fetch error");
  return r.json();
}

/* Galería de APODs destacados */
async function fetchAPOD(dateStr){
  const u = new URL(APOD_ENDPOINT);
  u.searchParams.set("api_key", API_KEY);
  u.searchParams.set("thumbs", "true");
  u.searchParams.set("date", dateStr);
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error("APOD fetch error");
  return r.json();
}

async function loadGallery(n = 6){
  $galleryGrid.innerHTML = '<div class="skeleton-row" aria-hidden="true"></div>';
  const promises = [];
  const picked = new Set();
  while (promises.length < n){
    const d = randomDate();
    if (picked.has(d)) continue;
    picked.add(d);
    promises.push(fetchAPOD(d));
  }

  try{
    const items = await Promise.all(promises);
    const usable = items.filter(it => it.media_type === "image"); // evita videos en mini
    renderGallery(usable.slice(0, n));
  }catch(e){
    console.warn("Fallo galería:", e);
    $galleryGrid.innerHTML = '<p class="muted">No se pudieron cargar elementos del archivo.</p>';
  }
}

function renderGallery(list){
  $galleryGrid.innerHTML = "";
  list.forEach(item => {
    const img = item.url || item.hdurl || item.thumbnail_url;
    const card = document.createElement("a");
    card.className = "card";
    card.href = `./apod.html?date=${encodeURIComponent(item.date)}`;
    card.setAttribute("role","listitem");
    card.innerHTML = `
      <div class="card__media" style="background-image:url('${img}')"></div>
      <div class="card__body">
        <h3 class="card__title">${escapeHTML(item.title || "APOD")}</h3>
        <p class="card__meta">${item.date}</p>
      </div>
    `;
    $galleryGrid.appendChild(card);
  });
}

$reloadGallery?.addEventListener("click", () => loadGallery(6));


//Parte de la trivia
const TRIVIA = [
  "Hay más estrellas en el universo observable que granos de arena en todas las playas de la Tierra.",
  "La Vía Láctea y Andrómeda colisionarán en ~4,5 mil millones de años.",
  "Los agujeros negros no “aspiran” todo: sólo influyen fuertemente cerca de su horizonte de sucesos.",
  "Un día en Venus dura más que su año: rota más lento de lo que orbita al Sol.",
  "Las nebulosas pueden ser viveros estelares donde nacen nuevas estrellas."
];

const QUOTES = [
  { q: "We are a way for the cosmos to know itself.", a: "Carl Sagan" },
  { q: "Somewhere, something incredible is waiting to be known.", a: "Carl Sagan" },
  { q: "The universe is under no obligation to make sense to you.", a: "Neil deGrasse Tyson" },
  { q: "Not only is the Universe stranger than we think, it is stranger than we can think.", a: "Werner Heisenberg" },
  { q: "El misterio crea maravilla y la maravilla es la base del deseo humano de comprender.", a: "Neil Armstrong" }
];

function setTrivia(){
  const t = TRIVIA[Math.floor(Math.random()*TRIVIA.length)];
  $triviaText.textContent = t;
}
function setQuote(){
  const it = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  $quoteText.textContent = `“${it.q}”`;
  $quoteAuthor.textContent = `— ${it.a}`;
}
$newTrivia?.addEventListener("click", setTrivia);
$newQuote?.addEventListener("click", setQuote);

//init

function smoothInternalLinks(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if(el){
        e.preventDefault();
        el.scrollIntoView({ behavior:"smooth", block:"start" });
      }
    });
  });
}

(async function init(){
  smoothInternalLinks();
  setTrivia();
  setQuote();
  loadAPOD();      // APOD de hoy
  loadGallery(6);  // mini-galería
})();




  

