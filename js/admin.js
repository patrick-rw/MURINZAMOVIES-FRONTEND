const API_URL = 'https://murinzamoviess.onrender.com/api';

// --- 1. LOGIN LOGIC ---
// Set your desired Username and Password here
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "movieshow2026"; // Change this to a strong password!

const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Check if admin is already logged in (saved in browser session)
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showAdminPanel();
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        loginError.classList.add('hidden');
        showAdminPanel();
    } else {
        loginError.classList.remove('hidden');
    }
});

function showAdminPanel() {
    loginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
}

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.reload(); // Reload page to show login screen again
});


// --- 2. ADD MOVIE LOGIC ---
document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

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
