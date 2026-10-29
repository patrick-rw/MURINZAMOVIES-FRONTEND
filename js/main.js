// frontend/js/main.js
const API_URL = 'https://murinzamoviess.onrender.com/api';
let allMoviesData = [];

function createMovieCard(movie) {
    return `
        <a href="movie.html?id=${movie._id}" class="movie-card-container block w-[160px] md:w-[200px] flex-shrink-0 group relative cursor-pointer">
            <div class="relative rounded-lg overflow-hidden aspect-[2/3] bg-gray-800 border border-gray-700/50 mb-2">
                <img src="${movie.posterUrl}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                    ${movie.genre ? `<span class="bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">${movie.genre}</span>` : ''}
                    ${movie.isSeason ? `<span class="bg-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">Season</span>` : ''}
                </div>
                <div class="absolute bottom-0 w-full p-2 card-gradient">
                    <h4 class="text-sm font-bold text-white truncate">${movie.title}</h4>
                </div>
            </div>
            <div class="flex justify-between items-center text-[10px] text-gray-400">
                <span>${movie.uploader || 'Admin'}</span>
                <span>${new Date(movie.createdAt).toLocaleDateString()}</span>
            </div>
        </a>
    `;
}

async function loadHomepage() {
    try {
        const res = await fetch(`${API_URL}/movies`);
        allMoviesData = await res.json();

        if (allMoviesData.length === 0) {
            document.getElementById('sectionsContainer').innerHTML = '<p class="text-center text-gray-500 mt-10">No movies found. Go to Admin Panel to add some.</p>';
            return;
        }

        // 1. Setup Hero Section (Use the first trending or first movie)
        const heroMovie = allMoviesData.find(m => m.isTrending) || allMoviesData[0];
        document.getElementById('heroTitle').innerText = heroMovie.title;
        document.getElementById('heroDesc').innerText = heroMovie.description || 'No description available.';
        document.getElementById('heroUploader').innerText = heroMovie.uploader || 'Admin';
        if(heroMovie.posterUrl) document.getElementById('heroImage').style.backgroundImage = `url('${heroMovie.posterUrl}')`;
        document.getElementById('heroBtn').onclick = () => window.location.href = `movie.html?id=${heroMovie._id}`;

        // 2. Group by Category and Render
        const categories = [...new Set(allMoviesData.map(m => m.category))];
        const container = document.getElementById('sectionsContainer');
        
        let sectionsHTML = '';
        categories.forEach(cat => {
            const catMovies = allMoviesData.filter(m => m.category === cat);
            
            sectionsHTML += `
                <div class="mb-10">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold border-l-4 border-blue-600 pl-3">${cat}</h2>
                        <a href="#" class="text-sm text-blue-400 hover:text-blue-300">View More &rarr;</a>
                    </div>
                    <div class="flex space-x-4 overflow-x-auto pb-4 snap-x">
                        ${catMovies.map(createMovieCard).join('')}
                    </div>
                </div>
            `;
        });
        container.innerHTML = sectionsHTML;

    } catch (err) {
        console.error(err);
        alert("Error loading movies. Backend might be waking up.");
    }
}

// Search
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 1) { searchResults.classList.add('hidden'); return; }
    
    const filtered = allMoviesData.filter(m => m.title.toLowerCase().includes(query));
    if (filtered.length > 0) {
        searchResults.innerHTML = filtered.map(m => `
            <a href="movie.html?id=${m._id}" class="flex items-center p-2 hover:bg-gray-700 border-b border-gray-700">
                <img src="${m.posterUrl}" class="w-8 h-12 object-cover rounded mr-3">
                <span class="text-sm font-semibold">${m.title}</span>
            </a>
        `).join('');
    } else {
        searchResults.innerHTML = '<p class="p-3 text-sm text-gray-400">No results found</p>';
    }
    searchResults.classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', loadHomepage);
