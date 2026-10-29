// frontend/js/main.js

// 1. EXACT RENDER URL
const API_URL = 'https://murinzamoviess.onrender.com/api';

// --- HELPER FUNCTION TO CREATE CARDS ---
function createMovieCard(movie) {
    // Fallback image if poster link is broken
    const poster = movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image';
    
    return `
        <a href="movie.html?id=${movie._id}" class="group cursor-pointer block">
            <div class="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-800 border border-gray-700/50 hover:border-blue-500 transition-all duration-300">
                <img src="${poster}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="absolute top-2 left-2 flex flex-col space-y-1">
                    ${movie.genre ? `<span class="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max shadow-md">${movie.genre}</span>` : ''}
                    ${movie.isSeason ? `<span class="bg-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max shadow-md">Season</span>` : ''}
                </div>
                <div class="absolute bottom-0 w-full p-3 card-gradient">
                    <h4 class="text-xs md:text-sm font-bold truncate text-white">${movie.title}</h4>
                    <p class="text-[10px] text-gray-400 mt-1">${movie.category}</p>
                </div>
            </div>
        </a>
    `;
}

// --- FETCH AND RENDER DATA ---
async function fetchMovies() {
    console.log("Fetching movies from:", `${API_URL}/movies`);
    
    try {
        const res = await fetch(`${API_URL}/movies`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const movies = await res.json();
        console.log("Movies received:", movies);

        // 1. Render Trending (Movies marked as trending OR just show the first 7)
        const trendingContainer = document.getElementById('trending-container');
        const trendingMovies = movies.filter(m => m.isTrending).slice(0, 7);
        
        if (trendingMovies.length > 0) {
            trendingContainer.innerHTML = trendingMovies.map(createMovieCard).join('');
            
            // Update Hero Banner with the first trending movie
            const heroMovie = trendingMovies[0];
            document.getElementById('heroTitle').innerText = heroMovie.title;
            document.getElementById('heroDesc').innerText = heroMovie.description || "Watch now!";
            if(heroMovie.posterUrl) {
                document.getElementById('heroBanner').style.backgroundImage = `url('${heroMovie.posterUrl}')`;
            }
            document.getElementById('heroWatchBtn').onclick = () => window.location.href = `movie.html?id=${heroMovie._id}`;
        } else {
            trendingContainer.innerHTML = '<p class="text-gray-500 text-sm py-4">No trending movies yet.</p>';
            document.getElementById('heroTitle').innerText = "Welcome to Movie Show";
            document.getElementById('heroDesc').innerText = "Add movies in the admin panel to see them here.";
        }

        // 2. Render Recent (Show latest 7)
        const recentContainer = document.getElementById('recent-container');
        const recentMovies = movies.slice(0, 7);
        
        if (recentMovies.length > 0) {
            recentContainer.innerHTML = recentMovies.map(createMovieCard).join('');
        } else {
            recentContainer.innerHTML = '<p class="text-gray-500 text-sm py-4">No recent movies added yet.</p>';
        }

    } catch (err) {
        console.error("Error fetching movies:", err);
        document.getElementById('trending-container').innerHTML = `<p class="text-red-500 text-sm py-4">Failed to load. Backend might be waking up. Refresh in 30 seconds.</p>`;
        document.getElementById('recent-container').innerHTML = `<p class="text-red-500 text-sm py-4">Failed to load.</p>`;
    }
}

// --- LIVE SEARCH FEATURE ---
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let allMovies = [];

// Pre-fetch data for search
async function prepSearch() {
    try {
        const res = await fetch(`${API_URL}/movies`);
        allMovies = await res.json();
    } catch(err) {
        console.log("Search prep failed");
    }
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 1) {
        searchResults.classList.add('hidden');
        return;
    }
    
    const filtered = allMovies.filter(m => m.title.toLowerCase().includes(query));
    
    if (filtered.length > 0) {
        searchResults.innerHTML = filtered.map(m => `
            <a href="movie.html?id=${m._id}" class="flex items-center p-3 hover:bg-gray-700 border-b border-gray-700 last:border-0 transition">
                <img src="${m.posterUrl}" class="w-10 h-14 object-cover rounded mr-3" onerror="this.src='https://via.placeholder.com/50'">
                <div>
                    <span class="text-sm font-bold block text-white">${m.title}</span>
                    <span class="text-xs text-gray-400">${m.category}</span>
                </div>
            </a>
        `).join('');
        searchResults.classList.remove('hidden');
    } else {
        searchResults.innerHTML = '<p class="p-3 text-sm text-gray-400">No results found</p>';
        searchResults.classList.remove('hidden');
    }
});

// Hide search when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

// --- INITIALIZE ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    prepSearch();
});
