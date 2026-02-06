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
                    const baseSrc = `assets/images/${cat.folder}/${i}`;

                    const item = document.createElement('div');
                    item.className = 'photo-item';
                    // item.style.display = 'none'; // REMOVED: Keep display block for skeleton to work

                    const img = document.createElement('img');
                    img.alt = `${cat.title} ${i}`;
                    // Optimization: Load first 4 images eagerly, rest lazily
                    img.loading = (i <= 4) ? "eager" : "lazy";

                    // Initially hide image (opacity 0) to fade in
                    img.style.opacity = "0";
                    img.style.transition = "opacity 0.5s ease";

                    // RETRY LOGIC (Case Insensitive Support)
                    const extensions = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG'];
                    let extIndex = 0;

                    function tryLoad() {
                        if (extIndex >= extensions.length) {
                            item.remove(); // All failed
                            return;
                        }
                        img.src = baseSrc + extensions[extIndex];
                    }

                    // AUTO-DETECT LOGIC:
                    img.onload = function () {
                        // Reveal image
                        img.style.opacity = "1";
                        // Stop skeleton pulse
                        item.style.animation = "none";
                        item.style.backgroundColor = "transparent";
                        item.style.minHeight = "auto"; // Let image dictate height
                    };

                    img.onerror = function () {
                        extIndex++;
                        tryLoad(); // Try next extension
                    };

                    // Start Loading
                    tryLoad();

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

    // --- 3. VIDEO ALBUM SYSTEM ---
    const videoAlbums = {
        "reel": {
            title: "Cinematic Reel",
            cover: "assets/images/wedding/1.jpg", // Fallback cover
            videos: [
                "https://youtube.com/shorts/v2cWKYKMazY?feature=share",
                "https://youtube.com/shorts/FlMNpQ1Rku0?feature=share",
                "https://youtube.com/shorts/4gqtaBUlTEY?feature=share",
                "https://youtu.be/ckeCT3sEp3Q"
            ]
        },
        "wedding_film": {
            title: "Wedding Films",
            cover: "assets/images/wedding/1.jpg",
            videos: [
                "https://youtube.com/shorts/97zgS5Lc9N4?feature=share",
                "https://youtube.com/shorts/R4XVyfdvLdI",
                "https://youtube.com/shorts/j5aY29AmNsg?feature=share"
            ]
        },
        "commercial": {
            title: "Commercial",
            cover: "assets/images/portrait/1.jpg",
            videos: ["https://youtu.be/hVQRW1wY1rI"]
        }
    };

    function initVideoSystem() {
        console.log("Initializing Video System...");
        const vAlbumsView = document.getElementById('video-albums-view');
        const vGalleryView = document.getElementById('video-gallery-view');
        const vGrid = document.getElementById('video-grid');
        const vBackBtn = document.getElementById('back-to-video-albums');
        const vTitle = document.getElementById('video-gallery-title');

        if (!vAlbumsView || !vGalleryView) return;

        // Render Albums
        vAlbumsView.innerHTML = '';
        Object.keys(videoAlbums).forEach(key => {
            const album = videoAlbums[key];
            const count = album.videos.length;

            // Get Thumbnail of FIRST video as Cover (if youtube)
            let coverImg = album.cover;
            if (album.videos.length > 0) {
                const ytId = getYouTubeId(album.videos[0]);
                if (ytId) coverImg = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            }

            const card = document.createElement('div');
            card.className = 'album-card';
            card.onclick = () => openVideoAlbum(key);

            card.innerHTML = `
                <img src="${coverImg}" class="album-cover" alt="${album.title}" loading="lazy">
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-count">${count} Videos</div>
                </div>
            `;
            vAlbumsView.appendChild(card);
        });

        // Open Album Logic
        window.openVideoAlbum = function (key) {
            const album = videoAlbums[key];
            if (!album) return;

            if (vTitle) vTitle.textContent = album.title;
            vGrid.innerHTML = '';

            // Render Videos
            album.videos.forEach(url => {
                const ytId = getYouTubeId(url);
                if (ytId) {
                    const isShorts = url.includes('/shorts/');
                    // Determine orientation based on URL type (assumption)
                    // Or just use a standard card? 
                    // Let's use the .photo-item style but for video

                    const item = document.createElement('div');
                    item.className = 'photo-item';
                    // Force ratio for visual consistency? 
                    // Or let it be masonry? 
                    // Let's assume standard vertical for shorts, horizontal for normal

                    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

                    item.innerHTML = `
                        <div class="video-thumbnail-container" onclick="playEmbeddedVideo(this, '${ytId}')">
                             <img src="${thumbUrl}" alt="Video" style="width:100%; display:block;">
                             <div class="play-button">▶</div>
                        </div>
                     `;
                    vGrid.appendChild(item);
                }
            });

            vAlbumsView.classList.add('hidden');
            vGalleryView.classList.remove('hidden');
        };

        if (vBackBtn) {
            vBackBtn.onclick = () => {
                vGrid.innerHTML = ''; // Stop videos
                vGalleryView.classList.add('hidden');
                vAlbumsView.classList.remove('hidden');
            };
        }
    }

    // Helper to play internal video
    window.playEmbeddedVideo = function (container, ytId) {
        container.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
                style="width: 100%; aspect-ratio: 9/16; height: 100%;">
            </iframe>
        `;
        // Adjust aspect ratio if it looks rectangular?
        // Note: You might want to handle resizing via CSS
    };

    // Run
    initVideoSystem();

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
