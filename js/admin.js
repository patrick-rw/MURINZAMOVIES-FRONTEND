// js/admin.js

// 1. Ensure this URL is EXACTLY your Render URL (no trailing slash)
const API_URL = 'https://murinzamoviess.onrender.com/api';

document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    // 2. THIS IS CRUCIAL: Prevents the page from refreshing
    e.preventDefault(); 
    
    const submitBtn = document.getElementById('submitBtn');
    const messageBox = document.getElementById('message');
    
    submitBtn.innerText = "Uploading... Please wait (Render might be waking up)";
    submitBtn.disabled = true;
    messageBox.classList.add('hidden');

    // Gather data
    const watchUrl = document.getElementById('watchUrl').value;
    const downloadUrl = document.getElementById('downloadUrl').value;
    
    const watchLinks = watchUrl ? [{ quality: "Part A", url: watchUrl }] : [];
    const downloadLinks = downloadUrl ? [{ quality: "Part A", url: downloadUrl }] : [];

    const movieData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        genre: document.getElementById('genre').value,
        posterUrl: document.getElementById('posterUrl').value,
        description: document.getElementById('description').value,
        isTrending: document.getElementById('isTrending').checked,
        watchLinks: watchLinks,
        downloadLinks: downloadLinks
    };

    console.log("Sending data to backend:", movieData);

    try {
        const res = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });
        
        console.log("Response Status:", res.status);

        if (res.ok) {
            messageBox.innerText = "✅ Movie uploaded successfully!";
            messageBox.className = "mt-4 text-center text-green-400 font-bold p-3 bg-green-900/30 rounded border border-green-800";
            messageBox.classList.remove('hidden');
            e.target.reset();
        } else {
            const errData = await res.json();
            console.error("Backend Error:", errData);
            messageBox.innerText = `❌ Error: ${errData.error || 'Failed to upload'}`;
            messageBox.className = "mt-4 text-center text-red-400 font-bold p-3 bg-red-900/30 rounded border border-red-800";
            messageBox.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Network Error:", err);
        messageBox.innerText = "❌ Network Error. The backend might be asleep or unreachable.";
        messageBox.className = "mt-4 text-center text-red-400 font-bold p-3 bg-red-900/30 rounded border border-red-800";
        messageBox.classList.remove('hidden');
    } finally {
        submitBtn.innerText = "Upload Movie to Database";
        submitBtn.disabled = false;
    }
});
