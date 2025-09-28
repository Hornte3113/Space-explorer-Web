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