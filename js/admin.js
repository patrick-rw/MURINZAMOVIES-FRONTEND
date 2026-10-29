// frontend/js/admin.js
const API_URL = 'https://murinzamoviess.onrender.com/api';
let allMoviesData = [];

// 1. Create the Card
function createAdminMovieCard(movie) {
    return `
        <div class="movie-card-container block w-[160px] md:w-[200px] flex-shrink-0 relative group">
            <div class="relative rounded-lg overflow-hidden aspect-[2/3] bg-gray-800 border border-gray-700/50 mb-2">
                <img src="${movie.posterUrl}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                
                <div class="admin-overlay absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-2">
                    <button onclick="openEditModal('${movie._id}')" class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-3 py-1.5 rounded w-24">Edit</button>
                    <button onclick="deleteMovie('${movie._id}')" class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded w-24">Delete</button>
                </div>
                
                <div class="absolute top-2 left-2 flex flex-col space-y-1 pointer-events-none">
                    ${movie.genre ? `<span class="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-max">${movie.genre}</span>` : ''}
                </div>
                <div class="absolute bottom-0 w-full p-2 card-gradient pointer-events-none">
                    <h4 class="text-sm font-bold text-white truncate">${movie.title}</h4>
                </div>
            </div>
        </div>
    `;
}

// 2. Load Data
async function loadAdminData() {
    try {
        const res = await fetch(`${API_URL}/movies`);
        allMoviesData = await res.json();

        if (allMoviesData.length === 0) {
            document.getElementById('sectionsContainer').innerHTML = '<p class="text-center text-gray-500 mt-10">No movies yet. Add one below!</p>';
            return;
        }

        // Setup Hero
        const heroMovie = allMoviesData.find(m => m.isTrending) || allMoviesData[0];
        document.getElementById('heroSection').classList.remove('hidden');
        document.getElementById('heroTitle').innerText = heroMovie.title;
        if(heroMovie.posterUrl) document.getElementById('heroImage').style.backgroundImage = `url('${heroMovie.posterUrl}')`;
        document.getElementById('heroEditBtn').onclick = () => openEditModal(heroMovie._id);

        // Group & Render
        const categories = [...new Set(allMoviesData.map(m => m.category))];
        const container = document.getElementById('sectionsContainer');
        
        let sectionsHTML = '';
        categories.forEach(cat => {
            const catMovies = allMoviesData.filter(m => m.category === cat);
            sectionsHTML += `
                <div class="mb-12">
                    <div class="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                        <h2 class="text-2xl font-bold border-l-4 border-blue-600 pl-3">${cat}</h2>
                    </div>
                    <div class="flex space-x-4 overflow-x-auto pb-4 snap-x items-center">
                        <button onclick="openAddModal('${cat}')" class="w-[160px] md:w-[200px] aspect-[2/3] flex-shrink-0 bg-gray-900 border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-blue-400 transition add-movie-btn">
                            <span class="text-6xl font-light">+</span>
                            <span class="text-sm font-bold mt-2">Add to ${cat}</span>
                        </button>
                        ${catMovies.map(createAdminMovieCard).join('')}
                    </div>
                </div>
            `;
        });
        container.innerHTML = sectionsHTML;

    } catch (err) {
        console.error("Failed to load", err);
    }
}

// 3. Modal Controls
function openAddModal(defaultCategory = '') {
    document.getElementById('movieForm').reset();
    document.getElementById('movieId').value = '';
    document.getElementById('modalTitle').innerText = 'Add New Movie';
    document.getElementById('category').value = defaultCategory;
    document.getElementById('movieModal').classList.remove('hidden');
}

function openEditModal(id) {
    const movie = allMoviesData.find(m => m._id === id);
    if(!movie) return;

    // Populate text fields
    document.getElementById('movieId').value = movie._id;
    document.getElementById('title').value = movie.title;
    document.getElementById('category').value = movie.category;
    document.getElementById('genre').value = movie.genre || '';
    document.getElementById('posterUrl').value = movie.posterUrl || '';
    document.getElementById('description').value = movie.description || '';
    document.getElementById('isTrending').checked = movie.isTrending || false;

    // CRITICAL FIX: Safely extract the URL. If no link exists, leave it blank.
    if (movie.watchLinks && movie.watchLinks.length > 0 && movie.watchLinks[0].url) {
        document.getElementById('watchUrl').value = movie.watchLinks[0].url;
    } else {
        document.getElementById('watchUrl').value = ''; // Force blank
    }

    if (movie.downloadLinks && movie.downloadLinks.length > 0 && movie.downloadLinks[0].url) {
        document.getElementById('downloadUrl').value = movie.downloadLinks[0].url;
    } else {
        document.getElementById('downloadUrl').value = ''; // Force blank
    }

    document.getElementById('modalTitle').innerText = 'Edit Movie';
    document.getElementById('movieModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('movieModal').classList.add('hidden');
}

// 4. Save (Add or Update)
document.getElementById('movieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('movieId').value;
    const saveBtn = document.getElementById('saveBtn');
    
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    // Get raw values, trimming spaces
    const watchUrlValue = document.getElementById('watchUrl').value.trim();
    const downloadUrlValue = document.getElementById('downloadUrl').value.trim();

    // Build data object
    const movieData = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        posterUrl: document.getElementById('posterUrl').value.trim(),
        description: document.getElementById('description').value.trim(),
        isTrending: document.getElementById('isTrending').checked,
        // Only send the array if there is actually a link typed in
        watchLinks: watchUrlValue ? [{ quality: "Part A", url: watchUrlValue }] : [],
        downloadLinks: downloadUrlValue ? [{ quality: "Part A", url: downloadUrlValue }] : []
    };

    try {
        const url = id ? `${API_URL}/movies/${id}` : `${API_URL}/movies`;
        const method = id ? 'PUT' : 'POST'; 

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });

        if(res.ok) {
            closeModal();
            loadAdminData(); // Refresh the UI
        } else {
            alert("Error saving movie. Check console.");
        }
    } catch(err) {
        console.error(err);
        alert("Network error.");
    } finally {
        saveBtn.innerText = "Save Movie";
        saveBtn.disabled = false;
    }
});

// 5. Delete
async function deleteMovie(id) {
    if(!confirm("Are you sure you want to delete this movie?")) return;
    try {
        const res = await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' });
        if(res.ok) loadAdminData();
    } catch(err) {
        alert("Error deleting");
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadAdminData);
