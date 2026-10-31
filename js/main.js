// frontend/js/main.js  -  Public homepage
const API_URL = 'https://murinzamoviess.onrender.com/api';

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">' +
    '<rect width="300" height="450" fill="#111827"/>' +
    '<text x="150" y="230" fill="#4b5563" font-family="Arial" font-size="18" text-anchor="middle">No Image</text></svg>'
);

let allMoviesData = [];

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const safeImg = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

// Groups movies into rows: "Trending" first (if any), then one row per category.
function buildRows(movies) {
    const rows = [];
    const isTrendingCat = (m) => (m.category || '').trim().toLowerCase() === 'trending';
    const trending = movies.filter((m) => m.isTrending || isTrendingCat(m));
    if (trending.length) rows.push({ name: 'Trending', movies: trending });

    const seen = new Map();
    movies.forEach((m) => {
        const name = (m.category || '').trim();
        if (!name || isTrendingCat(m)) return;
        const key = name.toLowerCase();
        if (!seen.has(key)) {
            const row = { name, movies: [] };
            seen.set(key, row);
            rows.push(row);
        }
        seen.get(key).movies.push(m);
    });
    return rows;
}

/* ---------- rendering ---------- */
function createMovieCard(movie) {
    return `
        <a href="movie.html?id=${esc(movie._id)}" class="movie-card-container block w-[140px] sm:w-[160px] md:w-[200px] flex-shrink-0 group cursor-pointer">
            <div class="relative rounded-lg overflow-hidden aspect-[2/3] bg-gray-800 border border-gray-700/50 mb-2">
                <img src="${esc(safeImg(movie.posterUrl))}" alt="${esc(movie.title)}" loading="lazy"
                     class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                     onerror="this.onerror=null;this.src=PLACEHOLDER">
                <div class="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                    ${movie.genre ? `<span class="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">${esc(movie.genre)}</span>` : ''}
                    ${movie.isSeason ? '<span class="bg-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">Season</span>' : ''}
                </div>
                <div class="absolute bottom-0 w-full p-2 card-gradient">
                    <h4 class="text-sm font-bold text-white truncate">${esc(movie.title)}</h4>
                </div>
            </div>
            <div class="text-[10px] text-gray-500">${esc(new Date(movie.createdAt).toLocaleDateString())}</div>
        </a>`;
}

function renderHero(movies) {
    // movies come newest-first from the API, so find() returns the LATEST trending upload.
    const hero = movies.find((m) => m.isTrending) || movies[0];
    const section = $('heroSection');
    if (!hero) { section.classList.add('hidden'); return; }

    const img = safeImg(hero.posterUrl);
    $('heroImage').style.backgroundImage = img ? `url("${img.replace(/"/g, '%22')}")` : 'none';
    $('heroTitle').textContent = hero.title;
    $('heroDesc').textContent = hero.description || '';
    $('heroBadge').textContent = hero.isTrending ? 'Trending' : 'Latest';
    const genre = $('heroGenre');
    genre.textContent = hero.genre || '';
    genre.classList.toggle('hidden', !hero.genre);
    $('heroBtn').href = `movie.html?id=${encodeURIComponent(hero._id)}`;
    section.classList.remove('hidden');
}

function renderMenu(rows) {
    $('menuCategories').innerHTML = rows.map((r, i) =>
        `<li><a href="#cat-${i}" class="block px-4 py-2 hover:bg-blue-600 hover:text-white transition">${esc(r.name)}</a></li>`
    ).join('');
}

function renderSections(rows) {
    $('sectionsContainer').innerHTML = rows.map((row, i) => `
        <section id="cat-${i}" class="mb-10 scroll-mt-24">
            <h2 class="text-xl md:text-2xl font-bold border-l-4 border-blue-600 pl-3 mb-4">${esc(row.name)}</h2>
            <div class="movie-row flex space-x-4 overflow-x-auto pb-4">
                ${row.movies.map(createMovieCard).join('')}
            </div>
        </section>`).join('');
}

/* ---------- data (instant paint from cache, then refresh in background) ---------- */
const CACHE_KEY = 'murinza_movies_v1';

function readCache() {
    try { const d = JSON.parse(localStorage.getItem(CACHE_KEY)); return Array.isArray(d) ? d : null; } catch (_) { return null; }
}
function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) { /* storage full or blocked */ }
}

function skeletonHTML() {
    const card = '<div class="w-[140px] sm:w-[160px] md:w-[200px] flex-shrink-0 aspect-[2/3] rounded-lg bg-gray-800/60 animate-pulse"></div>';
    const row = `<div class="mb-10"><div class="h-7 w-40 bg-gray-800/60 rounded mb-4 animate-pulse"></div><div class="flex space-x-4 overflow-hidden">${card.repeat(8)}</div></div>`;
    return `<div id="loader">${row}${row}</div>`;
}

function paint(movies) {
    allMoviesData = movies;
    const rows = buildRows(movies);
    renderHero(movies);
    renderMenu(rows);
    renderSections(rows);
}

async function loadHomepage() {
    const container = $('sectionsContainer');
    const cached = readCache();

    if (cached) paint(cached);                 // movies appear immediately
    else container.innerHTML = skeletonHTML(); // first visit: skeleton cards, not a spinner

    const wakeTimer = !cached && setTimeout(() => {
        const loader = $('loader');
        if (loader) loader.insertAdjacentHTML('afterend',
            '<p class="text-center text-gray-500 text-sm">Server is waking up, this can take up to a minute...</p>');
    }, 5000);

    try {
        const res = await fetch(`${API_URL}/movies`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const fresh = await res.json();
        if (!Array.isArray(fresh)) throw new Error('Unexpected response');

        writeCache(fresh);
        if (!cached || JSON.stringify(fresh) !== JSON.stringify(cached)) paint(fresh);
    } catch (err) {
        console.error('Failed to load movies:', err);
        if (!cached) {
            container.innerHTML = `
                <div class="text-center py-16">
                    <p class="text-gray-400 mb-4">Could not load movies. The server may be waking up.</p>
                    <button id="retryBtn" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition">Try again</button>
                </div>`;
            $('retryBtn').onclick = loadHomepage;
        }
    } finally {
        if (wakeTimer) clearTimeout(wakeTimer);
    }
}

/* ---------- live search ---------- */
function wireSearch(input, box) {
    if (!input || !box) return;

    const run = () => {
        const q = input.value.trim().toLowerCase();
        if (!q) { box.classList.add('hidden'); box.innerHTML = ''; return; }

        const found = allMoviesData.filter((m) =>
            [m.title, m.genre, m.category].some((f) => (f || '').toLowerCase().includes(q))
        ).slice(0, 8);

        box.innerHTML = found.length
            ? found.map((m) => `
                <a href="movie.html?id=${esc(m._id)}" class="flex items-center p-2 hover:bg-gray-700 border-b border-gray-700 last:border-0">
                    <img src="${esc(safeImg(m.posterUrl))}" alt="" class="w-9 h-14 object-cover rounded mr-3 bg-gray-800" onerror="this.onerror=null;this.src=PLACEHOLDER">
                    <div class="min-w-0">
                        <div class="text-sm font-semibold truncate">${esc(m.title)}</div>
                        <div class="text-xs text-gray-400 truncate">${esc([m.category, m.genre].filter(Boolean).join(' · '))}</div>
                    </div>
                </a>`).join('')
            : '<p class="p-3 text-sm text-gray-400">No results found</p>';
        box.classList.remove('hidden');
    };

    input.addEventListener('input', run);
    input.addEventListener('focus', run);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { box.classList.add('hidden'); input.blur(); }
        if (e.key === 'Enter') { const first = box.querySelector('a'); if (first) window.location.href = first.href; }
    });
    document.addEventListener('click', (e) => {
        if (!box.contains(e.target) && e.target !== input) box.classList.add('hidden');
    });
}

/* ---------- hamburger ---------- */
function wireMenu() {
    const btn = $('menuBtn');
    const menu = $('dropdownMenu');
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) menu.classList.add('hidden'); });
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add('hidden');
    });
}

wireMenu();
wireSearch($('searchInput'), $('searchResults'));
wireSearch($('mobileSearchInput'), $('mobileSearchResults'));
loadHomepage();
