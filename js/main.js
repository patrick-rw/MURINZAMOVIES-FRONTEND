// frontend/js/movie.js  -  Movie detail page
const API_URL = 'https://murinzamoviess.onrender.com/api';

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">' +
    '<rect width="300" height="450" fill="#111827"/>' +
    '<text x="150" y="230" fill="#4b5563" font-family="Arial" font-size="18" text-anchor="middle">No Image</text></svg>'
);

const movieContainer = document.getElementById('movie-detail');
const movieId = new URLSearchParams(window.location.search).get('id');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const safeImg = (u) => (/^https?:\/\//i.test(u || '') ? u : '');
const safeLink = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

function notFound(title, text) {
    movieContainer.innerHTML = `
        <div class="text-center mt-20">
            <h2 class="text-2xl font-bold text-red-500 mb-2">${esc(title)}</h2>
            <p class="text-gray-400 mb-6">${esc(text)}</p>
            <a href="index.html" class="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold text-white transition">Go Back Home</a>
        </div>`;
}

function linkButtons(links, kind) {
    const valid = (Array.isArray(links) ? links : []).filter((l) => l && safeLink(l.url));
    const isWatch = kind === 'watch';
    const label = isWatch ? 'Watch Now' : 'Download';

    if (!valid.length) {
        return `<p class="text-gray-500 text-sm italic py-2">${isWatch ? 'No watch link available yet.' : 'No download link available yet.'}</p>`;
    }

    const btnClass = isWatch
        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
        : 'bg-green-600 hover:bg-green-700 shadow-green-600/30';
    const icon = isWatch
        ? '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>'
        : '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>';

    return valid.map((l) => `
        <a href="${esc(safeLink(l.url))}" target="_blank" rel="noopener noreferrer"
           class="${btnClass} flex items-center justify-center w-full px-6 py-3.5 rounded-lg text-white font-bold text-base shadow-lg transition transform hover:-translate-y-0.5 mb-3">
            ${icon}${esc(l.quality && l.quality !== 'Watch' && l.quality !== 'Download' ? `${label} - ${l.quality}` : label)}
        </a>`).join('');
}

async function fetchMovieDetails() {
    if (!movieId) return notFound('No movie selected', 'Pick a movie from the home page.');

    try {
        const res = await fetch(`${API_URL}/movies/${encodeURIComponent(movieId)}`);
        if (res.status === 404 || res.status === 400) return notFound('Movie Not Found', 'This movie does not exist or was deleted.');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const movie = await res.json();

        const poster = safeImg(movie.posterUrl);
        document.title = `${movie.title} - MURINZA MOVIES`;
        if (poster) document.getElementById('bgBlur').style.backgroundImage = `url("${poster.replace(/"/g, '%22')}")`;

        movieContainer.innerHTML = `
            <div class="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
                <img src="${esc(poster)}" alt="${esc(movie.title)}"
                     class="w-52 md:w-72 rounded-xl shadow-2xl border-2 border-gray-700 flex-shrink-0 bg-gray-800"
                     onerror="this.onerror=null;this.src=PLACEHOLDER">

                <div class="flex-1 w-full">
                    <h1 class="text-3xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg text-center md:text-left">${esc(movie.title)}</h1>

                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-5">
                        ${movie.category ? `<span class="bg-blue-600 text-xs font-bold px-3 py-1 rounded uppercase">${esc(movie.category)}</span>` : ''}
                        ${movie.genre ? `<span class="bg-gray-700 text-xs font-bold px-3 py-1 rounded uppercase">${esc(movie.genre)}</span>` : ''}
                        ${movie.isSeason ? '<span class="bg-yellow-600 text-xs font-bold px-3 py-1 rounded uppercase">Season</span>' : ''}
                        <span class="text-gray-400 text-sm ml-1">Uploaded ${esc(new Date(movie.createdAt).toLocaleDateString())}</span>
                    </div>

                    <p class="text-gray-300 leading-relaxed mb-8 whitespace-pre-line text-center md:text-left">${esc(movie.description || 'No description available for this movie.')}</p>

                    <div class="grid sm:grid-cols-2 gap-6">
                        <div class="bg-[#111827]/80 backdrop-blur border border-gray-800 p-5 rounded-xl">
                            <h3 class="text-lg font-bold mb-4 flex items-center"><span class="w-1.5 h-5 bg-blue-600 mr-2 rounded-full"></span>Watch Online</h3>
                            ${linkButtons(movie.watchLinks, 'watch')}
                        </div>
                        <div class="bg-[#111827]/80 backdrop-blur border border-gray-800 p-5 rounded-xl">
                            <h3 class="text-lg font-bold mb-4 flex items-center"><span class="w-1.5 h-5 bg-green-600 mr-2 rounded-full"></span>Download</h3>
                            ${linkButtons(movie.downloadLinks, 'download')}
                        </div>
                    </div>
                </div>
            </div>`;
    } catch (err) {
        console.error(err);
        notFound('Could not load this movie', 'The server may be waking up. Please refresh in a few seconds.');
    }
}

fetchMovieDetails();
