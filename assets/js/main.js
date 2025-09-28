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

