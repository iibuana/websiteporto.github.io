document.addEventListener('DOMContentLoaded', () => {

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
                    "https://youtube.com/shorts/97zgS5Lc9N4?feature=share", // Placeholder for user 
                    "https://youtube.com/shorts/FlMNpQ1Rku0?feature=share",
                    "https://youtube.com/shorts/v2cWKYKMazY?feature=share",
                    "https://youtube.com/shorts/4gqtaBUlTEY?feature=share"
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
                poster: "assets/images/portrait/1.jpg",
                videos: [
                    "https://youtube.com/shorts/97zgS5Lc9N4?feature=share", // Placeholder for user 
                    "https://youtube.com/shorts/FlMNpQ1Rku0?feature=share",
                    "https://youtube.com/shorts/v2cWKYKMazY?feature=share",
                    "https://youtube.com/shorts/4gqtaBUlTEY?feature=share"
                ]
            },
            {
                title: "Short Film",
                subtitle: "Short Film",
                folder: "documentary",
                poster: "assets/images/landscape/1.jpg",
                videos: [
                    "https://youtube.com/shorts/97zgS5Lc9N4?feature=share", // Placeholder for user 
                    "https://youtube.com/shorts/FlMNpQ1Rku0?feature=share",
                    "https://youtube.com/shorts/v2cWKYKMazY?feature=share",
                    "https://youtube.com/shorts/4gqtaBUlTEY?feature=share"
                ]
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
    async function renderAlbums() {
        const videoContainer = document.getElementById('video-scroller');

        if (videoContainer) {
            videoContainer.innerHTML = ''; // Clear existing

            // Check all albums in parallel
            const checks = albumsConfig.cinematography.map(async (album, originalIndex) => {
                // Priority 1: Check for explicit external videos
                if (album.videos && album.videos.length > 0) {
                    return { album, originalIndex, hasVideo: true, videoSrc: album.videos[0] };
                }

                // Priority 2: Check for local 1.mp4
                const localPath = `assets/videos/${album.folder}/1.mp4`;
                const hasVideo = await checkVideoExists(localPath);
                return { album, originalIndex, hasVideo, videoSrc: localPath };
            });

            const results = await Promise.all(checks);

            results.forEach(({ album, originalIndex, hasVideo, videoSrc }) => {
                if (hasVideo) {
                    const html = `
                        <div class="media-element video-element" data-index="${originalIndex}">
                            <video src="${videoSrc}" 
                                 class="placeholder-media" 
                                 poster="${album.poster}"
                                 muted loop autoplay playsinline
                                 onmouseover="this.play()" 
                                 onmouseout="this.play()"
                                 onerror="this.src=''; this.poster='assets/images/video-placeholder.jpg';"> 
                            </video>
                            
                            <div class="play-button">▶</div>
                            <div class="media-caption">
                                <h3>${album.title}</h3>
                                <p>${album.subtitle}</p>
                            </div>
                        </div>
                    `;
                    videoContainer.insertAdjacentHTML('beforeend', html);
                } else {
                    console.log(`Hidden album: ${album.title} (Reason: 1.mp4 not found)`);
                }
            });

        }
    }

    renderAlbums(); // Execute immediately

    // --- 3. ANIMATIONS & UI ---

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

    // --- 4. INFINITE SCROLL LOGIC REMOVED ---


    // --- 5. DYNAMIC VIDEO LOADING (MODAL) ---
    const modal = document.getElementById('album-modal');
    const modalContainer = document.querySelector('.modal-media-container');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentPlaylist = []; // Array of video URLs found
    let currentPlaylistIndex = 0;
    let currentAlbumConfig = null;

    let currentScannerId = 0; // Token to cancel old scans

    // Scanner Function
    function VideoScanner(folderName, startIndex = 1, scannerId) {
        return new Promise(async (resolve) => {
            let videos = [];
            let index = startIndex;
            let searching = true;
            const maxLimit = 20; // Safety limit to prevent infinite loops

            console.log(`[Scanner #${scannerId}] Scanning ${folderName} from ${index}...`);

            while (searching && index < maxLimit) {
                // Check if this scanner was cancelled
                if (scannerId !== currentScannerId) {
                    console.log(`[Scanner #${scannerId}] Aborted.`);
                    resolve([]); // Stop immediately
                    return;
                }

                const path = `assets/videos/${folderName}/${index}.mp4`;
                const exists = await checkVideoExists(path);

                if (exists) {
                    console.log(`Found: ${path}`);
                    videos.push(path);
                    index++;
                } else {
                    console.log(`Not found (stops scanning): ${path}`);
                    searching = false;
                }
            }
            resolve(videos);
        });
    }

    // Modal Event Delegation
    document.addEventListener('click', async (e) => {
        const item = e.target.closest('.media-element');
        if (!item) return;

        const index = item.getAttribute('data-index');
        if (index === null) return;

        currentAlbumConfig = albumsConfig.cinematography[parseInt(index)];
        console.log("Opening album:", currentAlbumConfig.title);

        // --- OPTIMISTIC LOADING START ---
        // 1. Open Modal Immediately
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        currentScannerId++; // Invalidate old scans
        const myScannerId = currentScannerId;

        // Cleanup previous media first
        const legacyTracks = modalContainer.querySelectorAll('.carousel-track');
        legacyTracks.forEach(t => t.remove()); // Force clean start
        const legacyMedia = modalContainer.querySelectorAll('.modal-media');
        legacyMedia.forEach(m => m.remove());

        // 2. Determine Playlist Source
        if (currentAlbumConfig.videos && currentAlbumConfig.videos.length > 0) {
            // EXTERNAL / EXPLICIT MODE
            currentPlaylist = currentAlbumConfig.videos;
            currentPlaylistIndex = 0;
            console.log("Using explicit video list (External Mode). Total:", currentPlaylist.length);

            // Render immediately
            updateModalContent();
            updateModalUI();
        } else {
            // LOCAL FOLDER SCAN MODE
            // Play first video (we assume it exists because renderAlbums checked it)
            const firstVideo = `assets/videos/${currentAlbumConfig.folder}/1.mp4`;
            currentPlaylist = [firstVideo];
            currentPlaylistIndex = 0;

            // Render & Play Immediately
            updateModalContent();

            // 3. Background Scan for MORE (starting from 2)
            // Update UI to show "Video 1 / ?"
            modalDesc.textContent = `Video 1 / ...`;

            // Pass ID to scanner
            const moreVideos = await VideoScanner(currentAlbumConfig.folder, 2, myScannerId);

            // Only update if we are still the active scanner
            if (myScannerId === currentScannerId) {
                if (moreVideos.length > 0) {
                    // Append found videos to playlist
                    currentPlaylist = [...currentPlaylist, ...moreVideos];

                    console.log("Background scan found videos. Total:", currentPlaylist.length);
                    console.log("Current Playlist:", JSON.stringify(currentPlaylist)); // DEBUG

                    updateModalUI();
                    updateModalContent(); // Refresh UI with new slides
                } else {
                    console.log("No more videos found.");
                    // Even if no more found, if we only have 2, duplicate 'em now
                    // if (currentPlaylist.length === 2) {
                    //     currentPlaylist = [...currentPlaylist, ...currentPlaylist];
                    //     updateModalContent();
                    // }
                    updateModalUI(); // Remove "..."
                }
            }
        }

        // --- OPTIMISTIC LOADING END ---
    });

    function updateModalUI() {
        modalTitle.textContent = currentAlbumConfig.title;
        modalDesc.textContent = `Video ${currentPlaylistIndex + 1} / ${currentPlaylist.length}`;
        // Can add logic here to show/hide next/prev buttons based on length
    }

    function updateModalContent() {
        console.log("updateModalContent called. Playlist length:", currentPlaylist.length);
        if (currentPlaylist.length === 0) {
            console.error("Playlist is empty!");
            return;
        }

        // 1. Ensure Track Exists
        // 1. Ensure Track Exists
        let track = modalContainer.querySelector('.carousel-track');
        if (!track) {
            // Remove legacy media if present
            const legacy = modalContainer.querySelector('.modal-media');
            if (legacy) legacy.remove();

            track = document.createElement('div');
            track.className = 'carousel-track';
            // Insert at top, before caption
            modalContainer.prepend(track);
        }

        // 2. Sync DOM with Playlist
        currentPlaylist.forEach((url, i) => {
            const ytId = getYouTubeId(url);
            let item = track.querySelector(`[data-vid-index="${i}"]`);

            if (!item) {
                if (ytId) {
                    // CREATE YOUTUBE IFRAME
                    item = document.createElement('iframe');
                    item.className = 'carousel-item';
                    item.src = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&controls=0&rel=0&playsinline=1&iv_load_policy=3`;
                    item.allow = "autoplay; encrypted-media";
                    item.allow = "autoplay; encrypted-media";
                    item.setAttribute('data-vid-index', i);
                    item.setAttribute('frameborder', '0');
                    // Force styles inline to bypass any CSS selector issues
                    item.style.width = "100%";
                    item.style.height = "100%";
                    item.style.objectFit = "contain";
                } else {
                    // CREATE STANDARD VIDEO
                    item = document.createElement('video');
                    item.className = 'carousel-item';
                    item.src = url;
                    item.setAttribute('data-vid-index', i);
                    item.setAttribute('playsinline', '');
                    item.setAttribute('webkit-playsinline', '');
                    item.preload = 'auto';
                }
                track.appendChild(item);
            }

            // 3. Update Classes & State
            item.className = 'carousel-item'; // Reset baseline

            // Calculate Linear Indices (No Modulo)
            const prevIndex = currentPlaylistIndex > 0 ? currentPlaylistIndex - 1 : -1;
            const nextIndex = currentPlaylistIndex < len - 1 ? currentPlaylistIndex + 1 : -1;

            // Reset all first
            item.classList.remove('active', 'prev', 'next', 'hidden');
            item.style.display = 'block';

            if (i === currentPlaylistIndex) {
                item.classList.add('active');
                if (ytId) {
                    if (!item.src.includes('autoplay=1')) item.src += "&autoplay=1&mute=1";
                } else {
                    item.muted = false;
                    const playPromise = item.play();
                    if (playPromise !== undefined) playPromise.catch(() => { });
                    item.controls = true;
                }
            } else if (i === prevIndex) {
                item.classList.add('prev');
                pauseItem(item, ytId);
            } else if (i === nextIndex) {
                item.classList.add('next');
                pauseItem(item, ytId);
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
                pauseItem(item, ytId);
            }
        });

        modalTitle.textContent = currentAlbumConfig.title;
        updateModalUI();
    }

    function getYouTubeId(url) {
        if (!url) return null;
        if (url.startsWith('youtube:')) return url.split(':')[1];

        // Support Shorts, standard watch, and shortened URLs
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function pauseItem(item, isYoutube) {
        if (isYoutube) {
            // Reset src to stop youtube video
            // We use 'postMessage' if we enabled JS API, but src reset is brute-force reliable
            const src = item.src;
            // A simple src reset stops the video
            item.src = src;
        } else {
            item.controls = false;
            item.pause();
            item.muted = true;
        }
    }

    // Close Modal Controls
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === document.querySelector('.modal-content')) {
            closeModal();
        }
    });

    function closeModal() {
        currentScannerId++; // Stop any running background scans
        modal.classList.remove('open');
        document.body.style.overflow = '';

        // Stop all videos
        const videos = modalContainer.querySelectorAll('video');
        videos.forEach(v => {
            v.pause();
            v.src = "";
            v.load();
        });
        modalContainer.innerHTML = ''; // Deep clean
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPlaylist.length > 0 && currentPlaylistIndex < currentPlaylist.length - 1) {
                currentPlaylistIndex++;
                updateModalContent();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPlaylist.length > 0 && currentPlaylistIndex > 0) {
                currentPlaylistIndex--;
                updateModalContent();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('open')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
        if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
    });

});
