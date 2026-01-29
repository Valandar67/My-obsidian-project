---
title: Plato's Republic
subtitle:
author: Plato
authors: Plato
category:
categories:
publisher:
publishDate: 1894
totalPage: 518
coverUrl: http://books.google.com/books/content?id=916nCUQPugEC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api
coverSmallUrl: http://books.google.com/books/content?id=916nCUQPugEC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api
description:
link: https://play.google.com/store/books/details?id=916nCUQPugEC
previewLink: http://books.google.gr/books?id=916nCUQPugEC&pg=PR2&dq=Plato%27s+Republic&hl=&as_pt=BOOKS&cd=5&source=gbs_api
isbn13: ONB:+Z329810802
localCoverImage: Obsidian/Images/Plato's Republic - Plato.jpg
Progress: Currently reading
---
![[Plato's Republic - Plato.base]]
```dataviewjs
// ==========================================
// BOOK READER CARD - STABLE EDITION
// ==========================================

const VAULT_NAME = "Alt society";
const currentFile = dv.current().file.name;

const THEME = {
    color: "#7a9a7d",
    colorHover: "#8aaa8d",
    colorBorder: "#2a3a2d",
    colorBorderHover: "#3a4a3d",
    colorMuted: "#5a6a5d"
};

// ==========================================
// STYLES (injected once)
// ==========================================
if (!document.getElementById('book-reader-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'book-reader-styles-v1';
    style.textContent = `
        .book-img-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }
        
        @keyframes scanline-sweep {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 0.5; }
            100% { top: 100%; opacity: 0; }
        }
        
        @keyframes flash-out {
            0% { opacity: 0.8; transform: scale(0.5); }
            100% { opacity: 0; transform: scale(1.5); }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function createCorners(container, color, size = 18) {
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
        corner.dataset.baseSize = size;
        container.appendChild(corner);
        corners.push(corner);
    });
    return corners;
}

// ==========================================
// FIND BOOK COVER IMAGE
// ==========================================
const imageFolder = "Obsidian/Images/";
const possibleExtensions = [".jpg", ".jpeg", ".png", ".webp"];
let imagePath = null;

for (let ext of possibleExtensions) {
    const testPath = imageFolder + currentFile + ext;
    try {
        imagePath = app.vault.adapter.getResourcePath(testPath);
        break;
    } catch (e) {
        continue;
    }
}

// ==========================================
// CREATE CARD
// ==========================================
const card = dv.el("div", "", {cls: "book-reader-card"});
card.style.cssText = `
    max-width: 600px;
    width: fit-content;
    border: 1px solid ${THEME.colorBorder};
    padding: 0;
    margin: 40px auto;
    background: #0a0a0a;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    position: relative;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
    overflow: visible;
`;

const cardCorners = createCorners(card, THEME.color);

// ==========================================
// HEADER SECTION
// ==========================================
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = currentFile;
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
desc.textContent = "Open to read";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// ==========================================
// IMAGE CONTAINER
// ==========================================
const imageContainer = document.createElement('div');
imageContainer.style.cssText = `
    width: auto;
    max-width: 600px;
    height: 500px;
    overflow: hidden;
    cursor: pointer;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;
card.appendChild(imageContainer);

// Image or fallback
let image = null;
if (imagePath) {
    image = document.createElement('img');
    image.src = imagePath;
    image.className = 'book-img-no-drag';
    image.draggable = false;
    image.style.cssText = `
        height: 100%;
        width: auto;
        max-width: 600px;
        object-fit: contain;
        object-position: center;
        display: block;
        transition: transform 0.6s ease, filter 0.6s ease, opacity 0.6s ease;
        filter: grayscale(0.4) contrast(1.2) brightness(0.85);
        opacity: 0.9;
    `;
    imageContainer.appendChild(image);
} else {
    const fallbackIcon = document.createElement('div');
    fallbackIcon.textContent = "📚";
    fallbackIcon.style.cssText = `
        font-size: 80px;
        opacity: 0.3;
        user-select: none;
    `;
    imageContainer.appendChild(fallbackIcon);
}

// Vignette
const vignette = document.createElement('div');
vignette.style.cssText = `
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
    pointer-events: none;
    transition: opacity 0.4s ease;
`;
imageContainer.appendChild(vignette);

// Info overlay (shows on hover)
const infoOverlay = document.createElement('div');
infoOverlay.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 28px;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
`;
imageContainer.appendChild(infoOverlay);

const overlayText = document.createElement('div');
overlayText.textContent = "Open Book";
overlayText.style.cssText = `
    color: ${THEME.colorHover};
    font-size: 12px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
`;
infoOverlay.appendChild(overlayText);

const overlaySubtext = document.createElement('div');
overlaySubtext.textContent = "Begin reading";
overlaySubtext.style.cssText = `
    color: ${THEME.colorMuted};
    font-size: 13px;
    font-family: "Georgia", serif;
    font-style: italic;
`;
infoOverlay.appendChild(overlaySubtext);

// Scanline overlay
const scanline = document.createElement('div');
scanline.style.cssText = `
    position: absolute;
    top: -100%;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, 
        transparent 0%, 
        ${THEME.color}30 50%, 
        transparent 100%);
    pointer-events: none;
    opacity: 0;
`;
imageContainer.appendChild(scanline);

// ==========================================
// HOVER INTERACTIONS
// ==========================================
imageContainer.onmouseenter = () => {
    card.style.borderColor = THEME.colorBorderHover;
    card.style.boxShadow = "0 24px 80px rgba(0, 0, 0, 0.9)";
    
    if (image) {
        image.style.transform = "scale(1.03)";
        image.style.filter = "grayscale(0.2) contrast(1.3) brightness(0.95)";
        image.style.opacity = "1";
    }
    
    vignette.style.opacity = "0.5";
    infoOverlay.style.opacity = "1";
    infoOverlay.style.transform = "translateY(0)";
    scanline.style.opacity = "1";
    scanline.style.animation = "scanline-sweep 1.5s ease-out";
    
    cardCorners.forEach(c => {
        const baseSize = parseInt(c.dataset.baseSize);
        c.style.width = (baseSize + 10) + "px";
        c.style.height = (baseSize + 10) + "px";
    });
};

imageContainer.onmouseleave = () => {
    card.style.borderColor = THEME.colorBorder;
    card.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.8)";
    
    if (image) {
        image.style.transform = "scale(1)";
        image.style.filter = "grayscale(0.4) contrast(1.2) brightness(0.85)";
        image.style.opacity = "0.9";
    }
    
    vignette.style.opacity = "1";
    infoOverlay.style.opacity = "0";
    infoOverlay.style.transform = "translateY(20px)";
    scanline.style.opacity = "0";
    scanline.style.animation = "none";
    
    cardCorners.forEach(c => {
        const baseSize = parseInt(c.dataset.baseSize);
        c.style.width = baseSize + "px";
        c.style.height = baseSize + "px";
    });
};

// ==========================================
// CLICK TO OPEN PDF
// ==========================================
imageContainer.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Click feedback
    if (image) {
        image.style.transform = "scale(0.98)";
    }
    
    setTimeout(() => {
        if (image) {
            image.style.transform = "scale(1.03)";
        }
        
        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle, ${THEME.color}60 0%, transparent 60%);
            animation: flash-out 0.4s ease-out forwards;
            pointer-events: none;
            z-index: 20;
        `;
        imageContainer.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
            const pdfPath = "Library/Books/" + currentFile + ".pdf";
            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(pdfPath)}`;
        }, 300);
    }, 80);
};
```