// frontend/js/movie.js
const API_URL = 'https://murinzamoviess.onrender.com/api';
const movieContainer = document.getElementById('movieContainer');

// Get the movie ID from the URL (e.g., movie.html?id=12345)
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

async function loadMovieDetails() {
    if (!movieId) {
        movieContainer.innerHTML = '<div class="text-center mt-20 text-red-500 text-xl font-bold">Movie ID not found in URL.</div>';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/movies/${movieId}`);
        if (!res.ok) throw new Error("Movie not found in database");
        
        const movie = await res.json();

        // Build the Watch Links HTML
        let watchHTML = '';
        if (movie.watchLinks && movie.watchLinks.length > 0) {
            watchHTML = movie.watchLinks.map(link => `
                <div class="flex justify-between items-center bg-[#111827] p-4 rounded-lg border border-gray-800 mb-3">
                    <span class="font-bold text-gray-200">${link.quality}</span>
                    <a href="${link.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-bold text-sm flex items-center transition shadow-lg shadow-blue-600/20">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg> Watch Now
                    </a>
                </div>
            `).join('');
        } else {
            watchHTML = '<p class="text-gray-500 text-sm">No watch links available yet.</p>';
        }

        // Build the Download Links HTML
        let downloadHTML = '';
        if (movie.downloadLinks && movie.downloadLinks.length > 0) {
            downloadHTML = movie.downloadLinks.map(link => `
                <div class="flex justify-between items-center bg-[#111827] p-4 rounded-lg border border-gray-800 mb-3">
                    <span class="font-bold text-gray-200">${link.quality}</span>
                    <a href="${link.url}" target="_blank" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-bold text-sm flex items-center transition shadow-lg shadow-green-600/20">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Download
                    </a>
                </div>
            `).join('');
        } else {
            downloadHTML = '<p class="text-gray-500 text-sm">No download links available yet.</p>';
        }

        // Render the full page
        movieContainer.innerHTML = `
            <!-- Hero Header Image -->
            <div class="relative w-full h-[40vh] md:h-[60vh] bg-cover bg-center" style="background-image: url('${movie.posterUrl}');">
                <div class="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/70 to-transparent"></div>
                
                <!-- Back Button -->
                <div class="absolute top-6 left-4 md:left-8 z-20">
                    <button onclick="window.history.back()" class="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm transition flex items-center text-sm font-bold">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back
                    </button>
                </div>

                <!-- Title & Info over image -->
                <div class="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-4xl z-10">
                    <div class="flex items-center space-x-2 mb-3">
                        <span class="bg-blue-600 text-xs font-bold px-2 py-1 rounded uppercase">${movie.category}</span>
                        ${movie.genre ? `<span class="bg-gray-700 text-xs font-bold px-2 py-1 rounded">${movie.genre}</span>` : ''}
                    </div>
                    <h1 class="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">${movie.title}</h1>
                    <p class="text-gray-300 text-sm md:text-base">Uploaded: ${new Date(movie.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <!-- Content Area -->
            <div class="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                
                <!-- Left Side: Description -->
                <div class="md:col-span-2">
                    <h2 class="text-2xl font-bold mb-4 border-l-4 border-blue-600 pl-3">Storyline</h2>
                    <p class="text-gray-300 leading-relaxed text-sm md:text-base">${movie.description || 'No description available for this movie.'}</p>
                </div>

                <!-- Right Side: Watch & Download Links -->
                <div class="space-y-8">
                    <div>
                        <h2 class="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Watch Online</h2>
                        ${watchHTML}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Download</h2>
                        ${downloadHTML}
                    </div>
                </div>

            </div>
        `;
    } catch (err) {
        console.error(err);
        movieContainer.innerHTML = `
            <div class="text-center mt-20">
                <h1 class="text-3xl text-red-500 font-bold mb-2">Error Loading Movie</h1>
                <p class="text-gray-400">The movie might have been deleted or the backend is asleep. Please try again.</p>
                <button onclick="window.location.href='index.html'" class="mt-6 bg-blue-600 px-6 py-2 rounded">Go Home</button>
            </div>
        `;
    }
}

// Start loading when page opens
document.addEventListener('DOMContentLoaded', loadMovieDetails);
