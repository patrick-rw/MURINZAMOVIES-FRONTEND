// frontend/js/admin.js

// Make sure this URL matches your Render URL EXACTLY. 
// It should start with https:// and end with /api
const API_URL = 'https://murinzamoviess.onrender.com/api';

document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const submitBtn = document.getElementById('submitBtn');
    const messageBox = document.getElementById('message');
    
    // Reset UI
    submitBtn.innerText = "Uploading... Please wait (Render might be waking up)";
    submitBtn.disabled = true;
    messageBox.classList.add('hidden');

    // Gather Data
    const watchUrl = document.getElementById('watchUrl').value.trim();
    const downloadUrl = document.getElementById('downloadUrl').value.trim();
    
    // Only add links if the user typed something
    const watchLinks = watchUrl ? [{ quality: "Part A", url: watchUrl }] : [];
    const downloadLinks = downloadUrl ? [{ quality: "Part A", url: downloadUrl }] : [];

    const movieData = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        posterUrl: document.getElementById('posterUrl').value.trim(),
        description: document.getElementById('description').value.trim(),
        isTrending: document.getElementById('isTrending').checked,
        watchLinks: watchLinks,
        downloadLinks: downloadLinks
    };

    console.log("Attempting to send data to:", `${API_URL}/movies`);
    console.log("Data being sent:", movieData);

    try {
        const res = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });
        
        console.log("Response Status Code:", res.status);

        if (res.ok) {
            const savedMovie = await res.json();
            console.log("Success! Saved Movie:", savedMovie);
            
            messageBox.innerText = "✅ Movie uploaded successfully! It is now live.";
            messageBox.className = "mt-4 text-center text-green-400 font-bold p-3 bg-green-900/30 rounded border border-green-800";
            messageBox.classList.remove('hidden');
            e.target.reset();
        } else {
            const errData = await res.json();
            console.error("Backend Error Response:", errData);
            messageBox.innerText = `❌ Error: ${errData.error || 'Failed to upload'}`;
            messageBox.className = "mt-4 text-center text-red-400 font-bold p-3 bg-red-900/30 rounded border border-red-800";
            messageBox.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Network/Fetch Error:", err);
        messageBox.innerText = "❌ Network Error. Please check your internet or wait 30 seconds and try again (Backend waking up).";
        messageBox.className = "mt-4 text-center text-red-400 font-bold p-3 bg-red-900/30 rounded border border-red-800";
        messageBox.classList.remove('hidden');
    } finally {
        submitBtn.innerText = "Upload Movie to Database";
        submitBtn.disabled = false;
    }
});
