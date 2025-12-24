// script.js — interfaz avanzada para Flask frontend
// Requiere: particles.js, leaflet.js (ya incluidos en template)

/* --------------------------
   Utility: safeFetch metadata
   -------------------------- */
async function fetchMetadata() {
  try {
    const res = await fetch('/metadata', { cache: "no-store" });
    if (!res.ok) throw new Error("no metadata");
    return await res.json();
  } catch (e) {
    // fallback defaults
    return {
      ratings: ["TV-MA","TV-14","TV-PG","PG-13","PG","R","TV-Y","TV-Y7","TV-G","NR"],
      genres: ["Drama","Comedy","Documentary","Action","Romantic","Horror","International","Children","Family","Thriller"]
    };
  }
}

/* --------------------------
   Particles (cursor-follow REAL)
   -------------------------- */
function initParticles() {
  particlesJS("particles-js", {
    particles: {
      number: { value: 100 },
      color: { value: ["#00ff8f", "#a000ff"] },
      shape: { type: "circle" },
      opacity: { value: 0.75, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 120, color: "#a000ff", opacity: 0.4 },
      move: { enable: true, speed: 1.5, out_mode: "out", attract: { enable: true, rotateX: 3000, rotateY: 2000 } }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" }
      },
      modes: {
        grab: { distance: 160, line_linked: { opacity: 0.9 } },
        push: { particles_nb: 3 }
      }
    },
    retina_detect: true
  });

  // Cursor-follow effect: nudge the canvas towards cursor smoothly
  const canvas = document.querySelector("#particles-js canvas");
  if (!canvas) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener("mousemove", (e) => {
    const nx = (e.clientX - window.innerWidth/2) * 0.02;
    const ny = (e.clientY - window.innerHeight/2) * 0.02;
    tx = nx; ty = ny;
  });
  function tick() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    canvas.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(tick);
  }
  tick();
}

/* --------------------------
   Populate selects & UI wiring
   -------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  initParticles();

  const meta = await fetchMetadata();
  populateRatings(meta.ratings || []);
  populateGenresAutocomplete(meta.genres || []);
  populateYears();

  setupDuration();
  setupMap();
  setupGenresTags();
  setupThemeToggle();
  setupFormSubmit(); // ensure duration/genres hidden are set on submit
});

/* --------------------------
   Ratings
   -------------------------- */
function populateRatings(ratings) {
  const sel = document.getElementById("ratingSelect");
  sel.innerHTML = "";
  const addOpt = (v) => {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  };
  // common first
  const preferred = ["TV-MA","TV-14","TV-PG","PG-13","PG","R"];
  preferred.forEach(r => { if (ratings.includes(r)) { addOpt(r); }});
  // add all remaining
  ratings.forEach(r => { if (!preferred.includes(r)) addOpt(r); });
}

/* --------------------------
   Years
   -------------------------- */
function populateYears() {
  const sel = document.getElementById("yearSelect");
  sel.innerHTML = "";
  const current = new Date().getFullYear();
  for (let y = current; y >= 1900; y--) {
    const o = document.createElement("option");
    o.value = y; o.textContent = y;
    sel.appendChild(o);
  }
}

/* --------------------------
   Duration
   -------------------------- */
function setupDuration() {
  const num = document.getElementById("durationNumber");
  const type = document.getElementById("durationType");
  const hid = document.getElementById("durationHidden");

  function update() {
    const v = num.value ? `${num.value} ${type.value}` : "";
    hid.value = v;
  }
  num.addEventListener("input", update);
  type.addEventListener("change", update);
  // initialize
  update();
}

/* --------------------------
   Genres tags (multiselect + autocomplete simple)
   -------------------------- */
let genresSet = new Set();
function populateGenresAutocomplete(list) {
  window._known_genres = list;
  // you can later implement autocomplete dropdown if desired
}

function setupGenresTags() {
  const input = document.getElementById("genreInput");
  const list = document.getElementById("genresList");
  const hidden = document.getElementById("genresHidden");

  function addTag(value) {
    if (!value || genresSet.has(value)) return;
    genresSet.add(value);
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = value;
    const rem = document.createElement("span");
    rem.className = "remove";
    rem.textContent = " ✕";
    rem.style.marginLeft = "8px";
    rem.style.opacity = "0.9";
    rem.style.cursor = "pointer";
    rem.onclick = () => { genresSet.delete(value); tag.remove(); updateHidden(); };
    tag.appendChild(rem);
    list.appendChild(tag);
    updateHidden();
  }

  function updateHidden() { hidden.value = Array.from(genresSet).join(", "); }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.value.trim();
      if (val) addTag(val);
      input.value = "";
    }
  });

  // optional click-to-add suggestion from known genres (if you want)
  // expose global function for dev convenience
  window.addGenre = addTag;
}

/* --------------------------
   Map (Leaflet) integration
   -------------------------- */
function setupMap() {
  const modal = document.getElementById("mapModal");
  const open = document.getElementById("openMap");
  const closeBtn = document.getElementById("closeMap");
  const countryInput = document.getElementById("countryInput");
  let map, geoLayer;

  open.addEventListener("click", () => {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden","false");
    // init map lazily
    if (!map) {
      map = L.map("map", { worldCopyJump: true }).setView([18,0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 6, attribution: ""
      }).addTo(map);

      // load geojson of countries (small compressed source)
      fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
        .then(r => r.json())
        .then(geojson => {
          geoLayer = L.geoJSON(geojson, {
            style: () => ({ color: "#a000ff", weight: 1, fillOpacity: 0.02 }),
            onEachFeature: (feature, layer) => {
              layer.on('click', () => {
                const name = feature.properties.ADMIN || feature.properties.NAME || feature.properties.name;
                countryInput.value = name;
                modal.style.display = "none";
                modal.setAttribute("aria-hidden","true");
              });
              layer.on('mouseover', () => { layer.setStyle({ fillOpacity: 0.06 }); });
              layer.on('mouseout', () => { layer.setStyle({ fillOpacity: 0.02 }); });
            }
          }).addTo(map);
        })
        .catch(err => {
          console.warn("No se pudo cargar geojson:", err);
          const notice = document.createElement('div');
          notice.textContent = "No se pudo cargar mapa (sin conexión). Escribe el país manualmente.";
          notice.style.color = "#fff";
          document.querySelector('.modal-inner').prepend(notice);
        });
    } else {
      // invalidate size to render properly
      setTimeout(() => { map.invalidateSize(); }, 300);
    }
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden","true");
  });

  // close on outside click
  window.addEventListener("click", (ev) => {
    if (ev.target === modal) {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden","true");
    }
  });
}

/* --------------------------
   Theme toggle with animation
   -------------------------- */
function setupThemeToggle() {
  const btn = document.getElementById("modeToggle");
  const root = document.body;
  // initialize from localStorage
  const saved = localStorage.getItem("theme");
  if (saved === "light") root.classList.add("light");
  else root.classList.add("dark");

  btn.addEventListener("click", () => {
    const isLight = root.classList.toggle("light");
    root.classList.toggle("dark", !isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
    // small visual pulse
    root.animate([{ filter: 'brightness(0.96)' }, { filter: 'brightness(1)' }], { duration: 420, easing: 'ease-out' });
  });
}

/* --------------------------
   on submit ensure fields are set
   -------------------------- */
function setupFormSubmit() {
  const form = document.getElementById("predictForm");
  form.addEventListener("submit", (e) => {
    // ensure duration hidden is updated
    const num = document.getElementById("durationNumber");
    const type = document.getElementById("durationType");
    const hid = document.getElementById("durationHidden");
    hid.value = num.value ? `${num.value} ${type.value}` : "";

    // ensure genres hidden
    const hiddenGenres = document.getElementById("genresHidden");
    if (!hiddenGenres.value) {
      // nothing: ok
    }
    // allow submission to proceed (POST)
  });
}
