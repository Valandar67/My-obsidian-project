---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// RESEARCH ABOUT HEALTH SESSION - GLOBAL STYLES & CONFIG
// Health Green Theme (matching Home.md)
// ==========================================

if (!document.getElementById('health-session-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'health-session-styles-v1';
    style.textContent = `
        @keyframes health-breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(122, 154, 122, 0.03); }
            50% { box-shadow: inset 0 0 40px rgba(122, 154, 122, 0.08); }
        }

        @keyframes health-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scanline-sweep {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 0.4; }
            100% { top: 100%; opacity: 0; }
        }

        @keyframes health-book-glow {
            0% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 rgba(122, 154, 122, 0); }
            50% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 30px rgba(122, 154, 122, 0.4); }
            100% { box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 rgba(122, 154, 122, 0); }
        }

        @keyframes health-page-flip {
            0% { transform: perspective(400px) rotateY(0deg); }
            30% { transform: perspective(400px) rotateY(-8deg); }
            100% { transform: perspective(400px) rotateY(0deg); }
        }

        .health-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }
        .health-modal-overlay.visible {
            background: rgba(0,0,0,0.95); backdrop-filter: blur(4px);
        }
        .health-modal-content {
            background: #0a0a0a; padding: 32px; border: 1px solid #2a3a2a;
            max-width: 500px; max-height: 85vh; width: 90%;
            display: flex; flex-direction: column; gap: 20px;
            box-shadow: 0 40px 120px rgba(0,0,0,0.9); position: relative;
            opacity: 0; transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .health-modal-overlay.visible .health-modal-content {
            opacity: 1; transform: translateY(0);
        }

        .health-img-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }

        .health-book-carousel-container {
            touch-action: pan-x !important;
            -webkit-overflow-scrolling: touch;
        }

        .health-book-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .health-folder-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: #0f0f0f;
            border: 1px solid #2a3a2a;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .health-folder-item:hover {
            border-color: #7a9a7a;
            background: #121210;
        }

        .health-file-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #0c0c0c;
            border: 1px solid #252a25;
            margin-bottom: 6px;
            margin-left: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .health-file-item:hover {
            border-color: #7a9a7a;
            background: #101210;
        }
    `;
    document.head.appendChild(style);
}

// Theme - Health Green (matching Home.md research about health)
const HEALTH_THEME = {
    color: "#7a9a7a",
    colorHover: "#8aaa8a",
    colorBorder: "#2a3a2a",
    colorBorderHover: "#3a4a3a",
    colorMuted: "#5a6a5a",
    colorAccent: "#8aaa8a"
};

window.HEALTH_THEME = HEALTH_THEME;
window.VAULT_NAME = "Alt society";

// Settings persistence
const HEALTH_SETTINGS_KEY = 'health-session-settings-v1';

function loadHealthSettings() {
    try {
        const saved = localStorage.getItem(HEALTH_SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
        researchFolder: "Health Research",
        booksFolder: "Library/Health Books"
    };
}

function saveHealthSettings(settings) {
    try {
        localStorage.setItem(HEALTH_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
}

window.HEALTH_SETTINGS = loadHealthSettings();

// ==========================================
// SMART PAGE TRACKING - Find highest page from PDF links
// ==========================================
window.findHighestPageForHealthBook = async function(bookTitle, totalPages, trackingFolders) {
    const folders = trackingFolders || [];

    if (folders.length === 0 || !totalPages) {
        return null;
    }

    const searchFolders = Array.isArray(folders) ? folders : [folders];
    const cleanTitle = bookTitle.replace(/\s*-\s*[^-]+$/, '').trim();

    const pageRegex = new RegExp(
        `\\[\\[[^\\]]*${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\]]*\\.pdf#page=(\\d+)`,
        'gi'
    );

    let highestPage = 0;
    let foundIn = null;

    const allFiles = app.vault.getMarkdownFiles();
    const relevantFiles = allFiles
        .filter(file => {
            return searchFolders.some(folder => {
                const normalizedFolder = folder.endsWith('/') ? folder : folder + '/';
                return file.path.startsWith(folder) || file.path.startsWith(normalizedFolder);
            });
        })
        .sort((a, b) => b.stat.mtime - a.stat.mtime);

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
window.createHealthCorners = function(container, color = HEALTH_THEME.color, size = 16) {
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

dv.paragraph("");
```

```dataviewjs
// ==========================================
// BOOK CAROUSEL - HEALTH REFERENCE BOOKS
// Touch-friendly mobile carousel
// ==========================================

const THEME = window.HEALTH_THEME || { color: "#7a9a7a", colorHover: "#8aaa8a", colorBorder: "#2a3a2a", colorMuted: "#5a6a5a", colorAccent: "#8aaa8a" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.HEALTH_SETTINGS || { booksFolder: "Library/Health Books" };
const createCorners = window.createHealthCorners;
const findHighestPageForBook = window.findHighestPageForHealthBook;

// Get books that are "Currently reading" (in progress) - health related
const books = dv.pages()
    .where(p => {
        const hasBookMeta = p.title || p.author || p.localCoverImage || p.coverUrl;
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
    animation: health-breathe 8s ease-in-out infinite;
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
            <div style="font-family: 'Times New Roman', serif; font-size: 16px; letter-spacing: 1px; margin-bottom: 8px;">No health books in progress</div>
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
    bookDisplay.className = 'health-book-carousel-container';
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
    bookCard.className = 'health-book-card';
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
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 4px 4px 0 rgba(122, 154, 122, 0.1);
    `;
    bookCard.appendChild(coverContainer);

    // Cover image
    const coverImg = document.createElement('img');
    coverImg.className = 'health-img-no-drag';
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

        // Update progress - Smart page tracking
        let progressPercent = 0;
        let progressLabel = '';
        const totalPages = book.totalPage || book.totalPages || 0;

        const trackingFolders = book.trackingFolders || book.searchFolders || null;

        const cacheKey = book.file.path;
        let smartProgress = pageProgressCache.get(cacheKey);

        if (smartProgress === undefined && findHighestPageForBook && totalPages > 0 && trackingFolders) {
            smartProgress = await findHighestPageForBook(displayTitle, totalPages, trackingFolders);
            pageProgressCache.set(cacheKey, smartProgress);
        }

        if (smartProgress && smartProgress.percent > 0) {
            progressPercent = smartProgress.percent;
            progressLabel = `${progressPercent}%`;
        } else {
            const progress = book.Progress;
            if (typeof progress === 'number') {
                progressPercent = progress;
                progressLabel = `${progressPercent}%`;
            } else if (progress === 'Currently reading') {
                progressPercent = 0;
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
        bookCard.offsetHeight;
        bookCard.style.animation = 'health-fade-in 0.3s ease';
        updateDisplay();
    };

    rightArrow.onclick = () => {
        currentIndex = (currentIndex + 1) % books.length;
        bookCard.style.animation = 'none';
        bookCard.offsetHeight;
        bookCard.style.animation = 'health-fade-in 0.3s ease';
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
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                rightArrow.onclick();
            } else {
                leftArrow.onclick();
            }
        }
    }, { passive: true });

    // Hover effects
    bookCard.onmouseenter = () => {
        coverImg.style.filter = 'grayscale(0.1) contrast(1.2) brightness(1)';
        scanline.style.opacity = '1';
        scanline.style.animation = 'scanline-sweep 1.5s ease-out';
        coverContainer.style.boxShadow = '0 12px 40px rgba(0,0,0,0.8), 6px 6px 0 rgba(122, 154, 122, 0.15)';
    };

    bookCard.onmouseleave = () => {
        coverImg.style.filter = 'grayscale(0.3) contrast(1.1) brightness(0.9)';
        scanline.style.opacity = '0';
        scanline.style.animation = 'none';
        coverContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6), 4px 4px 0 rgba(122, 154, 122, 0.1)';
    };

    // Click to open book
    bookCard.onclick = () => {
        const book = books[currentIndex];
        if (book) {
            coverContainer.style.animation = 'health-book-glow 0.6s ease-out';
            coverImg.style.animation = 'health-page-flip 0.5s ease-out';

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
title.textContent = "Health Bookshelf";
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
    : "No health books currently being read";
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
// FOLDER BOARD - HEALTH RESEARCH EXPLORER
// Click to navigate through folders and files
// ==========================================

const THEME = window.HEALTH_THEME || { color: "#7a9a7a", colorHover: "#8aaa8a", colorBorder: "#2a3a2a", colorMuted: "#5a6a5a", colorAccent: "#8aaa8a" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.HEALTH_SETTINGS || { researchFolder: "Health Research" };
const createCorners = window.createHealthCorners;

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
    animation: health-breathe 8s ease-in-out infinite;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header section
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Research Board";
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
desc.textContent = "Explore health research notes";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Breadcrumb navigation
const breadcrumbSection = document.createElement('div');
breadcrumbSection.style.cssText = `
    padding: 12px 20px;
    background: #0c0c0c;
    border-bottom: 1px solid ${THEME.colorBorder};
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;
card.appendChild(breadcrumbSection);

// Content section
const contentSection = document.createElement('div');
contentSection.style.cssText = `
    padding: 16px 20px;
    max-height: 400px;
    overflow-y: auto;
`;
card.appendChild(contentSection);

// Current path state
let currentPath = settings.researchFolder;

// Get folder contents
async function getFolderContents(folderPath) {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (!folder || !folder.children) {
        return { folders: [], files: [] };
    }

    const folders = [];
    const files = [];

    for (const child of folder.children) {
        if (child.children !== undefined) {
            // It's a folder
            folders.push({
                name: child.name,
                path: child.path
            });
        } else if (child.extension === 'md') {
            // It's a markdown file
            files.push({
                name: child.basename,
                path: child.path
            });
        }
    }

    // Sort alphabetically
    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    return { folders, files };
}

// Update breadcrumb
function updateBreadcrumb() {
    breadcrumbSection.innerHTML = '';

    const pathParts = currentPath.split('/');
    let accumulatedPath = '';

    // Home icon
    const homeBtn = document.createElement('span');
    homeBtn.textContent = '🏠';
    homeBtn.style.cssText = `
        cursor: pointer;
        font-size: 14px;
        transition: transform 0.2s ease;
    `;
    homeBtn.onclick = () => {
        currentPath = settings.researchFolder;
        renderContents();
    };
    homeBtn.onmouseenter = () => { homeBtn.style.transform = 'scale(1.1)'; };
    homeBtn.onmouseleave = () => { homeBtn.style.transform = 'scale(1)'; };
    breadcrumbSection.appendChild(homeBtn);

    pathParts.forEach((part, index) => {
        accumulatedPath = pathParts.slice(0, index + 1).join('/');

        // Separator
        const sep = document.createElement('span');
        sep.textContent = ' / ';
        sep.style.cssText = `color: ${THEME.colorMuted}; font-size: 12px;`;
        breadcrumbSection.appendChild(sep);

        // Path part
        const pathBtn = document.createElement('span');
        pathBtn.textContent = part;
        const thisPath = accumulatedPath;
        pathBtn.style.cssText = `
            color: ${index === pathParts.length - 1 ? THEME.color : THEME.colorMuted};
            font-size: 12px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            cursor: ${index === pathParts.length - 1 ? 'default' : 'pointer'};
            transition: color 0.2s ease;
        `;
        if (index < pathParts.length - 1) {
            pathBtn.onmouseenter = () => { pathBtn.style.color = THEME.colorHover; };
            pathBtn.onmouseleave = () => { pathBtn.style.color = THEME.colorMuted; };
            pathBtn.onclick = () => {
                currentPath = thisPath;
                renderContents();
            };
        }
        breadcrumbSection.appendChild(pathBtn);
    });
}

// Render folder contents
async function renderContents() {
    contentSection.innerHTML = '';
    updateBreadcrumb();

    const { folders, files } = await getFolderContents(currentPath);

    if (folders.length === 0 && files.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: ${THEME.colorMuted};
        `;
        emptyMsg.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.3;">📁</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px;">No files or folders found</div>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; margin-top: 12px; opacity: 0.5;">
                Create folder: ${settings.researchFolder}
            </div>
        `;
        contentSection.appendChild(emptyMsg);
        return;
    }

    // Render folders first
    folders.forEach((folder, index) => {
        const item = document.createElement('div');
        item.className = 'health-folder-item';
        item.style.animation = `health-fade-in 0.3s ease ${index * 0.05}s both`;

        const icon = document.createElement('span');
        icon.textContent = '📂';
        icon.style.cssText = `font-size: 18px; flex-shrink: 0;`;
        item.appendChild(icon);

        const name = document.createElement('span');
        name.textContent = folder.name;
        name.style.cssText = `
            color: ${THEME.color};
            font-size: 14px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            flex: 1;
        `;
        item.appendChild(name);

        const arrow = document.createElement('span');
        arrow.textContent = '→';
        arrow.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
        `;
        item.appendChild(arrow);

        item.onmouseenter = () => {
            arrow.style.opacity = '1';
            arrow.style.transform = 'translateX(4px)';
        };
        item.onmouseleave = () => {
            arrow.style.opacity = '0';
            arrow.style.transform = 'translateX(0)';
        };

        item.onclick = () => {
            currentPath = folder.path;
            renderContents();
        };

        contentSection.appendChild(item);
    });

    // Render files
    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'health-file-item';
        item.style.animation = `health-fade-in 0.3s ease ${(folders.length + index) * 0.05}s both`;

        const icon = document.createElement('span');
        icon.textContent = '📄';
        icon.style.cssText = `font-size: 16px; flex-shrink: 0;`;
        item.appendChild(icon);

        const name = document.createElement('span');
        name.textContent = file.name;
        name.style.cssText = `
            color: ${THEME.colorAccent};
            font-size: 13px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            flex: 1;
        `;
        item.appendChild(name);

        item.onclick = () => {
            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(file.path)}`;
        };

        contentSection.appendChild(item);
    });
}

// Initial render
renderContents();
```

```dataviewjs
// ==========================================
// SETTINGS CARD - CONFIGURE RESEARCH FOLDER
// ==========================================

const THEME = window.HEALTH_THEME || { color: "#7a9a7a", colorHover: "#8aaa8a", colorBorder: "#2a3a2a", colorMuted: "#5a6a5a" };
const createCorners = window.createHealthCorners;

// Modal system
let activeModal = null;

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('visible');
    setTimeout(() => {
        if (activeModal?.parentNode) activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }, 500);
}

function openSettingsModal() {
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }

    const modal = document.createElement("div");
    modal.className = "health-modal-overlay";
    activeModal = modal;

    const modalContent = document.createElement("div");
    modalContent.className = "health-modal-content";
    modal.appendChild(modalContent);

    if (createCorners) createCorners(modalContent, THEME.color);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'overflow-y: auto; max-height: calc(85vh - 60px); display: flex; flex-direction: column; gap: 20px;';
    modalContent.appendChild(scrollWrapper);

    // Title
    const title = document.createElement("h2");
    title.textContent = "Settings";
    title.style.cssText = `
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
    scrollWrapper.appendChild(title);

    const divider = document.createElement('div');
    divider.style.cssText = `
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, ${THEME.color}, transparent);
        margin: 0 auto;
    `;
    scrollWrapper.appendChild(divider);

    // Books folder input
    const booksLabel = document.createElement('div');
    booksLabel.textContent = 'Health Books Folder';
    booksLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 12px;`;
    scrollWrapper.appendChild(booksLabel);

    const booksInput = document.createElement('input');
    booksInput.type = 'text';
    booksInput.value = window.HEALTH_SETTINGS.booksFolder || 'Library/Health Books';
    booksInput.placeholder = 'Library/Health Books';
    booksInput.style.cssText = `
        width: 100%;
        padding: 14px;
        background: #0f0f0f;
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-size: 14px;
        box-sizing: border-box;
    `;
    scrollWrapper.appendChild(booksInput);

    // Research folder path input
    const folderLabel = document.createElement('div');
    folderLabel.textContent = 'Research Folder Path';
    folderLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 12px;`;
    scrollWrapper.appendChild(folderLabel);

    const folderInput = document.createElement('input');
    folderInput.type = 'text';
    folderInput.value = window.HEALTH_SETTINGS.researchFolder;
    folderInput.placeholder = 'Health Research';
    folderInput.style.cssText = `
        width: 100%;
        padding: 14px;
        background: #0f0f0f;
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-size: 14px;
        box-sizing: border-box;
    `;
    scrollWrapper.appendChild(folderInput);

    // Info note
    const infoNote = document.createElement('div');
    infoNote.style.cssText = `
        padding: 16px;
        background: #0c0c0c;
        border-left: 2px solid ${THEME.color};
    `;
    infoNote.innerHTML = `
        <div style="color: ${THEME.color}; font-size: 12px; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px;">FOLDER STRUCTURE</div>
        <div style="color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.5;">
            Organize your research like:
        </div>
        <pre style="color: ${THEME.colorAccent}; font-size: 11px; margin: 10px 0 0 0; padding: 10px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; overflow-x: auto;">Health Research/
├── Body/
│   ├── Lungs/
│   │   └── Science of breathing.md
│   └── Heart/
│       └── Cardiovascular health.md
└── Nutrition/
    └── Vitamins.md</pre>
    `;
    scrollWrapper.appendChild(infoNote);

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
        window.HEALTH_SETTINGS.booksFolder = booksInput.value.trim() || 'Library/Health Books';
        window.HEALTH_SETTINGS.researchFolder = folderInput.value.trim() || 'Health Research';
        try {
            localStorage.setItem('health-session-settings-v1', JSON.stringify(window.HEALTH_SETTINGS));
        } catch (e) {}
        new Notice('Settings saved! Refresh to see changes.');
        closeModal();
    };
    scrollWrapper.appendChild(saveBtn);

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));
}

// Render settings button
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

const buttonsSection = document.createElement('div');
buttonsSection.style.cssText = `
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
card.appendChild(buttonsSection);

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

<div style="height: 40px;"></div>
