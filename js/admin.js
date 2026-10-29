const API_URL = 'https://murinzamoviess.onrender.com/api';

document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

    // Prepare Data (Only add links if the user typed something)
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

    try {
        const res = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });
        
        if (res.ok) {
            const messageBox = document.getElementById('message');
            messageBox.innerText = "✅ Movie added successfully!";
            messageBox.classList.remove('hidden');
            e.target.reset();
            window.scrollTo(0, 0);
            setTimeout(() => messageBox.classList.add('hidden'), 4000);
        } else {
            const errData = await res.json();
            alert('Error: ' + errData.error);
        }
    } catch (err) {
        alert('Network error. Check console.');
        console.error(err);
    } finally {
        submitBtn.innerText = "Upload Movie";
        submitBtn.disabled = false;
    }
});
