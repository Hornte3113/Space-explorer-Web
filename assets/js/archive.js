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