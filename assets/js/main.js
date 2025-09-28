/* =========================
   Configuración APOD
   ========================= */
const API_KEY = window.NASA_KEY || "DEMO_KEY";
; // Reemplázala por tu key cuando la tengas
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

/* Util: escapar texto para evitar inyecciones si algún campo viniera raro */
const escapeHTML = (str = "") =>
  str.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

/* Inyecta imagen de fondo en CSS var */
function setHeroImage(url){
  document.documentElement.style.setProperty("--hero-image", `url("${url}")`);
  // flag para animación de fade-in
  requestAnimationFrame(() => $hero.classList.add("is-loaded"));
}

/* Carga APOD */
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

/* Render del APOD */
function renderAPOD(data){
  const isVideo = data.media_type === "video";
  const imgUrl = !isVideo
    ? (data.hdurl || data.url)
    : (data.thumbnail_url || data.url); // video → intenta usar thumbnail

  // texto
  $title.textContent = data.title || "Astronomy Picture of the Day";
  $date.textContent = `APOD — ${data.date || "hoy"}`;
  $credit.textContent = data.copyright ? `Créditos: ${data.copyright}` : "Créditos: NASA / APOD";
  $desc.textContent = data.explanation || "";

  // imagen de fondo
  setHeroImage(imgUrl);

  // acciones
  $openHd.onclick = () => window.open(imgUrl, "_blank", "noopener,noreferrer");
  $ctaDetail.href = `./apod.html?date=${encodeURIComponent(data.date || "")}`; // si luego creas la vista 3
  $ctaArchive.href = `./archive.html`; // si luego creas la vista 2

  // título de la pestaña
  document.title = `${data.title} — Cosmos Diario`;
}

/* Respaldo local si falla la API */
function renderFallback(){
  // Datos de tu Nebulosa Lacerta
  const fallback = {
    title: "The Great Lacerta Nebula",
    date: "—",
    credit: "Ian Moehring & Kevin Roylance",
    explanation:
      "Una de las nebulosas más grandes del cielo, de brillo tenue y difícil observación visual. Catalogada como Sharpless 126 (Sh2-126), brilla en rojo por el hidrógeno excitado; a ~1,200 años luz.",
    img: "../img/nebulosa-lacerta.jpg"
  };

  $title.textContent = fallback.title;
  $date.textContent = "Imagen destacada";
  $credit.textContent = `Créditos: ${fallback.credit}`;
  $desc.textContent = fallback.explanation;
  setHeroImage(fallback.img);

  $openHd.onclick = () => window.open(fallback.img, "_blank", "noopener,noreferrer");
  $ctaDetail.href = "#";
  $ctaArchive.href = "#";
}

/* Botón APOD aleatorio (elige fecha random desde 1995-06-16) */
function randomDate(){
  const start = new Date("1995-06-16").getTime();
  const end = new Date().getTime();
  const rand = new Date(start + Math.random() * (end - start));
  return rand.toISOString().slice(0,10);
}
$randomBtn.addEventListener("click", () => {
  $hero.classList.remove("is-loaded");
  loadAPOD(randomDate());
});

/* Efecto parallax sutil en el fondo */
let raf = null;
window.addEventListener("mousemove", (e) => {
  if(raf) return;
  raf = requestAnimationFrame(() => {
    const { innerWidth:w, innerHeight:h } = window;
    const x = (e.clientX / w - .5) * 4; // rango pequeño
    const y = (e.clientY / h - .5) * 4;
    document.querySelector(".hero__backdrop").style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    raf = null;
  });
});

/* Init */
loadAPOD(); // hoy
