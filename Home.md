---
editor-width: 100
banner: "![[peakpx.jpg]]"
cssclasses: true
  - hide-properties
---
```search-bar
show recent files
```
---

> [!danger]- Music
[Χίπικα](https://open.spotify.com/playlist/0zoo4Utly7iLh7TXP66nQu?si=W_yzaQtISIWe3QN5gcwDhw&pi=Tk1pzUX8SzyEe)
[Background Music](https://open.spotify.com/playlist/3trLJHDHtBuy4ZhaS8hS6I?si=sJoWBdR-Qies0mOoIA2o4g&pt=4a9451fbbf29c6f82fdfe49c7efa80a1&pi=vWEx4DHoQYqz1)

---
![[Blackboard]]

```dataviewjs
// ==========================================
// HOME PAGE - STABLE EDITION
// ==========================================

const VAULT_NAME = "Alt society";

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
if (!document.getElementById('home-page-styles-v3')) {
    const style = document.createElement('style');
    style.id = 'home-page-styles-v3';
    style.textContent = `
        .home-img-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }
        .home-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }
        .home-modal-overlay.visible {
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(4px);
        }
        .home-modal-content {
            background: #0a0a0a;
            padding: 50px 40px;
            border: 1px solid #2a3a2d;
            max-width: 900px;
            max-height: 85vh;
            width: 85%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
            position: relative;
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .home-modal-overlay.visible .home-modal-content {
            opacity: 1;
            transform: translateY(0);
        }
        .home-modal-scroll {
            width: 100%;
            max-height: 60vh;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 10px;
        }
        .home-modal-buttons {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
        }
        .home-btn-card {
            border: 1px solid #2a3a2d;
            padding: 0;
            background: #0f0f0f;
            cursor: pointer;
            width: 260px;
            position: relative;
            opacity: 0;
            transform: translateY(10px);
        }
        .home-modal-overlay.visible .home-btn-card {
            opacity: 1;
            transform: translateY(0);
        }
        .home-btn-card:nth-child(1) { transition-delay: 0.05s; }
        .home-btn-card:nth-child(2) { transition-delay: 0.1s; }
        .home-btn-card:nth-child(3) { transition-delay: 0.15s; }
        .home-btn-card:nth-child(4) { transition-delay: 0.2s; }
        .home-btn-card:nth-child(5) { transition-delay: 0.25s; }
        .home-btn-card:nth-child(6) { transition-delay: 0.3s; }
        .home-btn-card:nth-child(7) { transition-delay: 0.35s; }
        
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
        corner.dataset.corner = pos;
        corner.dataset.baseSize = size;
        container.appendChild(corner);
        corners.push(corner);
    });
    return corners;
}

// ==========================================
// IMAGE CARD COMPONENT
// ==========================================
function createImageCard(options) {
    const { 
        title, 
        description, 
        imagePath, 
        onClick,
        overlayTitle,
        overlaySubtitle,
        color = THEME.color,
        colorHover = THEME.colorHover,
        colorBorder = THEME.colorBorder,
        colorBorderHover = THEME.colorBorderHover
    } = options;
    
    const card = document.createElement('div');
    card.style.cssText = `
        max-width: 420px;
        border: 1px solid ${colorBorder};
        padding: 0;
        margin: 40px 0;
        background: #0a0a0a;
        position: relative;
        overflow: visible;
    `;
    
    const cardCorners = createCorners(card, color);
    
    // Header
    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
        padding: 24px 28px 20px 28px;
        background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
        border-bottom: 1px solid ${colorBorder};
    `;
    card.appendChild(headerSection);
    
    const header = document.createElement('h3');
    header.textContent = title;
    header.style.cssText = `
        margin: 0 0 8px 0;
        color: ${color};
        font-size: 13px;
        font-weight: 500;
        font-family: "Times New Roman", serif;
        letter-spacing: 3px;
        text-transform: uppercase;
        opacity: 0.7;
    `;
    headerSection.appendChild(header);
    
    const desc = document.createElement('p');
    desc.textContent = description;
    desc.style.cssText = `
        margin: 0;
        color: ${THEME.colorMuted};
        font-size: 14px;
        line-height: 1.4;
        font-family: "Georgia", serif;
        font-style: italic;
    `;
    headerSection.appendChild(desc);
    
    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        width: 100%;
        height: 320px;
        overflow: hidden;
        cursor: pointer;
        background: #000;
        position: relative;
    `;
    card.appendChild(imageContainer);
    
    const image = document.createElement('img');
    image.src = app.vault.adapter.getResourcePath(imagePath);
    image.className = 'home-img-no-drag';
    image.draggable = false;
    image.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.6s ease, filter 0.6s ease, opacity 0.6s ease;
        filter: grayscale(0.4) contrast(1.2) brightness(0.85);
        opacity: 0.9;
    `;
    imageContainer.appendChild(image);
    
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
    overlayText.textContent = overlayTitle || "Open";
    overlayText.style.cssText = `
        color: ${colorHover};
        font-size: 12px;
        font-weight: 500;
        font-family: "Times New Roman", serif;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 6px;
    `;
    infoOverlay.appendChild(overlayText);
    
    const overlaySubtextEl = document.createElement('div');
    overlaySubtextEl.textContent = overlaySubtitle || "Select type";
    overlaySubtextEl.style.cssText = `
        color: ${THEME.colorMuted};
        font-size: 13px;
        font-family: "Georgia", serif;
        font-style: italic;
    `;
    infoOverlay.appendChild(overlaySubtextEl);
    
    
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
            ${color}30 50%, 
            transparent 100%);
        pointer-events: none;
        opacity: 0;
    `;
    imageContainer.appendChild(scanline);
    
    // Parallax effect
    imageContainer.onmousemove = (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
        image.style.transform = `scale(1.05) translate(${x}px, ${y}px) rotateY(${x * 0.2}deg) rotateX(${-y * 0.2}deg)`;
    };
    
    // Hover
    imageContainer.onmouseenter = () => {
        card.style.borderColor = colorBorderHover;
        image.style.filter = "grayscale(0.2) contrast(1.3) brightness(0.95)";
        image.style.opacity = "1";
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
        card.style.borderColor = colorBorder;
        image.style.transform = "scale(1)";
        image.style.filter = "grayscale(0.4) contrast(1.2) brightness(0.85)";
        image.style.opacity = "0.9";
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
    
    imageContainer.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Click feedback
        image.style.transform = "scale(0.98)";
        
        setTimeout(() => {
            image.style.transform = "scale(1.03)";
            
            // Flash effect
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: radial-gradient(circle, ${color}60 0%, transparent 60%);
                animation: flash-out 0.4s ease-out forwards;
                pointer-events: none;
                z-index: 20;
            `;
            imageContainer.appendChild(flash);
            
            setTimeout(() => {
                flash.remove();
                if (onClick) onClick();
            }, 300);
        }, 80);
    };
    
    return card;
}

// ==========================================
// MODAL SYSTEM
// ==========================================
let activeModal = null;

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('visible');
    setTimeout(() => {
        if (activeModal && activeModal.parentNode) {
            activeModal.parentNode.removeChild(activeModal);
        }
        activeModal = null;
    }, 500);
}

function openModal(options) {
    const { title, buttons, logButton } = options;
    
    // Close any existing modal first
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }
    
    const modal = document.createElement("div");
    modal.className = "home-modal-overlay";
    activeModal = modal;
    
    const modalContent = document.createElement("div");
    modalContent.className = "home-modal-content";
    modal.appendChild(modalContent);
    
    createCorners(modalContent, THEME.color);
    
    // Title
    const modalTitle = document.createElement("h2");
    modalTitle.textContent = title;
    modalTitle.style.cssText = `
        margin: 0;
        color: ${THEME.color};
        font-size: 14px;
        font-weight: 500;
        font-family: "Times New Roman", serif;
        letter-spacing: 4px;
        text-align: center;
        text-transform: uppercase;
        opacity: 0.7;
    `;
    modalContent.appendChild(modalTitle);
    
    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = `
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, ${THEME.color}, transparent);
        margin: -10px 0;
    `;
    modalContent.appendChild(divider);
    
    // Scroll wrapper
    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "home-modal-scroll";
    modalContent.appendChild(scrollWrapper);
    
    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "home-modal-buttons";
    scrollWrapper.appendChild(buttonsContainer);
    
    // Add buttons
    buttons.forEach((btn) => {
        const btnCard = document.createElement("div");
        btnCard.className = "home-btn-card";
        buttonsContainer.appendChild(btnCard);
        
        const btnCorners = createCorners(btnCard, btn.color || THEME.color, 14);
        
        // Image container
        const btnImageContainer = document.createElement("div");
        btnImageContainer.style.cssText = `
            width: 100%;
            height: 180px;
            overflow: hidden;
            background: #000;
            position: relative;
        `;
        btnCard.appendChild(btnImageContainer);
        
        const btnImage = document.createElement("img");
        btnImage.src = app.vault.adapter.getResourcePath(btn.imagePath + ".jpg");
        btnImage.className = 'home-img-no-drag';
        btnImage.draggable = false;
        btnImage.onerror = () => {
            btnImage.src = app.vault.adapter.getResourcePath(btn.imagePath + ".png");
        };
        btnImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.4s ease, filter 0.4s ease;
            filter: grayscale(0.5) contrast(1.2) brightness(0.8);
        `;
        btnImageContainer.appendChild(btnImage);
        
        // Vignette
        const btnVignette = document.createElement("div");
        btnVignette.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.6) 100%);
            pointer-events: none;
        `;
        btnImageContainer.appendChild(btnVignette);
        
        // Scanline
        const btnScanline = document.createElement('div');
        btnScanline.style.cssText = `
            position: absolute;
            top: -100%;
            left: 0;
            right: 0;
            height: 100%;
            background: linear-gradient(180deg, 
                transparent 0%, 
                ${btn.color || THEME.color}30 50%, 
                transparent 100%);
            pointer-events: none;
            opacity: 0;
        `;
        btnImageContainer.appendChild(btnScanline);
        
        // Text section
        const btnTextSection = document.createElement("div");
        btnTextSection.style.cssText = `padding: 20px 22px; background: #0f0f0f;`;
        btnCard.appendChild(btnTextSection);
        
        const btnColor = btn.color || THEME.color;
        const btnColorHover = btn.colorHover || THEME.colorHover;
        
        const btnHeader = document.createElement("h4");
        btnHeader.textContent = btn.title;
        btnHeader.style.cssText = `
            margin: 0 0 8px 0;
            color: ${btnColor};
            font-size: 15px;
            font-weight: 500;
            font-family: "Times New Roman", serif;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: color 0.3s ease;
        `;
        btnTextSection.appendChild(btnHeader);
        
        const btnDescription = document.createElement("p");
        btnDescription.textContent = btn.description;
        btnDescription.style.cssText = `
            margin: 0;
            color: ${btnColor};
            font-size: 13px;
            line-height: 1.5;
            font-family: "Georgia", serif;
            font-style: italic;
            opacity: 0.7;
            transition: color 0.3s ease, opacity 0.3s ease;
        `;
        btnTextSection.appendChild(btnDescription);
        
        // Hover
        btnCard.onmouseenter = () => {
            btnCard.style.borderColor = btnColor;
            btnImage.style.transform = "scale(1.08)";
            btnImage.style.filter = "grayscale(0.2) contrast(1.3) brightness(0.95)";
            btnScanline.style.opacity = "1";
            btnScanline.style.animation = "scanline-sweep 1.5s ease-out";
            btnHeader.style.color = btnColorHover;
            btnDescription.style.color = btnColorHover;
            btnDescription.style.opacity = "0.9";
            
            btnCorners.forEach(c => {
                c.style.width = "24px";
                c.style.height = "24px";
            });
        };
        
        btnCard.onmouseleave = () => {
            btnCard.style.borderColor = "#2a3a2d";
            btnImage.style.transform = "scale(1)";
            btnImage.style.filter = "grayscale(0.5) contrast(1.2) brightness(0.8)";
            btnScanline.style.opacity = "0";
            btnScanline.style.animation = "none";
            btnHeader.style.color = btnColor;
            btnDescription.style.color = btnColor;
            btnDescription.style.opacity = "0.7";
            
            btnCorners.forEach(c => {
                c.style.width = "14px";
                c.style.height = "14px";
            });
        };
        
        btnCard.onclick = (e) => {
            e.stopPropagation();
            btnCard.style.opacity = "0.3";
            btnCard.style.transform = "scale(0.97)";
            closeModal();
            setTimeout(() => {
                if (btn.onClick) btn.onClick();
            }, 150);
        };
    });
    
    // Add Log button if provided
    if (logButton) {
        const logBtnCard = document.createElement("div");
        logBtnCard.className = "home-btn-card";
        logBtnCard.style.cssText += `
            width: 100%;
            max-width: 260px;
            border-style: dashed;
            margin-top: 10px;
        `;
        buttonsContainer.appendChild(logBtnCard);
        
        const logCorners = createCorners(logBtnCard, THEME.color, 14);
        
        // Text only section for log button
        const logTextSection = document.createElement("div");
        logTextSection.style.cssText = `
            padding: 24px 22px;
            background: #0f0f0f;
            text-align: center;
        `;
        logBtnCard.appendChild(logTextSection);
        
        const logIcon = document.createElement("div");
        logIcon.textContent = "📋";
        logIcon.style.cssText = `
            font-size: 24px;
            margin-bottom: 12px;
        `;
        logTextSection.appendChild(logIcon);
        
        const logHeader = document.createElement("h4");
        logHeader.textContent = logButton.title;
        logHeader.style.cssText = `
            margin: 0 0 8px 0;
            color: ${THEME.color};
            font-size: 14px;
            font-weight: 500;
            font-family: "Times New Roman", serif;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: color 0.3s ease;
        `;
        logTextSection.appendChild(logHeader);
        
        const logDescription = document.createElement("p");
        logDescription.textContent = logButton.description;
        logDescription.style.cssText = `
            margin: 0;
            color: ${THEME.colorMuted};
            font-size: 12px;
            font-family: "Georgia", serif;
            font-style: italic;
        `;
        logTextSection.appendChild(logDescription);
        
        logBtnCard.onmouseenter = () => {
            logBtnCard.style.borderColor = THEME.color;
            logHeader.style.color = THEME.colorHover;
            logCorners.forEach(c => {
                c.style.width = "24px";
                c.style.height = "24px";
            });
        };
        
        logBtnCard.onmouseleave = () => {
            logBtnCard.style.borderColor = "#2a3a2d";
            logBtnCard.style.boxShadow = "none";
            logHeader.style.color = THEME.color;
            logCorners.forEach(c => {
                c.style.width = "14px";
                c.style.height = "14px";
            });
        };
        
        logBtnCard.onclick = (e) => {
            e.stopPropagation();
            logBtnCard.style.opacity = "0.3";
            logBtnCard.style.transform = "scale(0.97)";
            closeModal();
            setTimeout(() => {
                if (logButton.onClick) logButton.onClick();
            }, 150);
        };
    }
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Append and trigger animation
    document.body.appendChild(modal);
    
    // Force reflow then add visible class
    modal.offsetHeight;
    requestAnimationFrame(() => {
        modal.classList.add('visible');
    });
    
    return modal;
}

// ==========================================
// RENDER CONTAINER
// ==========================================
const container = dv.el("div", "", {
    attr: { style: `max-width: 480px; margin: 0 auto; padding: 0;` }
});

// ==========================================
// ACTIVITIES CARD
// ==========================================
const activitiesCard = createImageCard({
    title: "Activities",
    description: "Daily pursuits",
    imagePath: "Obsidian/Images/Home activities.jpg",
    overlayTitle: "Open Activities",
    overlaySubtitle: "Select activity type",
    onClick: () => {
        openModal({
            title: "Select Activity",
            buttons: [
                {
                    title: "Workout",
                    description: "Strength and discipline",
                    imagePath: "Obsidian/Images/Workout",
                    color: "#9a8c7a",
                    colorHover: "#aa9c8a",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Workout hub")}`;
                    }
                },
                {
                    title: "Cardio",
                    description: "Endurance and vitality",
                    imagePath: "Obsidian/Images/Cardio",
                    color: "#7a8c9a",
                    colorHover: "#8a9caa",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Cardio hub")}`;
                    }
                },
                {
                    title: "Reading",
                    description: "Knowledge and reflection",
                    imagePath: "Obsidian/Images/Reading",
                    color: "#7a9a7d",
                    colorHover: "#8aaa8d",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Reading hub")}`;
                    }
                },
                {
                    title: "Drum practice",
                    description: "Rhythm and expression",
                    imagePath: "Obsidian/Images/Drum practice",
                    color: "#9a7a7a",
                    colorHover: "#aa8a8a",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Drum practice hub")}`;
                    }
                },
                {
                    title: "Research about health",
                    description: "Wellness and understanding",
                    imagePath: "Obsidian/Images/Research about health",
                    color: "#7a9a7a",
                    colorHover: "#8aaa8a",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Research about health hub")}`;
                    }
                },
                {
                    title: "Social",
                    description: "Connection and community",
                    imagePath: "Obsidian/Images/Social",
                    color: "#9a867a",
                    colorHover: "#aa968a",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Social hub")}`;
                    }
                },
                {
                    title: "Drawing",
                    description: "Creation and expression",
                    imagePath: "Obsidian/Images/Drawing",
                    color: "#7a949a",
                    colorHover: "#7a949a",
                    onClick: () => {
                        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home/Activities/Drawing hub")}`;
                    }
                }
            ],
            logButton: {
                title: "Activities Log",
                description: "View all activity records",
                onClick: () => {
                    window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Activities-log")}`;
                }
            }
        });
    }
});
container.appendChild(activitiesCard);

// ==========================================
// NOTES CARD
// ==========================================
const notesCard = createImageCard({
    title: "Notes",
    description: "Archive of thought",
    imagePath: "Obsidian/Images/Home notes.jpg",
    overlayTitle: "Open Archive",
    overlaySubtitle: "Select note type",
    onClick: () => {
        openModal({
            title: "Select Category",
            buttons: [
                {
                    title: "Fleeting Thoughts",
                    description: "New ideas worth preserving",
                    imagePath: "Obsidian/Images/Polaroid image",
                    onClick: () => {
                        const now = new Date();
                        const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
                        const fileName = `Fleeting Thought ${timestamp}`;
                        const content = `---
editor-width: 100
banner: "![[fleeting notes.jpg]]"
localCoverImage: "[[fleeting notes.jpg]]"
cssclasses:
  - hide-properties
---

`;
                        app.vault.create(`Mementos/${fileName}.md`, content).then(() => {
                            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent('Mementos/' + fileName)}`;
                        });
                    }
                },
                {
                    title: "Uncategorized Knowledge",
                    description: "Ideas that earned permanence",
                    imagePath: "Obsidian/Images/Tattoos image",
                    onClick: () => {
                        const now = new Date();
                        const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
                        const fileName = `Note ${timestamp}`;
                        const content = `---
editor-width: 100
banner: "![[uncategorized knowledge.jpg]]"
localCoverImage: "[[uncategorized knowledge.jpg]]"
cssclasses:
  - hide-properties
---

`;
                        app.vault.create(`Uncategorized ideas/${fileName}.md`, content).then(() => {
                            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent('Uncategorized ideas/' + fileName)}`;
                        });
                    }
                },
                {
                    title: "Brainstorms",
                    description: "Raw thought in motion",
                    imagePath: "Obsidian/Images/Brainstorm",
                    onClick: () => {
                        const now = new Date();
                        const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
                        const fileName = `Brainstorm ${timestamp}`;
                        const content = `---
editor-width: 100
banner: "![[brainstorms.png]]"
localCoverImage: "[[brainstorms.png]]"
cssclasses:
  - hide-properties
---

`;
                        app.vault.create(`Brainstorms/${fileName}.md`, content).then(() => {
                            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent('Brainstorms/' + fileName)}`;
                        });
                    }
                }
            ],
            logButton: {
                title: "Archive",
                description: "View all quick notes",
                onClick: () => {
                    window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Archive")}`;
                }
            }
        });
    }
});
container.appendChild(notesCard);
```

```dataviewjs
// ==========================================
// RECENT FILES - DARK ACADEMIA EDITION
// ==========================================

const VAULT_NAME = "Alt society";

const THEME = {
    color: "#7a9a7d",
    colorHover: "#8aaa8d",
    colorBorder: "#2a3a2d",
    colorMuted: "#5a6a5d"
};

// Excluded folders and files
const excludedFolders = ["Home", "Personal Life", "Obsidian"];
const excludedFiles = ["Home"];

// Get recent files
const allFiles = dv.pages()
    .where(p => {
        const path = p.file.path;
        const name = p.file.name;
        
        // Exclude specific folders
        for (const folder of excludedFolders) {
            if (path.startsWith(folder + "/") || path === folder) {
                return false;
            }
        }
        
        // Exclude specific files
        if (excludedFiles.includes(name)) {
            return false;
        }
        
        return true;
    })
    .sort(p => p.file.mtime, 'desc')
    .limit(5)
    .array();

// Create card
const card = dv.el("div", "");
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    padding: 0;
    margin: 40px 0;
    background: #0a0a0a;
    position: relative;
    overflow: visible;
`;

// Corners
['TL', 'TR', 'BL', 'BR'].forEach(pos => {
    const corner = document.createElement('div');
    const isTop = pos.includes('T');
    const isLeft = pos.includes('L');
    corner.style.cssText = `
        position: absolute;
        ${isTop ? 'top: 0' : 'bottom: 0'};
        ${isLeft ? 'left: 0' : 'right: 0'};
        width: 18px;
        height: 18px;
        border-${isTop ? 'top' : 'bottom'}: 1px solid ${THEME.color};
        border-${isLeft ? 'left' : 'right'}: 1px solid ${THEME.color};
        z-index: 10;
        pointer-events: none;
    `;
    card.appendChild(corner);
});

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
desc.textContent = "Latest writings";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Files list
const listContainer = document.createElement('div');
listContainer.style.cssText = `padding: 16px 20px;`;
card.appendChild(listContainer);

if (allFiles.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = "No recent files found.";
    emptyMsg.style.cssText = `
        text-align: center;
        padding: 20px;
        color: ${THEME.colorMuted};
        font-style: italic;
        font-family: "Georgia", serif;
    `;
    listContainer.appendChild(emptyMsg);
} else {
    allFiles.forEach((file, index) => {
        const item = document.createElement('a');
        item.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(file.file.path)}`;
        item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            margin-bottom: ${index < allFiles.length - 1 ? '8px' : '0'};
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        listContainer.appendChild(item);
        
        // Left side: icon + name
        const leftSide = document.createElement('div');
        leftSide.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        `;
        item.appendChild(leftSide);
        
        const icon = document.createElement('span');
        icon.textContent = "📄";
        icon.style.cssText = `font-size: 16px; flex-shrink: 0;`;
        leftSide.appendChild(icon);
        
        const nameEl = document.createElement('span');
        nameEl.textContent = file.file.name;
        nameEl.style.cssText = `
            color: ${THEME.color};
            font-size: 14px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.3s ease;
        `;
        leftSide.appendChild(nameEl);
        
        // Right side: date
        const dateEl = document.createElement('span');
        const mtime = new Date(file.file.mtime);
        const now = new Date();
        const diffDays = Math.floor((now - mtime) / (1000 * 60 * 60 * 24));
        
        let dateText;
        if (diffDays === 0) {
            dateText = "Today";
        } else if (diffDays === 1) {
            dateText = "Yesterday";
        } else if (diffDays < 7) {
            dateText = `${diffDays}d ago`;
        } else {
            dateText = mtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        dateEl.textContent = dateText;
        dateEl.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 11px;
            font-family: "Georgia", serif;
            font-style: italic;
            flex-shrink: 0;
            margin-left: 12px;
        `;
        item.appendChild(dateEl);
        
        // Hover
        item.onmouseenter = () => {
            item.style.borderColor = THEME.color;
            item.style.background = "#121212";
            nameEl.style.color = THEME.colorHover;
        };
        
        item.onmouseleave = () => {
            item.style.borderColor = THEME.colorBorder;
            item.style.background = "#0f0f0f";
            item.style.boxShadow = "none";
            nameEl.style.color = THEME.color;
        };
    });
}
```

---

### Books
![[Academic Library.base]]
```dataviewjs
// ==========================================
// TAG CLOUD - REFINED OPULENCE EDITION
// ==========================================

const THEME = {
    color: "#7a9a7d",
    colorHover: "#8aaa8d",
    colorBorder: "#2a3a2d",
    colorMuted: "#5a6a5d"
};

// Create container card
const card = dv.el("div", "", {cls: "tag-cloud-card"});

card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    padding: 0;
    margin: 40px 0;
    background: #0a0a0a;
    position: relative;
    overflow: visible;
`;

// Decorative corners
const corners = ['TL', 'TR', 'BL', 'BR'];
corners.forEach(pos => {
    const corner = document.createElement('div');
    const isTop = pos.includes('T');
    const isLeft = pos.includes('L');
    
    corner.style.cssText = `
        position: absolute;
        ${isTop ? 'top: 0' : 'bottom: 0'};
        ${isLeft ? 'left: 0' : 'right: 0'};
        width: 18px;
        height: 18px;
        border-${isTop ? 'top' : 'bottom'}: 1px solid ${THEME.color};
        border-${isLeft ? 'left' : 'right'}: 1px solid ${THEME.color};
        z-index: 10;
        transition: all 0.4s ease;
    `;
    card.appendChild(corner);
});

// Header section
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Tags";
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
desc.textContent = "Navigate by topic";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Tags container
const tagsContainer = document.createElement('div');
tagsContainer.style.cssText = `
    padding: 24px 28px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #3a4a3d #0a0a0a;
`;
card.appendChild(tagsContainer);

// Get all pages
let pages = dv.pages();

// Flatten all tags
let allTags = [];
for (let page of pages) {
    if (page.file.tags) {
        allTags.push(...page.file.tags);
    }
}

// Count occurrences
let tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
}, {});

// Sort alphabetically
let sortedTags = Object.keys(tagCounts).sort((a, b) => a.localeCompare(b));

// Render tags
for (let tag of sortedTags) {
    let count = tagCounts[tag];
    
    let chip = document.createElement("a");
    chip.href = `obsidian://search?query=${encodeURIComponent(tag)}`;
    chip.textContent = `${tag} (${count})`;
    chip.style.cssText = `
        display: inline-block;
        padding: 8px 14px;
        background: #0f0f0f;
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-size: 12px;
        font-family: "Times New Roman", serif;
        letter-spacing: 0.5px;
        text-decoration: none;
        transition: all 0.3s ease;
        cursor: pointer;
    `;
    
    chip.onmouseover = () => {
        chip.style.borderColor = THEME.color;
        chip.style.color = THEME.colorHover;
        chip.style.background = "#121212";
    };
    
    chip.onmouseout = () => {
        chip.style.borderColor = THEME.colorBorder;
        chip.style.color = THEME.color;
        chip.style.background = "#0f0f0f";
        chip.style.boxShadow = "none";
    };
    
    tagsContainer.appendChild(chip);
}

if (sortedTags.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = "No tags found yet.";
    emptyMsg.style.cssText = `
        text-align: center;
        padding: 20px;
        color: ${THEME.colorMuted};
        font-style: italic;
        font-family: "Georgia", serif;
        width: 100%;
    `;
    tagsContainer.appendChild(emptyMsg);
}
```
<div style="height: 25px;"></div>

---
