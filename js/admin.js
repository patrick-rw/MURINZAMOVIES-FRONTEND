// frontend/js/admin.js  -  Admin dashboard
const API_URL = 'https://murinzamoviess.onrender.com/api';
const TOKEN_KEY = 'murinza_admin_token';

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

function showToast(message, isError) {
    const t = $('toast');
    t.textContent = message;
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-lg font-semibold text-sm shadow-2xl ' +
        (isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.add('hidden'), 3000);
}

function buildRows(movies) {
    const rows = [];
    const isTrendingCat = (m) => (m.category || '').trim().toLowerCase() === 'trending';
    const trending = movies.filter((m) => m.isTrending || isTrendingCat(m));
    if (trending.length) rows.push({ name: 'Trending', isTrendingRow: true, movies: trending });

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

/* ---------- auth (the server checks the credentials and issues a token) ---------- */
const getToken = () => sessionStorage.getItem(TOKEN_KEY) || '';

function showLogin(message) {
    $('adminApp').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    const err = $('loginError');
    err.textContent = message || '';
    err.classList.toggle('hidden', !message);
}

function showApp() {
    $('loginScreen').classList.add('hidden');
    $('adminApp').classList.remove('hidden');
}

function logout(message) {
    sessionStorage.removeItem(TOKEN_KEY);
    closeModal();
    showLogin(message);
}

async function api(path, { method = 'GET', body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (getToken()) headers['Authorization'] = 'Bearer ' + getToken();

    let res;
    try {
        res = await fetch(API_URL + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
    } catch (_) {
        throw new Error('Network error. The server may be waking up, please try again.');
    }
    let data = null;
    try { data = await res.json(); } catch (_) { /* empty body */ }

    if (res.status === 401 && path !== '/admin/login') {
        logout('Session expired. Please log in again.');
        throw new Error('Session expired');
    }
    if (!res.ok) throw new Error((data && data.error) || 'Request failed (' + res.status + ')');
    return data;
}

$('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    try {
        const data = await api('/admin/login', {
            method: 'POST',
            body: { username: $('username').value.trim(), password: $('password').value }
        });
        sessionStorage.setItem(TOKEN_KEY, data.token);
        $('password').value = '';
        showApp();
        loadAdminData();
    } catch (err) {
        showLogin(err.message === 'Invalid credentials' ? 'Invalid credentials!' : err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});

$('logoutBtn').addEventListener('click', () => logout());

/* ---------- rendering ---------- */
function createAdminMovieCard(movie) {
    return `
        <div class="movie-card-container block w-[140px] sm:w-[160px] md:w-[200px] flex-shrink-0">
            <div class="relative rounded-lg overflow-hidden aspect-[2/3] bg-gray-800 border border-gray-700/50 mb-2">
                <img src="${esc(safeImg(movie.posterUrl))}" alt="${esc(movie.title)}" loading="lazy" class="w-full h-full object-cover" onerror="this.onerror=null;this.src=PLACEHOLDER">

                <div class="absolute top-2 left-2 flex flex-col space-y-1 pointer-events-none">
                    ${movie.genre ? `<span class="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">${esc(movie.genre)}</span>` : ''}
                    ${movie.isSeason ? '<span class="bg-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">Season</span>' : ''}
                </div>
                <div class="absolute bottom-0 w-full p-2 card-gradient pointer-events-none">
                    <h4 class="text-sm font-bold text-white truncate">${esc(movie.title)}</h4>
                </div>

                <div class="admin-overlay absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-2">
                    <button type="button" data-action="edit" data-id="${esc(movie._id)}" class="bg-yellow-600 hover:bg-yellow-700 text-black text-xs font-bold px-3 py-1.5 rounded w-24">Edit</button>
                    <button type="button" data-action="delete" data-id="${esc(movie._id)}" class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded w-24">Delete</button>
                </div>
            </div>
        </div>`;
}

function renderHero(movies) {
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
    $('heroEditBtn').onclick = () => openEditModal(hero._id);
    section.classList.remove('hidden');
}

function renderAdmin() {
    const rows = buildRows(allMoviesData);
    const container = $('sectionsContainer');

    renderHero(allMoviesData);

    $('menuCategories').innerHTML = rows.map((r, i) =>
        `<li><a href="#cat-${i}" class="block px-4 py-2 hover:bg-blue-600 hover:text-white transition">${esc(r.name)}</a></li>`
    ).join('');

    $('categoryList').innerHTML = rows
        .filter((r) => !r.isTrendingRow)
        .map((r) => `<option value="${esc(r.name)}"></option>`).join('');

    if (!rows.length) {
        container.innerHTML = `
            <div class="text-center py-20">
                <p class="text-gray-400 mb-5">No movies yet. Upload your first one.</p>
                <button type="button" data-action="add" data-category="" data-trending="" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-bold transition">+ Add Movie</button>
            </div>`;
        return;
    }

    container.innerHTML = rows.map((row, i) => `
        <section id="cat-${i}" class="mb-10 scroll-mt-24">
            <h2 class="text-xl md:text-2xl font-bold border-l-4 border-blue-600 pl-3 mb-4">${esc(row.name)}</h2>
            <div class="movie-row flex space-x-4 overflow-x-auto pb-4 items-center">
                <button type="button" data-action="add" data-category="${esc(row.name)}" data-trending="${row.isTrendingRow ? '1' : ''}"
                        class="add-movie-btn w-[140px] sm:w-[160px] md:w-[200px] aspect-[2/3] flex-shrink-0 bg-gray-900 border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-blue-400">
                    <span class="text-6xl font-light leading-none">+</span>
                    <span class="text-xs font-bold mt-2 px-2 text-center">Add to ${esc(row.name)}</span>
                </button>
                ${row.movies.map(createAdminMovieCard).join('')}
            </div>
        </section>`).join('');
}

// One click handler for every Add / Edit / Delete button (no inline onclick, so
// category names with quotes or apostrophes can never break the page).
$('sectionsContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id, category, trending } = btn.dataset;
    if (action === 'edit') openEditModal(id);
    else if (action === 'delete') deleteMovie(id);
    else if (action === 'add') openAddModal(category || '', !!trending);
});

async function loadAdminData() {
    const container = $('sectionsContainer');
    container.innerHTML = '<div class="flex justify-center items-center h-40"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>';
    try {
        const data = await api('/movies');
        allMoviesData = Array.isArray(data) ? data : [];
        renderAdmin();
    } catch (err) {
        if (err.message === 'Session expired') return;
        container.innerHTML = `
            <div class="text-center py-16">
                <p class="text-gray-400 mb-4">${esc(err.message)}</p>
                <button type="button" id="retryBtn" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition">Try again</button>
            </div>`;
        $('retryBtn').onclick = loadAdminData;
    }
}

/* ---------- modal ---------- */
// THE URL-AUTOFILL FIX lives here. Every field is written through setField(), which
//  1) accepts ONLY a real string from the database (anything else becomes ""),
//  2) throws away a value that equals this admin page's own address, and
//  3) writes the value again on the next frame, overriding any browser/extension autofill.
const PAGE_URL = location.origin + location.pathname;

function cleanFieldValue(value) {
    if (typeof value !== 'string') return '';
    const v = value.trim();
    if (!v) return '';
    if (v === location.href || v === PAGE_URL || v.startsWith(PAGE_URL)) return '';
    return v;
}

function setField(id, value) {
    const el = $(id);
    const v = cleanFieldValue(value);
    el.value = v;
    el.defaultValue = v; // so form.reset() can never restore a stale value
    requestAnimationFrame(() => { if (el.value !== v) el.value = v; });
}

function openModal() {
    $('formError').classList.add('hidden');
    $('movieModal').classList.remove('hidden');
    $('movieModal').classList.add('flex');
    $('movieModal').scrollTop = 0;
}

function closeModal() {
    $('movieModal').classList.add('hidden');
    $('movieModal').classList.remove('flex');
}

function openAddModal(defaultCategory = '', trending = false) {
    $('movieForm').reset();
    $('movieId').value = '';
    $('modalTitle').textContent = 'Add New Movie';
    setField('title', '');
    setField('category', defaultCategory);
    setField('genre', '');
    setField('posterUrl', '');
    setField('watchUrl', '');      // always blank for a new movie
    setField('downloadUrl', '');   // always blank for a new movie
    $('description').value = '';
    $('isTrending').checked = !!trending;
    $('isSeason').checked = false;
    openModal();
    $('title').focus();
}

function openEditModal(id) {
    const movie = allMoviesData.find((m) => m._id === id);
    if (!movie) return;

    $('movieForm').reset();
    $('movieId').value = movie._id;
    $('modalTitle').textContent = 'Edit Movie';
    setField('title', movie.title);
    setField('category', movie.category);
    setField('genre', movie.genre);
    setField('posterUrl', movie.posterUrl);
    $('description').value = movie.description || '';
    $('isTrending').checked = !!movie.isTrending;
    $('isSeason').checked = !!movie.isSeason;

    // Show EXACTLY what the database holds. No saved link => the field is forced to "".
    const watch = Array.isArray(movie.watchLinks) && movie.watchLinks[0] ? movie.watchLinks[0].url : '';
    const download = Array.isArray(movie.downloadLinks) && movie.downloadLinks[0] ? movie.downloadLinks[0].url : '';
    setField('watchUrl', watch || '');
    setField('downloadUrl', download || '');

    openModal();
}

$('closeModalBtn').addEventListener('click', closeModal);
$('movieModal').addEventListener('mousedown', (e) => { if (e.target === $('movieModal')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
$('addMovieBtn').addEventListener('click', () => openAddModal(''));

/* ---------- save ---------- */
function formError(msg) {
    const el = $('formError');
    el.textContent = msg;
    el.classList.remove('hidden');
}

const isHttpUrl = (v) => { try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (_) { return false; } };

$('movieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $('movieId').value;

    const watch = $('watchUrl').value.trim();
    const download = $('downloadUrl').value.trim();
    const poster = $('posterUrl').value.trim();

    if (!$('title').value.trim() || !$('category').value.trim()) return formError('Title and Category are required.');
    if (!isHttpUrl(poster)) return formError('Poster URL must be a full link starting with http:// or https://');
    if (watch && !isHttpUrl(watch)) return formError('Watch Link must start with http:// or https://');
    if (download && !isHttpUrl(download)) return formError('Download Link must start with http:// or https://');
    if ([watch, download].some((v) => v && (v === location.href || v.startsWith(PAGE_URL)))) {
        return formError('A link points at this admin page. Clear it or paste the real link.');
    }

    // Empty input => empty array => the server clears the saved link.
    const movieData = {
        title: $('title').value.trim(),
        category: $('category').value.trim(),
        genre: $('genre').value.trim(),
        posterUrl: poster,
        description: $('description').value.trim(),
        isTrending: $('isTrending').checked,
        isSeason: $('isSeason').checked,
        watchLinks: watch ? [{ quality: 'Watch', url: watch }] : [],
        downloadLinks: download ? [{ quality: 'Download', url: download }] : []
    };

    const saveBtn = $('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
        await api(id ? `/movies/${encodeURIComponent(id)}` : '/movies', { method: id ? 'PUT' : 'POST', body: movieData });
        closeModal();
        showToast(id ? 'Movie updated' : 'Movie added');
        await loadAdminData();
    } catch (err) {
        if (err.message !== 'Session expired') formError(err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Movie';
    }
});

/* ---------- delete ---------- */
async function deleteMovie(id) {
    const movie = allMoviesData.find((m) => m._id === id);
    if (!confirm(`Delete "${movie ? movie.title : 'this movie'}"? This cannot be undone.`)) return;
    try {
        await api(`/movies/${encodeURIComponent(id)}`, { method: 'DELETE' });
        showToast('Movie deleted');
        await loadAdminData();
    } catch (err) {
        if (err.message !== 'Session expired') showToast(err.message, true);
    }
}

/* ---------- search (click a result to edit it) ---------- */
function wireSearch(input, box) {
    const run = () => {
        const q = input.value.trim().toLowerCase();
        if (!q) { box.classList.add('hidden'); box.innerHTML = ''; return; }
        const found = allMoviesData.filter((m) =>
            [m.title, m.genre, m.category].some((f) => (f || '').toLowerCase().includes(q))
        ).slice(0, 8);
        box.innerHTML = found.length
            ? found.map((m) => `
                <button type="button" data-edit="${esc(m._id)}" class="w-full text-left flex items-center p-2 hover:bg-gray-700 border-b border-gray-700 last:border-0">
                    <img src="${esc(safeImg(m.posterUrl))}" alt="" class="w-9 h-14 object-cover rounded mr-3 bg-gray-800" onerror="this.onerror=null;this.src=PLACEHOLDER">
                    <div class="min-w-0">
                        <div class="text-sm font-semibold truncate">${esc(m.title)}</div>
                        <div class="text-xs text-gray-400 truncate">${esc([m.category, m.genre].filter(Boolean).join(' · '))}</div>
                    </div>
                </button>`).join('')
            : '<p class="p-3 text-sm text-gray-400">No results found</p>';
        box.classList.remove('hidden');
    };
    input.addEventListener('input', run);
    input.addEventListener('focus', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { box.classList.add('hidden'); input.blur(); } });
    box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-edit]');
        if (!b) return;
        box.classList.add('hidden');
        input.value = '';
        openEditModal(b.dataset.edit);
    });
    document.addEventListener('click', (e) => { if (!box.contains(e.target) && e.target !== input) box.classList.add('hidden'); });
}

/* ---------- hamburger ---------- */
(function wireMenu() {
    const btn = $('menuBtn');
    const menu = $('dropdownMenu');
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) menu.classList.add('hidden'); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add('hidden'); });
})();

wireSearch($('searchInput'), $('searchResults'));
wireSearch($('mobileSearchInput'), $('mobileSearchResults'));

/* ---------- init ---------- */
// Runs immediately (the script tag sits at the end of <body>), so there is no
// DOMContentLoaded race like the old dynamically-injected script had.
if (getToken()) {
    showApp();
    loadAdminData();
} else {
    showLogin('');
}
