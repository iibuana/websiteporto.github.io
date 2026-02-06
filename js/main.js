document.addEventListener('DOMContentLoaded', () => {

    // --- 0. PHOTOGRAPHY PORTFOLIO (Auto-Detect System) ---
    // User checks: Just naming files 1.jpg, 2.jpg... inside the folders.
    const albumCategories = {
        "portrait": { title: "Portraiture", folder: "portrait", count: 20 },
        "nature": { title: "Nature", folder: "landscape", count: 20 }, // Renamed from Landscape
        "details": { title: "Details & Moments", folder: "wisuda", count: 20 },
        "wedding": { title: "Wedding Stories", folder: "wedding", count: 20 }
    };

    function initPhotographySystem() {
        console.log("Initializing Album System (Auto-Detect)...");
        const albumsView = document.getElementById('albums-view');
        const galleryView = document.getElementById('gallery-view');
        const grid = document.getElementById('photo-grid');
        const backBtn = document.getElementById('back-to-albums');
        const galleryTitle = document.getElementById('gallery-title');

        if (!albumsView || !galleryView) return;

        // 1. Render Album Cards
        albumsView.innerHTML = '';
        Object.keys(albumCategories).forEach(key => {
            const cat = albumCategories[key];
            const coverImage = `assets/images/${cat.folder}/1.jpg`; // Always use 1.jpg as cover

            const card = document.createElement('div');
            card.className = 'album-card';
            card.onclick = () => openAlbum(key);

            card.innerHTML = `
                <img src="${coverImage}" class="album-cover" alt="${cat.title}" loading="lazy">
                <div class="album-info">
                    <div class="album-title">${cat.title}</div>
                    <div class="album-count">View Gallery</div>
                </div>
            `;
            albumsView.appendChild(card);
        });

        // 2. Navigation Logic
        window.openAlbum = function (albumKey) {
            const cat = albumCategories[albumKey];
            if (!cat) return;

            // Update UI
            if (galleryTitle) galleryTitle.textContent = cat.title;

            // Render Photos (Auto-Generate 1 to N)
            if (grid) {
                grid.innerHTML = '';

                // Try to load images 1 to count
                for (let i = 1; i <= cat.count; i++) {
                    const src = `assets/images/${cat.folder}/${i}.jpg`;

                    const item = document.createElement('div');
                    item.className = 'photo-item';
                    item.style.display = 'none'; // Initially hidden

                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `${cat.title} ${i}`;
                    img.loading = "lazy";

                    // AUTO-DETECT LOGIC:
                    // If loads: Show it.
                    // If fails: Remove it.
                    img.onload = function () {
                        item.style.display = 'block';
                    };
                    img.onerror = function () {
                        item.remove();
                    };

                    const overlay = document.createElement('div');
                    overlay.className = 'photo-overlay';

                    item.appendChild(img);
                    item.appendChild(overlay);
                    grid.appendChild(item);
                }
            }

            // Switch View
            albumsView.classList.add('hidden');
            galleryView.classList.remove('hidden');

            // Scroll
            const section = document.getElementById('photography');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        };

        if (backBtn) {
            backBtn.onclick = () => {
                galleryView.classList.add('hidden');
                albumsView.classList.remove('hidden');
            };
        }
    }

    // Run Immediately
    initPhotographySystem();

    // --- 1. KONFIGURASI ALBUM (Folder Based) ---
    const albumsConfig = {
        cinematography: [
            {
                title: "Cinematic Reel",
                subtitle: "Short Social Media Content",
                folder: "reel",
                // Use an existing image folder for poster fallback
                poster: "assets/images/wedding/1.jpg",
                // YOUTUBE VIDEOS (Use "youtube:" prefix or just ID)
                videos: [
                    "https://youtube.com/shorts/v2cWKYKMazY?feature=share", // STANDARD VIDEO (4K Nature) for testing
                    "https://youtube.com/shorts/FlMNpQ1Rku0?feature=share",
                    "https://youtube.com/shorts/97zgS5Lc9N4?feature=share",
                    "https://youtu.be/ckeCT3sEp3Q", // STANDARD VIDEO (4K Nature) for testing
                    "https://youtube.com/shorts/4gqtaBUlTEY?feature=share",
                    "https://youtu.be/hVQRW1wY1rI",
                    "https://youtube.com/shorts/R4XVyfdvLdI",
                    "https://youtube.com/shorts/j5aY29AmNsg?feature=share"
                ]
            },
            {
                title: "Wedding Film",
                subtitle: "Eternal Love",
                folder: "wedding_film",
                poster: "assets/images/wedding/1.jpg"
            },
            {
                title: "Commercial",
                subtitle: "Brand Campaign",
                folder: "commercial",
                poster: "assets/images/portrait/1.jpg"

            },
            {
                title: "Short Film",
                subtitle: "Short Film",
                folder: "documentary",
                poster: "assets/images/landscape/1.jpg"

            }
        ],    /* 
       CARA MENGGUNAKAN VIDEO GOOGLE DRIVE / LINK EKSTERNAL:
       Tambahkan property 'videos' berisi array link videonya secara manual.
       Contoh:
       {
           title: "My Drive Video",
           subtitle: "Hosted on Drive",
           folder: "ignored", 
           poster: "assets/images/cover.jpg",
           videos: [
               "https://drive.google.com/uc?export=download&id=FULL_VIDEO_ID_HERE",
               "https://drive.google.com/uc?export=download&id=ANOTHER_VIDEO_ID"
           ]
       }
    */
    };

    // --- 1.5 HELPER FUNCTIONS ---
    // Helper: Check if video exists by trying to load it
    // Helper: Check if video exists by trying to load it
    // Helper: Check if video exists
    // HYBRID STRATEGY: Use fetch() for Web (faster), fallback to Video Element for Local (file://)
    function checkVideoExists(url) {
        return new Promise((resolve) => {
            // Strategy A: HTTP/HTTPS (GitHub Pages, Server)
            if (window.location.protocol.startsWith('http')) {
                fetch(url, { method: 'HEAD' })
                    .then(res => {
                        if (res.ok) resolve(true);
                        else resolve(false);
                    })
                    .catch(() => {
                        // If fetch fails (CORS etc), try fallback
                        checkVideoFallback(url).then(resolve);
                    });
            } else {
                // Strategy B: Local File System (file://)
                checkVideoFallback(url).then(resolve);
            }
        });
    }

    // Classic Video Element Method (Reliable for local files, but needs timeout)
    function checkVideoFallback(url) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = url;
            video.onloadedmetadata = () => resolve(true);
            video.onerror = () => resolve(false);
            // Longer timeout for safety
            setTimeout(() => {
                video.src = "";
                resolve(false);
            }, 5000);
        });
    }

    // --- 2. GENERATE HTML (Render Albums) ---
    // --- 2. GENERATE HTML (Render Albums) ---
    // --- 2. GENERATE HTML (Render Albums) ---
    function renderAlbums() {
        const videoContainer = document.getElementById('video-scroller');
        if (!videoContainer) return;

        videoContainer.innerHTML = ''; // Clear existing

        // Check availability
        if (!albumsConfig || !albumsConfig.cinematography) return;

        // Loop through ALBUMS
        albumsConfig.cinematography.forEach(album => {
            // Loop through VIDEOS in the album
            if (album.videos && album.videos.length > 0) {
                album.videos.forEach((videoUrl, index) => {
                    const ytId = getYouTubeId(videoUrl);
                    if (ytId) {
                        const isShorts = videoUrl.includes('/shorts/');
                        const orientationClass = isShorts ? 'video-vertical' : 'video-horizontal';
                        const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

                        // Create Card Container
                        const card = document.createElement('div');
                        card.className = `media-element ${orientationClass}`;
                        card.setAttribute('data-yt-id', ytId);
                        card.setAttribute('data-thumb', thumbUrl);
                        card.setAttribute('onclick', 'playVideo(this)');

                        // Initial Content: Thumbnail + Play Button
                        card.innerHTML = `
                            <div class="video-thumbnail" style="background-image: url('${thumbUrl}')"></div>
                            <div class="play-overlay">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                         `;

                        videoContainer.appendChild(card);
                    }
                });
            }
        });
    }

    // Global function for click handler
    window.playVideo = function (card) {
        const ytId = card.getAttribute('data-yt-id');
        const isPlaying = card.classList.contains('video-playing');

        // 1. Reset ANY currently playing video
        const currentPlaying = document.querySelector('.media-element.video-playing');
        if (currentPlaying && currentPlaying !== card) {
            const oldThumb = currentPlaying.getAttribute('data-thumb');
            currentPlaying.classList.remove('video-playing');
            currentPlaying.innerHTML = `
                <div class="video-thumbnail" style="background-image: url('${oldThumb}')"></div>
                <div class="play-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            `;
        }

        // 2. Play THIS video (if not already playing)
        if (!isPlaying) {
            card.classList.add('video-playing');
            card.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0&playsinline=1" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    style="width: 100%; height: 100%; border: none;">
                </iframe>
            `;
        }
    };

    renderAlbums(); // Execute immediately

    // Photos rendered at start
    // renderPhotos removed from here

    // --- 4. ANIMATIONS & UI ---

    // Hero Animation
    const heroElements = document.querySelectorAll('.reveal-text');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('active');
        }, 100 + (index * 200));
    });

    // Scroll Observer
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    // Theme Toggle
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    applyTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            applyTheme(current === 'light' ? 'dark' : 'light');
        });
    }

    function getYouTubeId(url) {
        if (!url) return null;
        if (url.startsWith('youtube:')) return url.split(':')[1];

        // Support Shorts, standard watch, and shortened URLs
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

});
