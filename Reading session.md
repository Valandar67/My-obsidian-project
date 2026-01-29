---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// READING SESSION - GLOBAL STYLES & CONFIG
// Sage Green Theme (matching Home.md)
// ==========================================

if (!document.getElementById('reading-session-styles-v2')) {
    const style = document.createElement('style');
    style.id = 'reading-session-styles-v2';
    style.textContent = `
        @keyframes reading-breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(122, 154, 125, 0.03); }
            50% { box-shadow: inset 0 0 40px rgba(122, 154, 125, 0.08); }
        }

        @keyframes reading-float-up {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-80px); opacity: 0; }
        }

        @keyframes reading-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scanline-sweep {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 0.4; }
            100% { top: 100%; opacity: 0; }
        }

        @keyframes book-glow {
            0% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 rgba(122, 154, 125, 0); }
            50% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 30px rgba(122, 154, 125, 0.4); }
            100% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 rgba(122, 154, 125, 0); }
        }

        @keyframes page-flip {
            0% { transform: perspective(400px) rotateY(0deg); }
            30% { transform: perspective(400px) rotateY(-8deg); }
            100% { transform: perspective(400px) rotateY(0deg); }
        }

        .reading-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }
        .reading-modal-overlay.visible {
            background: rgba(0,0,0,0.95); backdrop-filter: blur(4px);
        }
        .reading-modal-content {
            background: #0a0a0a; padding: 32px; border: 1px solid #2a3a2d;
            max-width: 500px; max-height: 85vh; width: 90%;
            display: flex; flex-direction: column; gap: 20px;
            box-shadow: 0 40px 120px rgba(0,0,0,0.9); position: relative;
            opacity: 0; transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .reading-modal-overlay.visible .reading-modal-content {
            opacity: 1; transform: translateY(0);
        }

        .reading-img-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }

        .book-carousel-container {
            touch-action: pan-x !important;
            -webkit-overflow-scrolling: touch;
        }

        .book-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-ring {
            transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-folder-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: #0f0f0f;
            border: 1px solid #2a3a2d;
            margin-bottom: 8px;
            transition: all 0.2s ease;
        }

        .search-folder-item:hover {
            border-color: #7a9a7d;
        }

        .search-folder-remove {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid #3a4a3d;
            color: #5a6a5d;
            cursor: pointer;
            font-size: 14px;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }

        .search-folder-remove:hover {
            border-color: #9a6a6a;
            color: #9a6a6a;
            background: rgba(154, 106, 106, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// Theme - Sage Green (matching Home.md reading)
const READING_THEME = {
    color: "#7a9a7d",
    colorHover: "#8aaa8d",
    colorBorder: "#2a3a2d",
    colorBorderHover: "#3a4a3d",
    colorMuted: "#5a6a5d",
    colorAccent: "#8aaa8d",
    colorProgress: "#7a9a7d",
    colorPages: "#6a8a9a"
};

window.READING_THEME = READING_THEME;
window.VAULT_NAME = "Alt society";

// Settings persistence
const READING_SETTINGS_KEY = 'reading-session-settings-v3';

function loadReadingSettings() {
    try {
        const saved = localStorage.getItem(READING_SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
        booksFolder: "Library/Books",
        sessionsFolder: "Personal Life/03 Reading/Sessions",
        logFile: "Personal Life/03 Reading/Reading Log.md"
    };
}

function saveReadingSettings(settings) {
    try {
        localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
}

window.READING_SETTINGS = loadReadingSettings();

// ==========================================
// SMART PAGE TRACKING - Find highest page from PDF links
// Now accepts per-book trackingFolders from frontmatter
// ==========================================
window.findHighestPageForBook = async function(bookTitle, totalPages, trackingFolders) {
    // trackingFolders comes from the book's frontmatter
    const folders = trackingFolders || [];

    if (folders.length === 0 || !totalPages) {
        return null;
    }

    // Normalize folders array (handle single string or array)
    const searchFolders = Array.isArray(folders) ? folders : [folders];

    // Clean book title for matching (remove author suffix if present)
    const cleanTitle = bookTitle.replace(/\s*-\s*[^-]+$/, '').trim();

    // Regex to find PDF page links: [[BookName.pdf#page=XXX...]]
    // Matches patterns like: [[Plato's Republic - Plato.pdf#page=199&selection=...]]
    const pageRegex = new RegExp(
        `\\[\\[[^\\]]*${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\]]*\\.pdf#page=(\\d+)`,
        'gi'
    );

    let highestPage = 0;
    let foundIn = null;

    // Get all markdown files
    const allFiles = app.vault.getMarkdownFiles();

    // Filter to files in search folders, sorted by mtime (newest first)
    const relevantFiles = allFiles
        .filter(file => {
            return searchFolders.some(folder => {
                const normalizedFolder = folder.endsWith('/') ? folder : folder + '/';
                return file.path.startsWith(folder) || file.path.startsWith(normalizedFolder);
            });
        })
        .sort((a, b) => b.stat.mtime - a.stat.mtime);

    // Search through files (limit to most recent 50 for performance)
    const filesToSearch = relevantFiles.slice(0, 50);

    for (const file of filesToSearch) {
        try {
            const content = await app.vault.cachedRead(file);
            let match;

            while ((match = pageRegex.exec(content)) !== null) {
                const pageNum = parseInt(match[1], 10);
                if (pageNum > highestPage) {
                    highestPage = pageNum;
                    foundIn = file.path;
                }
            }

            // Reset regex for next file
            pageRegex.lastIndex = 0;
        } catch (e) {
            console.warn('Error reading file for page tracking:', file.path, e);
        }
    }

    if (highestPage > 0) {
        const progressPercent = Math.min(100, Math.round((highestPage / totalPages) * 100));
        return {
            currentPage: highestPage,
            totalPages: totalPages,
            percent: progressPercent,
            foundIn: foundIn
        };
    }

    return null;
};

// Helper: Create decorative corners
window.createReadingCorners = function(container, color = READING_THEME.color, size = 16) {
    const corners = [];
    ['TL', 'TR', 'BL', 'BR'].forEach(pos => {
        const corner = document.createElement('div');
        const isTop = pos.includes('T');
        const isLeft = pos.includes('L');
        corner.style.cssText = `
            position: absolute;
            ${isTop ? 'top: 0' : 'bottom: 0'};
            ${isLeft ? 'left: 0' : 'right: 0'};
            width: ${size}px;
            height: ${size}px;
            border-${isTop ? 'top' : 'bottom'}: 1px solid ${color};
            border-${isLeft ? 'left' : 'right'}: 1px solid ${color};
            z-index: 10;
            pointer-events: none;
            transition: all 0.4s ease;
        `;
        corner.dataset.corner = pos;
        corner.dataset.baseSize = size;
        container.appendChild(corner);
        corners.push(corner);
    });
    return corners;
};

// Helper: Floating motes
window.addReadingMotes = function(container, color, count = 3) {
    for (let i = 0; i < count; i++) {
        const mote = document.createElement('div');
        mote.style.cssText = `
            position: absolute;
            bottom: 10%;
            left: ${10 + Math.random() * 80}%;
            width: ${1 + Math.random() * 2}px;
            height: ${1 + Math.random() * 2}px;
            background: ${color};
            border-radius: 50%;
            opacity: 0;
            pointer-events: none;
            animation: reading-float-up ${10 + Math.random() * 8}s ${Math.random() * 12}s ease-out infinite;
            z-index: 1;
        `;
        container.appendChild(mote);
    }
};

dv.paragraph("");
```

```dataviewjs
// ==========================================
// BOOK CAROUSEL - SWIPEABLE BOOK DISPLAY
// Touch-friendly mobile carousel
// ==========================================

const THEME = window.READING_THEME || { color: "#7a9a7d", colorHover: "#8aaa8d", colorBorder: "#2a3a2d", colorMuted: "#5a6a5d", colorAccent: "#8aaa8d" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.READING_SETTINGS || { booksFolder: "Library/Books" };
const createCorners = window.createReadingCorners;
const findHighestPageForBook = window.findHighestPageForBook;

// Get books that are "Currently reading" (in progress)
const books = dv.pages()
    .where(p => {
        // Check if file has book-like properties
        const hasBookMeta = p.title || p.author || p.localCoverImage || p.coverUrl;
        // Only show books that are "in progress"
        const isInProgress = p.Progress === "Currently reading" ||
                            p.Progress === "In progress" ||
                            p.Progress === "Reading";
        return hasBookMeta && isInProgress && p.totalPage;
    })
    .sort(p => p.file.mtime, 'desc')
    .limit(10)
    .array();

// Cache for page progress data
const pageProgressCache = new Map();

// Main container
const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 20px auto;
    padding: 0;
`;

// Card wrapper
const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    overflow: hidden;
    animation: reading-breathe 8s ease-in-out infinite;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// ==========================================
// CAROUSEL SECTION
// ==========================================
const carouselSection = document.createElement('div');
carouselSection.style.cssText = `
    position: relative;
    padding: 24px 16px 16px 16px;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
card.appendChild(carouselSection);

if (books.length === 0) {
    // Empty state
    const emptyMsg = document.createElement('div');
    emptyMsg.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: ${THEME.colorMuted};">
            <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;">📚</div>
            <div style="font-family: 'Times New Roman', serif; font-size: 16px; letter-spacing: 1px; margin-bottom: 8px;">No books in progress</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px; opacity: 0.7;">Set a book's Progress to "Currently reading"</div>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 2px; margin-top: 16px; opacity: 0.5;">ADD trackingFolders TO BOOK FRONTMATTER</div>
        </div>
    `;
    carouselSection.appendChild(emptyMsg);
} else {
    // Current book index
    let currentIndex = 0;

    // Book display area
    const bookDisplay = document.createElement('div');
    bookDisplay.className = 'book-carousel-container';
    bookDisplay.style.cssText = `
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        min-height: 280px;
        overflow: hidden;
    `;
    carouselSection.appendChild(bookDisplay);

    // Navigation arrows
    const leftArrow = document.createElement('div');
    leftArrow.innerHTML = '‹';
    leftArrow.style.cssText = `
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 10, 10, 0.8);
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-size: 24px;
        cursor: pointer;
        z-index: 20;
        transition: all 0.3s ease;
        opacity: ${books.length > 1 ? '1' : '0.3'};
        pointer-events: ${books.length > 1 ? 'auto' : 'none'};
    `;
    leftArrow.onmouseenter = () => { leftArrow.style.borderColor = THEME.color; leftArrow.style.color = THEME.colorHover; };
    leftArrow.onmouseleave = () => { leftArrow.style.borderColor = THEME.colorBorder; leftArrow.style.color = THEME.color; };

    const rightArrow = document.createElement('div');
    rightArrow.innerHTML = '›';
    rightArrow.style.cssText = `
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 10, 10, 0.8);
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-size: 24px;
        cursor: pointer;
        z-index: 20;
        transition: all 0.3s ease;
        opacity: ${books.length > 1 ? '1' : '0.3'};
        pointer-events: ${books.length > 1 ? 'auto' : 'none'};
    `;
    rightArrow.onmouseenter = () => { rightArrow.style.borderColor = THEME.color; rightArrow.style.color = THEME.colorHover; };
    rightArrow.onmouseleave = () => { rightArrow.style.borderColor = THEME.colorBorder; rightArrow.style.color = THEME.color; };

    carouselSection.appendChild(leftArrow);
    carouselSection.appendChild(rightArrow);

    // Book card element
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.style.cssText = `
        width: 180px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        position: relative;
    `;
    bookDisplay.appendChild(bookCard);

    // Book cover container
    const coverContainer = document.createElement('div');
    coverContainer.style.cssText = `
        width: 160px;
        height: 240px;
        background: #111;
        border: 1px solid ${THEME.colorBorder};
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 4px 4px 0 rgba(122, 154, 125, 0.1);
    `;
    bookCard.appendChild(coverContainer);

    // Cover image
    const coverImg = document.createElement('img');
    coverImg.className = 'reading-img-no-drag';
    coverImg.draggable = false;
    coverImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: grayscale(0.3) contrast(1.1) brightness(0.9);
        transition: all 0.4s ease;
    `;
    coverContainer.appendChild(coverImg);

    // Fallback icon
    const fallbackIcon = document.createElement('div');
    fallbackIcon.innerHTML = '📖';
    fallbackIcon.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    coverContainer.appendChild(fallbackIcon);

    // Vignette overlay
    const vignette = document.createElement('div');
    vignette.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%);
        pointer-events: none;
    `;
    coverContainer.appendChild(vignette);

    // Scanline for hover
    const scanline = document.createElement('div');
    scanline.style.cssText = `
        position: absolute;
        top: -100%;
        left: 0;
        right: 0;
        height: 100%;
        background: linear-gradient(180deg, transparent 0%, ${THEME.color}30 50%, transparent 100%);
        pointer-events: none;
        opacity: 0;
    `;
    coverContainer.appendChild(scanline);

    // Book title
    const bookTitle = document.createElement('div');
    bookTitle.style.cssText = `
        margin-top: 16px;
        color: ${THEME.color};
        font-family: "Times New Roman", serif;
        font-size: 14px;
        letter-spacing: 0.5px;
        text-align: center;
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    `;
    bookCard.appendChild(bookTitle);

    // Author
    const bookAuthor = document.createElement('div');
    bookAuthor.style.cssText = `
        margin-top: 4px;
        color: ${THEME.colorMuted};
        font-family: Georgia, serif;
        font-style: italic;
        font-size: 12px;
        text-align: center;
    `;
    bookCard.appendChild(bookAuthor);

    // Progress indicator
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    `;
    bookCard.appendChild(progressContainer);

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 120px;
        height: 4px;
        background: ${THEME.colorBorder};
        border-radius: 2px;
        overflow: hidden;
    `;
    progressContainer.appendChild(progressBar);

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        height: 100%;
        background: ${THEME.colorAccent};
        border-radius: 2px;
        transition: width 0.4s ease;
    `;
    progressBar.appendChild(progressFill);

    const progressText = document.createElement('div');
    progressText.style.cssText = `
        color: ${THEME.colorMuted};
        font-family: "Courier New", monospace;
        font-size: 10px;
        letter-spacing: 0.5px;
    `;
    progressContainer.appendChild(progressText);

    // Dot indicators
    const dotsContainer = document.createElement('div');
    dotsContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 20px;
    `;
    carouselSection.appendChild(dotsContainer);

    const dots = [];
    books.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${i === 0 ? THEME.color : THEME.colorBorder};
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        dot.onclick = () => {
            currentIndex = i;
            updateDisplay();
        };
        dotsContainer.appendChild(dot);
        dots.push(dot);
    });

    // Update display function
    async function updateDisplay() {
        const book = books[currentIndex];
        if (!book) return;

        // Update cover image
        let imageSrc = null;
        if (book.localCoverImage) {
            // Extract image path from wiki link format
            const imgMatch = book.localCoverImage.match(/\[\[([^\]]+)\]\]/) || [null, book.localCoverImage];
            const imgPath = imgMatch[1] || book.localCoverImage;
            try {
                const imgFile = app.metadataCache.getFirstLinkpathDest(imgPath, book.file.path);
                if (imgFile) {
                    imageSrc = app.vault.getResourcePath(imgFile);
                }
            } catch (e) {}
        }
        if (!imageSrc && book.coverUrl) {
            imageSrc = book.coverUrl;
        }

        if (imageSrc) {
            coverImg.src = imageSrc;
            coverImg.style.opacity = '1';
            fallbackIcon.style.opacity = '0';
            coverImg.onerror = () => {
                coverImg.style.opacity = '0';
                fallbackIcon.style.opacity = '0.4';
            };
        } else {
            coverImg.style.opacity = '0';
            fallbackIcon.style.opacity = '0.4';
        }

        // Update title & author
        const displayTitle = book.title || book.file.name.replace(/\s*-\s*[^-]+$/, '');
        bookTitle.textContent = displayTitle;
        bookAuthor.textContent = book.author || book.authors || '';

        // Update progress - Smart page tracking (per-book folders)
        let progressPercent = 0;
        let progressLabel = '';
        const totalPages = book.totalPage || book.totalPages || 0;

        // Get per-book tracking folders from frontmatter
        const trackingFolders = book.trackingFolders || book.searchFolders || null;

        // Try smart page tracking first (if book has trackingFolders defined)
        const cacheKey = book.file.path;
        let smartProgress = pageProgressCache.get(cacheKey);

        if (smartProgress === undefined && findHighestPageForBook && totalPages > 0 && trackingFolders) {
            // Fetch and cache - pass per-book tracking folders
            smartProgress = await findHighestPageForBook(displayTitle, totalPages, trackingFolders);
            pageProgressCache.set(cacheKey, smartProgress);
        }

        if (smartProgress && smartProgress.percent > 0) {
            // Use smart tracking result
            progressPercent = smartProgress.percent;
            progressLabel = `${progressPercent}%`;
        } else {
            // Fallback to frontmatter Progress field
            const progress = book.Progress;
            if (typeof progress === 'number') {
                progressPercent = progress;
                progressLabel = `${progressPercent}%`;
            } else if (progress === 'Currently reading') {
                progressPercent = 0; // Show 0 if no smart tracking
                progressLabel = 'reading';
            } else if (progress === 'Completed' || progress === 'Finished') {
                progressPercent = 100;
                progressLabel = '100%';
            } else {
                progressLabel = '—';
            }
        }

        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = progressLabel;

        // Update dots
        dots.forEach((dot, i) => {
            dot.style.background = i === currentIndex ? THEME.color : THEME.colorBorder;
            dot.style.transform = i === currentIndex ? 'scale(1.2)' : 'scale(1)';
        });
    }

    // Navigation handlers
    leftArrow.onclick = () => {
        currentIndex = (currentIndex - 1 + books.length) % books.length;
        bookCard.style.animation = 'none';
        bookCard.offsetHeight; // Trigger reflow
        bookCard.style.animation = 'reading-fade-in 0.3s ease';
        updateDisplay();
    };

    rightArrow.onclick = () => {
        currentIndex = (currentIndex + 1) % books.length;
        bookCard.style.animation = 'none';
        bookCard.offsetHeight; // Trigger reflow
        bookCard.style.animation = 'reading-fade-in 0.3s ease';
        updateDisplay();
    };

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    bookDisplay.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    bookDisplay.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                // Swipe left - next book
                rightArrow.onclick();
            } else {
                // Swipe right - previous book
                leftArrow.onclick();
            }
        }
    }, { passive: true });

    // Hover effects
    bookCard.onmouseenter = () => {
        coverImg.style.filter = 'grayscale(0.1) contrast(1.2) brightness(1)';
        scanline.style.opacity = '1';
        scanline.style.animation = 'scanline-sweep 1.5s ease-out';
        coverContainer.style.boxShadow = '0 12px 40px rgba(0,0,0,0.8), 6px 6px 0 rgba(122, 154, 125, 0.15)';
    };

    bookCard.onmouseleave = () => {
        coverImg.style.filter = 'grayscale(0.3) contrast(1.1) brightness(0.9)';
        scanline.style.opacity = '0';
        scanline.style.animation = 'none';
        coverContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6), 4px 4px 0 rgba(122, 154, 125, 0.1)';
    };

    // Click to open book - Glow effect + page flip animation
    bookCard.onclick = () => {
        const book = books[currentIndex];
        if (book) {
            // Glow pulse effect
            coverContainer.style.animation = 'book-glow 0.6s ease-out';

            // Page flip effect on the cover
            coverImg.style.animation = 'page-flip 0.5s ease-out';

            setTimeout(() => {
                coverContainer.style.animation = '';
                coverImg.style.animation = '';
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(book.file.path)}`;
            }, 400);
        }
    };

    // Initial display
    updateDisplay();
}

// ==========================================
// DIVIDER
// ==========================================
const divider = document.createElement('div');
divider.style.cssText = `
    width: calc(100% - 40px);
    height: 1px;
    background: ${THEME.colorBorder};
    margin: 0 20px;
`;
card.appendChild(divider);

// ==========================================
// INFO SECTION
// ==========================================
const infoSection = document.createElement('div');
infoSection.style.cssText = `
    padding: 20px 24px 24px 24px;
`;
card.appendChild(infoSection);

const title = document.createElement('h3');
title.textContent = "Bookshelf";
title.style.cssText = `
    margin: 0 0 6px 0;
    color: ${THEME.color};
    font-size: 14px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 0.5px;
`;
infoSection.appendChild(title);

const desc = document.createElement('p');
desc.textContent = books.length > 0
    ? `${books.length} book${books.length > 1 ? 's' : ''} in progress`
    : "No books currently being read";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 12px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
infoSection.appendChild(desc);
```


```dataviewjs
// ==========================================
// START READING SESSION - ACTION CARD
// ==========================================

const THEME = window.READING_THEME || { color: "#7a9a7d", colorHover: "#8aaa8d", colorBorder: "#2a3a2d", colorMuted: "#5a6a5d", colorAccent: "#8aaa8d", colorProgress: "#7a9a7d" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.READING_SETTINGS || { booksFolder: "Library/Books", sessionsFolder: "Personal Life/03 Reading/Sessions", logFile: "Personal Life/03 Reading/Reading Log.md" };
const createCorners = window.createReadingCorners;

// Get books for session logging (all books, not just in-progress)
const books = dv.pages()
    .where(p => {
        const hasBookMeta = p.title || p.author || p.localCoverImage || p.coverUrl;
        return hasBookMeta && p.totalPage;
    })
    .sort(p => p.file.mtime, 'desc')
    .array();

// ==========================================
// READING LOG FUNCTIONS
// ==========================================
async function getReadingLog() {
    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (!file) return {
        totalSessions: 0,
        totalMinutes: 0,
        totalPages: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: null,
        entries: []
    };

    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return {
        totalSessions: fm.totalSessions || 0,
        totalMinutes: fm.totalMinutes || 0,
        totalPages: fm.totalPages || 0,
        currentStreak: fm.currentStreak || 0,
        longestStreak: fm.longestStreak || 0,
        lastSessionDate: fm.lastSessionDate || null,
        entries: fm.entries || []
    };
}

async function saveReadingLog(data) {
    const content = `---
totalSessions: ${data.totalSessions}
totalMinutes: ${data.totalMinutes}
totalPages: ${data.totalPages}
currentStreak: ${data.currentStreak}
longestStreak: ${data.longestStreak}
lastSessionDate: "${data.lastSessionDate || ''}"
entries: ${JSON.stringify(data.entries)}
cssclasses:
  - hide-properties
---

# Reading Log

> Personal reading journey tracker.
> This file is auto-managed by the Reading session.

Last updated: ${moment().format("YYYY-MM-DD HH:mm")}
`;

    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (file) {
        await app.vault.modify(file, content);
    } else {
        const folder = settings.logFile.substring(0, settings.logFile.lastIndexOf('/'));
        if (!app.vault.getAbstractFileByPath(folder)) {
            await app.vault.createFolder(folder);
        }
        await app.vault.create(settings.logFile, content);
    }
}

async function logReadingSession(bookTitle, bookPath, durationMins, pagesRead, notes) {
    const log = await getReadingLog();
    const today = moment().format('YYYY-MM-DD');

    // Check streak
    const lastDate = log.lastSessionDate ? moment(log.lastSessionDate) : null;
    const daysSinceLast = lastDate ? moment().diff(lastDate, 'days') : null;

    let newStreak = log.currentStreak;
    if (daysSinceLast === null || daysSinceLast > 1) {
        newStreak = 1; // Start new streak
    } else if (daysSinceLast === 1) {
        newStreak = log.currentStreak + 1; // Continue streak
    }
    // If daysSinceLast === 0, keep same streak (multiple sessions same day)

    const entry = {
        id: Date.now(),
        timestamp: moment().format(),
        date: today,
        bookTitle,
        bookPath,
        durationMins,
        pagesRead,
        notes: notes || null
    };

    log.entries.unshift(entry);
    if (log.entries.length > 100) {
        log.entries = log.entries.slice(0, 100);
    }

    log.totalSessions++;
    log.totalMinutes += durationMins;
    log.totalPages += pagesRead;
    log.currentStreak = newStreak;
    log.longestStreak = Math.max(log.longestStreak, newStreak);
    log.lastSessionDate = today;

    await saveReadingLog(log);
    return entry;
}

// ==========================================
// MODAL SYSTEM
// ==========================================
let activeModal = null;

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('visible');
    setTimeout(() => {
        if (activeModal?.parentNode) activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }, 500);
}

function createModal(title, contentBuilder) {
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }

    const modal = document.createElement("div");
    modal.className = "reading-modal-overlay";
    activeModal = modal;

    const modalContent = document.createElement("div");
    modalContent.className = "reading-modal-content";
    modal.appendChild(modalContent);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'overflow-y: auto; max-height: calc(85vh - 60px); display: flex; flex-direction: column; gap: 20px;';
    modalContent.appendChild(scrollWrapper);

    if (createCorners) createCorners(modalContent, THEME.color);

    if (title) {
        const modalTitle = document.createElement("h2");
        modalTitle.textContent = title;
        modalTitle.style.cssText = `
            margin: 0;
            color: ${THEME.color};
            font-size: 14px;
            font-weight: 500;
            font-family: "Times New Roman", serif;
            letter-spacing: 3px;
            text-align: center;
            text-transform: uppercase;
            opacity: 0.8;
        `;
        scrollWrapper.appendChild(modalTitle);

        const divider = document.createElement('div');
        divider.style.cssText = `
            width: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${THEME.color}, transparent);
            margin: 0 auto;
        `;
        scrollWrapper.appendChild(divider);
    }

    contentBuilder(scrollWrapper);

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    return modal;
}

// ==========================================
// LOG SESSION MODAL
// ==========================================
function openLogSessionModal() {
    let selectedBook = books[0] || null;
    let duration = 30;
    let pages = 0;

    createModal("Log Reading Session", (content) => {
        // Book selection
        const bookLabel = document.createElement('div');
        bookLabel.textContent = 'Select Book';
        bookLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(bookLabel);

        const bookSelect = document.createElement('select');
        bookSelect.style.cssText = `
            width: 100%;
            padding: 14px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.color};
            font-size: 14px;
            font-family: "Times New Roman", serif;
            cursor: pointer;
        `;

        if (books.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'No books found';
            opt.disabled = true;
            bookSelect.appendChild(opt);
        } else {
            books.forEach((book, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = book.title || book.file.name;
                bookSelect.appendChild(opt);
            });
        }

        bookSelect.onchange = () => {
            selectedBook = books[parseInt(bookSelect.value)];
        };
        content.appendChild(bookSelect);

        // Duration input
        const durationContainer = document.createElement('div');
        durationContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
        `;
        content.appendChild(durationContainer);

        const durationLabel = document.createElement('div');
        durationLabel.innerHTML = `<span style="color: ${THEME.color};">Duration</span><br><span style="color: ${THEME.colorMuted}; font-size: 11px;">Minutes read</span>`;
        durationContainer.appendChild(durationLabel);

        const durationControls = document.createElement('div');
        durationControls.style.cssText = 'display: flex; align-items: center; gap: 12px;';

        const durationMinus = document.createElement('button');
        durationMinus.textContent = '−';
        durationMinus.style.cssText = `width: 36px; height: 36px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 18px; cursor: pointer;`;

        const durationDisplay = document.createElement('span');
        durationDisplay.textContent = `${duration} min`;
        durationDisplay.style.cssText = `min-width: 70px; text-align: center; color: ${THEME.colorAccent}; font-size: 18px; font-weight: 600;`;

        const durationPlus = document.createElement('button');
        durationPlus.textContent = '+';
        durationPlus.style.cssText = `width: 36px; height: 36px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 18px; cursor: pointer;`;

        durationMinus.onclick = () => {
            duration = Math.max(5, duration - 5);
            durationDisplay.textContent = `${duration} min`;
        };
        durationPlus.onclick = () => {
            duration = Math.min(480, duration + 5);
            durationDisplay.textContent = `${duration} min`;
        };

        durationControls.appendChild(durationMinus);
        durationControls.appendChild(durationDisplay);
        durationControls.appendChild(durationPlus);
        durationContainer.appendChild(durationControls);

        // Pages input
        const pagesContainer = document.createElement('div');
        pagesContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
        `;
        content.appendChild(pagesContainer);

        const pagesLabel = document.createElement('div');
        pagesLabel.innerHTML = `<span style="color: ${THEME.color};">Pages Read</span><br><span style="color: ${THEME.colorMuted}; font-size: 11px;">Optional</span>`;
        pagesContainer.appendChild(pagesLabel);

        const pagesInput = document.createElement('input');
        pagesInput.type = 'number';
        pagesInput.value = '0';
        pagesInput.min = '0';
        pagesInput.style.cssText = `
            width: 80px;
            padding: 10px;
            background: #0a0a0a;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.colorAccent};
            font-size: 18px;
            font-weight: 600;
            text-align: center;
        `;
        pagesInput.onchange = () => { pages = parseInt(pagesInput.value) || 0; };
        pagesContainer.appendChild(pagesInput);

        // Notes
        const notesLabel = document.createElement('div');
        notesLabel.textContent = 'Session Notes (optional)';
        notesLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(notesLabel);

        const notesInput = document.createElement('textarea');
        notesInput.placeholder = 'What did you read? Any thoughts or highlights...';
        notesInput.style.cssText = `
            width: 100%;
            height: 80px;
            padding: 12px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.color};
            font-size: 13px;
            font-family: Georgia, serif;
            resize: none;
            box-sizing: border-box;
        `;
        content.appendChild(notesInput);

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "LOG SESSION";
        submitBtn.style.cssText = `
            width: 100%;
            padding: 16px;
            background: ${THEME.color};
            border: none;
            color: #0a0a0a;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        submitBtn.onmouseover = () => { submitBtn.style.background = THEME.colorHover; };
        submitBtn.onmouseout = () => { submitBtn.style.background = THEME.color; };
        submitBtn.onclick = async () => {
            if (!selectedBook) {
                new Notice('Please select a book');
                return;
            }

            await logReadingSession(
                selectedBook.title || selectedBook.file.name,
                selectedBook.file.path,
                duration,
                parseInt(pagesInput.value) || 0,
                notesInput.value.trim()
            );

            closeModal();
            new Notice(`Reading session logged: ${duration} min`);
            // Refresh dataview blocks without full page reload
            setTimeout(() => {
                app.workspace.trigger('dataview:refresh-views');
            }, 300);
        };
        content.appendChild(submitBtn);
    });
}

// ==========================================
// SETTINGS MODAL
// ==========================================
function openSettingsModal() {
    createModal("Settings", (content) => {
        const note = document.createElement('p');
        note.innerHTML = `Configure paths. Books need frontmatter with <code style="color: ${THEME.color};">Progress: Currently reading</code> to appear on the shelf.`;
        note.style.cssText = `color: ${THEME.colorMuted}; font-size: 12px; font-style: italic; line-height: 1.5; margin: 0;`;
        content.appendChild(note);

        // Books folder
        const folderLabel = document.createElement('div');
        folderLabel.textContent = 'Books Folder Path';
        folderLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 12px;`;
        content.appendChild(folderLabel);

        const folderInput = document.createElement('input');
        folderInput.type = 'text';
        folderInput.value = settings.booksFolder;
        folderInput.placeholder = 'Library/Books';
        folderInput.style.cssText = `
            width: 100%;
            padding: 14px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.color};
            font-size: 14px;
            box-sizing: border-box;
        `;
        content.appendChild(folderInput);

        // Sessions folder
        const sessionsLabel = document.createElement('div');
        sessionsLabel.textContent = 'Sessions Folder Path';
        sessionsLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 12px;`;
        content.appendChild(sessionsLabel);

        const sessionsInput = document.createElement('input');
        sessionsInput.type = 'text';
        sessionsInput.value = settings.sessionsFolder;
        sessionsInput.placeholder = 'Personal Life/03 Reading/Sessions';
        sessionsInput.style.cssText = `
            width: 100%;
            padding: 14px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.color};
            font-size: 14px;
            box-sizing: border-box;
        `;
        content.appendChild(sessionsInput);

        // Page tracking info
        const trackingInfo = document.createElement('div');
        trackingInfo.style.cssText = `
            margin-top: 20px;
            padding: 16px;
            background: #0c0c0c;
            border-left: 2px solid ${THEME.color};
        `;
        trackingInfo.innerHTML = `
            <div style="color: ${THEME.color}; font-size: 12px; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px;">PAGE TRACKING</div>
            <div style="color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.5;">
                Add <code style="color: ${THEME.colorAccent};">trackingFolders</code> to each book's frontmatter:
            </div>
            <pre style="color: ${THEME.colorAccent}; font-size: 11px; margin: 10px 0 0 0; padding: 10px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; overflow-x: auto;">trackingFolders:
  - "Daily Notes"
  - "Research/Philosophy"</pre>
        `;
        content.appendChild(trackingInfo);

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = "SAVE SETTINGS";
        saveBtn.style.cssText = `
            width: 100%;
            padding: 16px;
            background: ${THEME.color};
            border: none;
            color: #0a0a0a;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 2px;
            cursor: pointer;
            margin-top: 16px;
            transition: all 0.2s ease;
        `;
        saveBtn.onmouseover = () => { saveBtn.style.background = THEME.colorHover; };
        saveBtn.onmouseout = () => { saveBtn.style.background = THEME.color; };
        saveBtn.onclick = () => {
            settings.booksFolder = folderInput.value.trim() || 'Library/Books';
            settings.sessionsFolder = sessionsInput.value.trim() || 'Personal Life/03 Reading/Sessions';
            window.READING_SETTINGS = settings;
            saveReadingSettings(settings);
            new Notice('Settings saved!');
            closeModal();
            // Refresh dataview blocks without full page reload
            setTimeout(() => {
                app.workspace.trigger('dataview:refresh-views');
            }, 300);
        };
        content.appendChild(saveBtn);
    });
}

// ==========================================
// RENDER ACTION CARD
// ==========================================
const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 20px auto;
    padding: 0;
`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    overflow: visible;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Session";
header.style.cssText = `
    margin: 0 0 8px 0;
    color: ${THEME.color};
    font-size: 13px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Track your reading journey";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Buttons
const buttonsSection = document.createElement('div');
buttonsSection.style.cssText = `
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
card.appendChild(buttonsSection);

// Log Session button
const logBtn = document.createElement('button');
logBtn.innerHTML = `<span style="margin-right: 8px;">📖</span> Log Reading Session`;
logBtn.style.cssText = `
    width: 100%;
    padding: 18px 24px;
    background: ${THEME.color};
    border: none;
    color: #0a0a0a;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
`;
logBtn.onmouseover = () => {
    logBtn.style.background = THEME.colorHover;
    logBtn.style.transform = 'translateY(-2px)';
};
logBtn.onmouseout = () => {
    logBtn.style.background = THEME.color;
    logBtn.style.transform = 'translateY(0)';
};
logBtn.onclick = openLogSessionModal;
buttonsSection.appendChild(logBtn);

// Settings button
const settingsBtn = document.createElement('button');
settingsBtn.innerHTML = `<span style="margin-right: 8px;">⚙️</span> Settings`;
settingsBtn.style.cssText = `
    width: 100%;
    padding: 14px 24px;
    background: transparent;
    border: 1px dashed ${THEME.colorBorder};
    color: ${THEME.colorMuted};
    font-size: 13px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
`;
settingsBtn.onmouseover = () => {
    settingsBtn.style.borderColor = THEME.color;
    settingsBtn.style.color = THEME.color;
};
settingsBtn.onmouseout = () => {
    settingsBtn.style.borderColor = THEME.colorBorder;
    settingsBtn.style.color = THEME.colorMuted;
};
settingsBtn.onclick = openSettingsModal;
buttonsSection.appendChild(settingsBtn);
```


```dataviewjs
// ==========================================
// READING STATS CARD
// ==========================================

const THEME = window.READING_THEME || { color: "#7a9a7d", colorHover: "#8aaa8d", colorBorder: "#2a3a2d", colorMuted: "#5a6a5d", colorAccent: "#8aaa8d", colorProgress: "#7a9a7d", colorPages: "#6a8a9a" };
const settings = window.READING_SETTINGS || { logFile: "Personal Life/03 Reading/Reading Log.md" };
const createCorners = window.createReadingCorners;

// Get log data
async function getStats() {
    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (!file) return null;
    const cache = app.metadataCache.getFileCache(file);
    return cache?.frontmatter || null;
}

const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 20px auto;
    padding: 0;
`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    overflow: visible;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Statistics";
header.style.cssText = `
    margin: 0 0 8px 0;
    color: ${THEME.color};
    font-size: 13px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Your reading journey";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Stats grid
const statsSection = document.createElement('div');
statsSection.style.cssText = `
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
`;
card.appendChild(statsSection);

// Render stats
getStats().then(stats => {
    const data = stats || { totalSessions: 0, totalMinutes: 0, totalPages: 0, currentStreak: 0, longestStreak: 0 };

    const statItems = [
        { label: "Sessions", value: data.totalSessions || 0, icon: "📚", color: THEME.color },
        { label: "Time Read", value: `${Math.floor((data.totalMinutes || 0) / 60)}h ${(data.totalMinutes || 0) % 60}m`, icon: "⏱️", color: THEME.colorAccent },
        { label: "Pages", value: data.totalPages || 0, icon: "📄", color: THEME.colorPages },
        { label: "Streak", value: `${data.currentStreak || 0} days`, icon: "🔥", color: THEME.colorProgress }
    ];

    statItems.forEach(item => {
        const statCard = document.createElement('div');
        statCard.style.cssText = `
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            text-align: center;
            transition: all 0.3s ease;
        `;

        statCard.onmouseenter = () => {
            statCard.style.borderColor = item.color;
            statCard.style.transform = 'translateY(-2px)';
        };
        statCard.onmouseleave = () => {
            statCard.style.borderColor = THEME.colorBorder;
            statCard.style.transform = 'translateY(0)';
        };

        const icon = document.createElement('div');
        icon.textContent = item.icon;
        icon.style.cssText = `font-size: 20px; margin-bottom: 8px;`;
        statCard.appendChild(icon);

        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.cssText = `
            color: ${item.color};
            font-size: 18px;
            font-weight: 600;
            font-family: "Courier New", monospace;
        `;
        statCard.appendChild(value);

        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 4px;
        `;
        statCard.appendChild(label);

        statsSection.appendChild(statCard);
    });

    // Longest streak note
    if (data.longestStreak > 0) {
        const streakNote = document.createElement('div');
        streakNote.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 12px;
            background: rgba(122, 154, 125, 0.1);
            border: 1px dashed ${THEME.colorProgress};
            color: ${THEME.colorProgress};
            font-size: 12px;
            font-family: Georgia, serif;
            font-style: italic;
        `;
        streakNote.textContent = `Longest streak: ${data.longestStreak} days`;
        statsSection.appendChild(streakNote);
    }
});
```


```dataviewjs
// ==========================================
// RECENT SESSIONS - TIMELINE CARD
// ==========================================

const THEME = window.READING_THEME || { color: "#7a9a7d", colorHover: "#8aaa8d", colorBorder: "#2a3a2d", colorMuted: "#5a6a5d", colorAccent: "#8aaa8d" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.READING_SETTINGS || { logFile: "Personal Life/03 Reading/Reading Log.md" };
const createCorners = window.createReadingCorners;

// Get recent entries
async function getRecentEntries() {
    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (!file) return [];
    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return (fm.entries || []).slice(0, 5);
}

const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 20px auto;
    padding: 0;
`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    overflow: visible;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Recent";
header.style.cssText = `
    margin: 0 0 8px 0;
    color: ${THEME.color};
    font-size: 13px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Latest reading sessions";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Timeline section
const timelineSection = document.createElement('div');
timelineSection.style.cssText = `
    padding: 16px 20px;
`;
card.appendChild(timelineSection);

// Render entries
getRecentEntries().then(entries => {
    if (entries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = `
            text-align: center;
            padding: 32px 20px;
            color: ${THEME.colorMuted};
        `;
        emptyMsg.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 12px; opacity: 0.3;">📖</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px;">No sessions logged yet</div>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; margin-top: 8px; opacity: 0.5;">START READING ABOVE</div>
        `;
        timelineSection.appendChild(emptyMsg);
        return;
    }

    entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 14px 16px;
            margin-bottom: ${index < entries.length - 1 ? '8px' : '0'};
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            transition: all 0.3s ease;
            cursor: pointer;
        `;

        item.onmouseenter = () => {
            item.style.borderColor = THEME.color;
            item.style.background = '#121210';
        };
        item.onmouseleave = () => {
            item.style.borderColor = THEME.colorBorder;
            item.style.background = '#0f0f0f';
        };

        // Date column
        const dateCol = document.createElement('div');
        dateCol.style.cssText = `
            min-width: 50px;
            text-align: center;
        `;

        const entryDate = moment(entry.timestamp || entry.date);
        const dayNum = document.createElement('div');
        dayNum.textContent = entryDate.format('D');
        dayNum.style.cssText = `
            color: ${THEME.colorAccent};
            font-size: 20px;
            font-weight: 600;
            font-family: "Courier New", monospace;
            line-height: 1;
        `;
        dateCol.appendChild(dayNum);

        const month = document.createElement('div');
        month.textContent = entryDate.format('MMM');
        month.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
        `;
        dateCol.appendChild(month);

        item.appendChild(dateCol);

        // Content column
        const contentCol = document.createElement('div');
        contentCol.style.cssText = `flex: 1; min-width: 0;`;

        const bookTitle = document.createElement('div');
        bookTitle.textContent = entry.bookTitle || 'Unknown Book';
        bookTitle.style.cssText = `
            color: ${THEME.color};
            font-size: 14px;
            font-family: "Times New Roman", serif;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        `;
        contentCol.appendChild(bookTitle);

        const meta = document.createElement('div');
        meta.style.cssText = `
            display: flex;
            gap: 12px;
            color: ${THEME.colorMuted};
            font-size: 11px;
        `;

        if (entry.durationMins) {
            const duration = document.createElement('span');
            duration.textContent = `⏱ ${entry.durationMins} min`;
            meta.appendChild(duration);
        }

        if (entry.pagesRead) {
            const pages = document.createElement('span');
            pages.textContent = `📄 ${entry.pagesRead} pages`;
            meta.appendChild(pages);
        }

        contentCol.appendChild(meta);

        if (entry.notes) {
            const notes = document.createElement('div');
            notes.textContent = entry.notes;
            notes.style.cssText = `
                margin-top: 8px;
                padding: 8px 10px;
                background: rgba(122, 154, 125, 0.05);
                border-left: 2px solid ${THEME.colorBorder};
                color: ${THEME.colorMuted};
                font-size: 12px;
                font-family: Georgia, serif;
                font-style: italic;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            contentCol.appendChild(notes);
        }

        item.appendChild(contentCol);

        // Click to open book
        if (entry.bookPath) {
            item.onclick = () => {
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(entry.bookPath)}`;
            };
        }

        timelineSection.appendChild(item);
    });
});
```

<div style="height: 40px;"></div>
