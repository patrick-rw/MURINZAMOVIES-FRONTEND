// frontend/js/movie.js
const API_URL = 'https://murinzamoviess.onrender.com/api';
const movieContainer = document.getElementById('movie-detail');

// Get the movie ID from the URL (e.g., movie.html?id=12345)
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

async function fetchMovieDetails() {
    if (!movieId) {
        movieContainer.innerHTML = '<p class="text-center text-red-500 mt-20 font-bold text-xl">No movie selected.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/movies/${movieId}`);
        if (!res.ok) throw new Error("Movie not found");
        
        const movie = await res.json();

        // 1. Build Watch Links
        let watchLinksHTML = '';
        if (movie.watchLinks && movie.watchLinks.length > 0) {
            watchLinksHTML = movie.watchLinks.map(link => `
                <div class="flex justify-between items-center bg-[#111827] p-4 rounded-lg mb-3 border border-gray-700 hover:border-blue-500 transition">
                    <span class="font-semibold text-white">${link.quality || 'Watch Online'}</span>
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-bold flex items-center text-white transition shadow-lg shadow-blue-600/30">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg> Watch Now
                    </a>
                </div>
            `).join('');
        } else {
            watchLinksHTML = '<p class="text-gray-500 text-sm italic py-2">No watch links available yet.</p>';
        }

        // 2. Build Download Links
        let downloadLinksHTML = '';
        if (movie.downloadLinks && movie.downloadLinks.length > 0) {
            downloadLinksHTML = movie.downloadLinks.map(link => `
                <div class="flex justify-between items-center bg-[#111827] p-4 rounded-lg mb-3 border border-gray-700 hover:border-green-500 transition">
                    <span class="font-semibold text-white">${link.quality || 'Download'}</span>
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-md text-sm font-bold flex items-center text-white transition shadow-lg shadow-green-600/30">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Download
                    </a>
                </div>
            `).join('');
        } else {
            downloadLinksHTML = '<p class="text-gray-500 text-sm italic py-2">No download links available yet.</p>';
        }

        // 3. Render the full page
        movieContainer.innerHTML = `
            <!-- Hero Image -->
            <div class="relative w-full h-[40vh] md:h-[60vh] rounded-xl overflow-hidden mb-8 bg-gray-900 border border-gray-800">
                <img src="${movie.posterUrl}" class="w-full h-full object-cover opacity-40 blur-sm" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/50 to-transparent"></div>
                
                <div class="absolute bottom-0 left-0 p-6 md:p-10 w-full flex flex-col md:flex-row items-end md:items-center gap-6">
                    <img src="${movie.posterUrl}" class="w-32 md:w-48 rounded-lg shadow-2xl border-2 border-gray-700 z-10" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    
                    <div class="z-10 flex-1">
                        <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight drop-shadow-lg">${movie.title}</h1>
                        
                        <div class="flex flex-wrap items-center gap-3 mb-4">
                            <span class="bg-blue-600 text-xs font-bold px-3 py-1 rounded shadow-md uppercase">${movie.category}</span>
                            ${movie.genre ? `<span class="bg-gray-700 text-xs font-bold px-3 py-1 rounded shadow-md uppercase">${movie.genre}</span>` : ''}
                            <span class="text-gray-400 text-sm ml-2">Uploaded: ${new Date(movie.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <p class="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed">${movie.description || 'No description available for this movie.'}</p>
                    </div>
                </div>
            </div>

            <!-- Links Section -->
            <div class="grid md:grid-cols-2 gap-8 mt-4">
                <div class="bg-[#0a0f1c] border border-gray-800 p-6 rounded-xl shadow-xl">
                    <h3 class="text-xl font-bold mb-4 border-b border-gray-800 pb-2 flex items-center">
                        <span class="w-1.5 h-5 bg-blue-600 mr-2 rounded-full"></span> Watch Online
                    </h3>
                    ${watchLinksHTML}
                </div>
                
                <div class="bg-[#0a0f1c] border border-gray-800 p-6 rounded-xl shadow-xl">
                    <h3 class="text-xl font-bold mb-4 border-b border-gray-800 pb-2 flex items-center">
                        <span class="w-1.5 h-5 bg-green-600 mr-2 rounded-full"></span> Download Links
                    </h3>
                    ${downloadLinksHTML}
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        movieContainer.innerHTML = `
            <div class="text-center mt-20">
                <h2 class="text-2xl font-bold text-red-500 mb-2">Movie Not Found</h2>
                <p class="text-gray-400 mb-6">The movie you are looking for does not exist or was deleted.</p>
                <a href="index.html" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold text-white transition">Go Back Home</a>
            </div>
        `;
    }
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', fetchMovieDetails);
