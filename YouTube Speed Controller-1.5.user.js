// ==UserScript==
// @name         YouTube Speed Controller
// @name:ru      Контроллер скорости YouTube
// @namespace    https://github.com/Salyts/YouTube-Speed-Controller.git
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @version      1.5
// @description  Fully customizable speed controller.
// @description:ru Полностью настраиваемый регулятор скорости.
// @author       Salyts (Mod)
// @match        *://www.youtube.com/*
// @grant        none
// @resource     materialIcons https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=fast_forward
// ==/UserScript==

(function() {
    'use strict';

const CONFIG = {
    // General
    maxSpeed: 4.0,
    minSpeed: 0.10,
    scrollStep: 0.10,
    sliderStep: 0.10,
    plusMinusStep: 0.10,
    presetButtons: [0.5, 1, 1.5, 2, 3, 4],
    showTrailingZeros: false,

    // Hold
    holdSpeed: 2,
    indicatorSeconds: 2,
    holdIndicatorSeconds: 4,
    hideCursorOnHold: true,

    // Visuals
    mainColor: '#ff0000',
    menuBg: 'rgba(0, 0, 0, 0.65)',
    blurAmount: '0px',
    borderRadius: '15px',
    menuWidth: '240px',
    menuSpeed: '0.25s',
    menuTransitionType: 'cubic-bezier(0.4, 0, 0.2, 1)',
    labelTitle: 'Playback speed',

    // Text
    textColor: '#ffffff',
    mutedTextColor: '#ffffff',
    fontSizeSmall: '12px',
    fontSizeMedium: '13px',
    fontSizeLarge: '14px',

    // Slider
    sliderTrackColor: 'rgba(255, 255, 255, 0.2)',
    sliderHeight: '4px',
    sliderThumbSize: '15px',
    sliderThumbBorder: '2px',
    sliderAnimDuration: 150,

    // Preset and -/+ buttons
    btnBg: 'rgba(255, 255, 255, 0.10)',
    btnHoverBg: 'rgba(255, 255, 255, 0.15)',
    btnTextColor: '#cccccc',
    btnActiveTextColor: '#ffffff',
    btnRadius: '30px',
    plusMinusBtnWidth: '30px',

    // Borders and shadows
    boxShadow: '0 4px 24px rgba(0,0,0,0.0)',
    borderStyle: '1px solid rgba(255,255,255,0.00)',

    // Center screen indicator
    indicatorBg: 'rgba(0,0,0,0.6)',
    indicatorColor: '#ffffff',
    indicatorRadius: '20px',

    // Optional
    hideNativeSpeed: true,
    githubUrl: 'https://github.com/Salyts/YouTube-Speed-Controller'
};

    let lastRate = 1.0;
    let isHolding = false;
    let manualChangeActive = false;
    let sliderAnimationId = null;
    // FIX: dedicated spacebar hold state, separate from YouTube's native hold
    let spaceHolding = false;
    let spaceHoldTimer = null;

    // Inject Material Symbols font for fast_forward icon
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=fast_forward';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = `
        .ytp-speedmaster-overlay, .ytp-bezel-text-wrapper { display: none !important; }

        .hide-cursor, .hide-cursor * { cursor: none !important; }

        .speed-btn-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 0 4px;
            height: 100%;
            z-index: 2147483647 !important;
        }

        #custom-speed-trigger {
            background: none;
            border: none;
            color: ${CONFIG.textColor} !important;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            width: 44px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            opacity: 0.9;
            font-family: "YouTube Sans", Roboto, Arial, sans-serif;
            transition: background-color 0.1s ease;
            outline: none;
        }
        #custom-speed-trigger:hover { background-color: ${CONFIG.btnHoverBg}; opacity: 1; }

        #speed-video-blocker {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: transparent;
            z-index: 50;
            display: none;
        }

        #speed-menu-box {
            position: absolute;
            bottom: calc(100% + 15px);
            right: 50%;
            transform: translateX(50%) translateY(12px);
            width: ${CONFIG.menuWidth};
            background: ${CONFIG.menuBg};
            backdrop-filter: blur(${CONFIG.blurAmount});
            -webkit-backdrop-filter: blur(${CONFIG.blurAmount});
            border-radius: ${CONFIG.borderRadius};
            padding: 8px 12px 12px 12px;
            display: none;
            flex-direction: column;
            z-index: 100003 !important;
            box-shadow: ${CONFIG.boxShadow};
            border: ${CONFIG.borderStyle};
            opacity: 0;
            transition: opacity ${CONFIG.menuSpeed} ${CONFIG.menuTransitionType},
                        transform ${CONFIG.menuSpeed} ${CONFIG.menuTransitionType};
        }

        #speed-menu-box.show {
            display: flex !important;
            opacity: 1;
            transform: translateX(50%) translateY(0);
        }

        .speed-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            height: 24px;
        }

        .home-link {
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.6;
            transition: 0.2s;
            padding: 4px;
            margin-right: 4px;
        }
        .home-link:hover { opacity: 1; transform: scale(1.1); }
        .home-link svg { fill: ${CONFIG.textColor}; width: 18px; height: 18px; }

        .s-slider-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 8px 0 10px 0;
        }

        .s-pm-btn {
            background: ${CONFIG.btnBg};
            border: none;
            color: ${CONFIG.textColor};
            width: ${CONFIG.plusMinusBtnWidth};
            height: 24px;
            border-radius: ${CONFIG.btnRadius};
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
            flex-shrink: 0;
        }
        .s-pm-btn:hover { background: ${CONFIG.btnHoverBg}; }

        .s-slider {
            -webkit-appearance: none;
            width: 100%;
            height: ${CONFIG.sliderHeight};
            background: ${CONFIG.sliderTrackColor};
            border-radius: calc(${CONFIG.sliderHeight} / 2);
            cursor: pointer;
            outline: none;
            margin: 0;
        }
        .s-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: ${CONFIG.sliderThumbSize};
            height: ${CONFIG.sliderThumbSize};
            background: #fff;
            border: ${CONFIG.sliderThumbBorder} solid ${CONFIG.mainColor};
            border-radius: 50%;
        }

        .s-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .s-btn {
            background: ${CONFIG.btnBg};
            border: none;
            color: ${CONFIG.btnTextColor};
            padding: 6px 0;
            font-size: ${CONFIG.fontSizeSmall};
            border-radius: ${CONFIG.btnRadius};
            cursor: pointer;
            transition: 0.15s;
        }
        .s-btn:hover { background: ${CONFIG.btnHoverBg}; color: ${CONFIG.textColor}; }
        .s-btn.active { background: ${CONFIG.mainColor}; color: ${CONFIG.btnActiveTextColor}; font-weight: bold; }

        .speed-menu-close {
            cursor: pointer;
            opacity: 0.5;
            display: flex;
            align-items: center;
            transition: 0.2s;
            padding: 4px;
        }
        .speed-menu-close:hover { opacity: 1; }

        #speed-indicator {
            position: absolute;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: ${CONFIG.indicatorBg};
            color: ${CONFIG.indicatorColor};
            padding: 10px 20px;
            border-radius: ${CONFIG.indicatorRadius};
            font-size: 18px;
            z-index: 100004;
            pointer-events: none;
            display: none;
            backdrop-filter: blur(4px);
            display: none;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }

        #speed-indicator .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 22px;
            font-weight: 400;
            line-height: 1;
            vertical-align: middle;
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: none;
        }

        #speed-indicator.hold-mode .material-symbols-outlined {
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

    function formatSpeed(val) {
        let num = parseFloat(val);
        return CONFIG.showTrailingZeros ? num.toFixed(2) + 'x' : parseFloat(num.toFixed(2)) + 'x';
    }

    function createSVG(viewBox, width, height, pathD, pathFill) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', viewBox);
        if (width) svg.setAttribute('width', width);
        if (height) svg.setAttribute('height', height);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        if (pathFill) path.setAttribute('fill', pathFill);
        svg.appendChild(path);
        return svg;
    }

    function showIndicator(text, duration, isHoldMode = false) {
        let ind = document.getElementById('speed-indicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'speed-indicator';

            // Text element first
            const textSpan = document.createElement('span');
            textSpan.id = 'speed-indicator-text';
            ind.appendChild(textSpan);

            // Icon element after text (hidden by default, shown in hold mode via CSS)
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.textContent = 'fast_forward';
            ind.appendChild(icon);

            document.querySelector('#movie_player')?.appendChild(ind);
        }

        const textSpan = document.getElementById('speed-indicator-text');
        if (textSpan) textSpan.textContent = text;

        // Toggle hold-mode class to show/hide icon via CSS
        ind.classList.toggle('hold-mode', isHoldMode);

        ind.style.display = 'flex';
        clearTimeout(window.speedTimeout);

        if (duration !== -1) {
            window.speedTimeout = setTimeout(() => {
                if (ind) ind.style.display = 'none';
            }, duration * 1000);
        }
    }

    function animateSliderTo(targetValue) {
        const slider = document.getElementById('s-input');
        if (!slider) return;

        const startValue = parseFloat(slider.value);
        const endValue = parseFloat(targetValue);

        if (Math.abs(startValue - endValue) < 0.01) {
            slider.value = endValue;
            return;
        }

        const duration = CONFIG.sliderAnimDuration;
        const startTime = performance.now();

        if (sliderAnimationId) cancelAnimationFrame(sliderAnimationId);

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress * (2 - progress);
            slider.value = startValue + (endValue - startValue) * ease;
            if (progress < 1) {
                sliderAnimationId = requestAnimationFrame(step);
            } else {
                slider.value = endValue;
            }
        }
        sliderAnimationId = requestAnimationFrame(step);
    }

    function setRate(val, showVisual = false, fromSlider = false) {
        const video = document.querySelector('video');
        if (video) {
            manualChangeActive = true;
            let num = Math.round(parseFloat(val) * 100) / 100;
            num = Math.max(CONFIG.minSpeed, Math.min(CONFIG.maxSpeed, num));
            lastRate = num;
            video.playbackRate = lastRate;

            const speedText = formatSpeed(lastRate);

            if (showVisual) {
                showIndicator(speedText, CONFIG.indicatorSeconds, false);
            }

            const trigger = document.getElementById('custom-speed-trigger');
            if (trigger) trigger.textContent = speedText;

            const sVal = document.getElementById('s-val');
            if (sVal) sVal.textContent = speedText;

            const sInput = document.getElementById('s-input');
            if (sInput && !fromSlider) {
                animateSliderTo(lastRate);
            }

            document.querySelectorAll('.s-btn').forEach(b => {
                b.classList.toggle('active', parseFloat(b.dataset.v) === lastRate);
            });

            setTimeout(() => { manualChangeActive = false; }, 100);
        }
    }

    // FIX: Spacebar hold — intercept keydown/keyup directly on document
    // YouTube uses Space to play/pause on keydown. We intercept it to also
    // trigger hold-speed on long press, without breaking the play/pause toggle.
    function setupSpacebarHold() {
        if (document._spaceHoldBound) return;
        document._spaceHoldBound = true;

        document.addEventListener('keydown', (e) => {
            // Only act when focus is on the player/body, not in a text input
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;

            if (e.code === 'Space' && !e.repeat && !spaceHolding) {
                // Start a timer: if held longer than 300ms, activate hold speed
                spaceHoldTimer = setTimeout(() => {
                    const video = document.querySelector('video');
                    if (!video) return;
                    spaceHolding = true;
                    isHolding = true;

                    // Make sure video is playing while held
                    if (video.paused) video.play();

                    video.playbackRate = CONFIG.holdSpeed;

                    const playerElement = document.querySelector('#movie_player');
                    if (CONFIG.hideCursorOnHold && playerElement) playerElement.classList.add('hide-cursor');

                    showIndicator(
                        formatSpeed(CONFIG.holdSpeed),
                        CONFIG.holdIndicatorSeconds,
                        true  // show fast_forward icon
                    );
                }, 300);
            }
        }, true);

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                clearTimeout(spaceHoldTimer);

                if (spaceHolding) {
                    // Release hold — restore speed, keep video in whatever play state it was
                    spaceHolding = false;
                    isHolding = false;

                    const video = document.querySelector('video');
                    if (video) video.playbackRate = lastRate;

                    const playerElement = document.querySelector('#movie_player');
                    if (playerElement) playerElement.classList.remove('hide-cursor');

                    const ind = document.getElementById('speed-indicator');
                    if (ind) ind.style.display = 'none';
                    clearTimeout(window.speedTimeout);
                }
                // If timer didn't fire yet (short tap), YouTube's own handler
                // already handled play/pause — we do nothing extra.
            }
        }, true);
    }

    function toggleMenu(forceClose = false) {
        const box = document.getElementById('speed-menu-box');
        const blocker = document.getElementById('speed-video-blocker');
        if (!box) return;

        if (forceClose || box.classList.contains('show')) {
            box.classList.remove('show');
            if (blocker) blocker.style.display = 'none';
            setTimeout(() => { if (!box.classList.contains('show')) box.style.display = 'none'; }, parseFloat(CONFIG.menuSpeed) * 1000);
        } else {
            box.style.display = 'flex';
            if (blocker) blocker.style.display = 'block';
            setTimeout(() => box.classList.add('show'), 10);
        }
    }

    function init() {
        if (document.getElementById('custom-speed-trigger')) return;
        const controls = document.querySelector('.ytp-right-controls');
        const player = document.querySelector('#movie_player');
        if (!controls || !player) return;

        const video = document.querySelector('video');
        if (video) lastRate = Math.round(video.playbackRate * 100) / 100;

        if (!document.getElementById('speed-video-blocker')) {
            const blk = document.createElement('div');
            blk.id = 'speed-video-blocker';
            player.appendChild(blk);
            blk.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu(true);
            };
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'speed-btn-wrapper';

        const trigger = document.createElement('button');
        trigger.id = 'custom-speed-trigger';
        trigger.textContent = formatSpeed(lastRate);
        trigger.onclick = (e) => { e.stopPropagation(); toggleMenu(); };
        wrapper.appendChild(trigger);

        const menuBox = document.createElement('div');
        menuBox.id = 'speed-menu-box';

        const header = document.createElement('div');
        header.className = 'speed-header';

        const headerLeft = document.createElement('div');
        headerLeft.style.display = 'flex';
        headerLeft.style.alignItems = 'center';

        const ghLink = document.createElement('a');
        ghLink.href = CONFIG.githubUrl;
        ghLink.target = '_blank';
        ghLink.className = 'home-link';
        ghLink.title = 'GitHub';
        ghLink.appendChild(createSVG('0 -960 960 960', null, null, 'M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z'));

        const titleSpan = document.createElement('span');
        titleSpan.style.fontSize = CONFIG.fontSizeMedium;
        titleSpan.style.color = CONFIG.mutedTextColor;
        titleSpan.style.fontWeight = '500';
        titleSpan.textContent = CONFIG.labelTitle;

        headerLeft.appendChild(ghLink);
        headerLeft.appendChild(titleSpan);

        const headerRight = document.createElement('div');
        headerRight.style.display = 'flex';
        headerRight.style.alignItems = 'center';
        headerRight.style.gap = '8px';

        const sVal = document.createElement('b');
        sVal.id = 's-val';
        sVal.style.color = CONFIG.textColor;
        sVal.style.fontSize = CONFIG.fontSizeLarge;
        sVal.textContent = formatSpeed(lastRate);

        const closeBtn = document.createElement('div');
        closeBtn.className = 'speed-menu-close';
        closeBtn.id = 'speed-close-x';
        closeBtn.appendChild(createSVG('0 0 24 24', '14', '14', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z', CONFIG.textColor));
        closeBtn.onclick = (e) => { e.stopPropagation(); toggleMenu(true); };

        headerRight.appendChild(sVal);
        headerRight.appendChild(closeBtn);

        header.appendChild(headerLeft);
        header.appendChild(headerRight);
        menuBox.appendChild(header);

        const sliderRow = document.createElement('div');
        sliderRow.className = 's-slider-row';

        const minusBtn = document.createElement('button');
        minusBtn.className = 's-pm-btn';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => setRate(lastRate - CONFIG.plusMinusStep);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 's-input';
        slider.className = 's-slider';
        slider.min = CONFIG.minSpeed;
        slider.max = CONFIG.maxSpeed;
        slider.step = CONFIG.sliderStep;
        slider.value = lastRate;
        slider.oninput = (e) => setRate(e.target.value, false, true);

        const plusBtn = document.createElement('button');
        plusBtn.className = 's-pm-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => setRate(lastRate + CONFIG.plusMinusStep);

        sliderRow.appendChild(minusBtn);
        sliderRow.appendChild(slider);
        sliderRow.appendChild(plusBtn);
        menuBox.appendChild(sliderRow);

        const grid = document.createElement('div');
        grid.className = 's-grid';
        CONFIG.presetButtons.forEach(v => {
            const btn = document.createElement('button');
            btn.className = 's-btn';
            btn.dataset.v = v;
            btn.textContent = formatSpeed(v);
            if (parseFloat(v) === lastRate) btn.classList.add('active');
            btn.onclick = () => setRate(v);
            grid.appendChild(btn);
        });
        menuBox.appendChild(grid);

        wrapper.appendChild(menuBox);
        controls.insertBefore(wrapper, controls.firstChild);

        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault(); e.stopPropagation();
            setRate(lastRate + (e.deltaY < 0 ? 1 : -1) * CONFIG.scrollStep, true);
        }, { passive: false });
    }

    window.addEventListener('wheel', (e) => {
        if (e.shiftKey) {
            const player = document.querySelector('#movie_player');
            if (player && player.contains(e.target)) {
                e.preventDefault(); e.stopImmediatePropagation();
                setRate(lastRate + (e.deltaY < 0 ? 1 : -1) * CONFIG.scrollStep, true);
            }
        }
    }, { capture: true, passive: false });

    // Setup spacebar hold listener once
    setupSpacebarHold();

    setInterval(() => {
        init();
        const box = document.getElementById('speed-menu-box');
        const player = document.querySelector('#movie_player');
        const video = document.querySelector('video');

        if (box && box.classList.contains('show') && player) player.wakeUpControls();

        if (video) {
            // Keep playbackRate in sync if something external changed it (and we're not holding)
            if (!isHolding && !manualChangeActive && !spaceHolding) {
                const currentRate = Math.round(video.playbackRate * 100) / 100;
                if (currentRate !== lastRate && currentRate !== CONFIG.holdSpeed) {
                    // External change (e.g. YouTube's own speed menu) — sync our state
                    lastRate = currentRate;
                    const trigger = document.getElementById('custom-speed-trigger');
                    if (trigger) trigger.textContent = formatSpeed(lastRate);
                    const sVal = document.getElementById('s-val');
                    if (sVal) sVal.textContent = formatSpeed(lastRate);
                    animateSliderTo(lastRate);
                    document.querySelectorAll('.s-btn').forEach(b => {
                        b.classList.toggle('active', parseFloat(b.dataset.v) === lastRate);
                    });
                }
            }
        }

        const playerElement = document.querySelector('#movie_player');
        if (playerElement && !isHolding && !spaceHolding && playerElement.classList.contains('hide-cursor')) {
            playerElement.classList.remove('hide-cursor');
        }

        if (CONFIG.hideNativeSpeed) {
            document.querySelectorAll('.ytp-menuitem').forEach(item => {
                if (item.textContent.toLowerCase().includes('speed') || item.textContent.toLowerCase().includes('скорость')) item.style.display = 'none';
            });
        }
    }, 500);
})();
