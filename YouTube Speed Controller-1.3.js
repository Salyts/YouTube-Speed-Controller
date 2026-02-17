// ==UserScript==
// @name         YouTube Speed Controller
// @name:ru      Контроллер скорости YouTube
// @namespace    https://github.com/Salyts/YouTube-Speed-Controller.git
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @version      1.3
// @description  Fully customizable speed controller.
// @description:ru Полностью настраиваемый регулятор скорости=.
// @author       Salyts
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        // General
        maxSpeed: 4.0, // Maximum speed on the slider
        minSpeed: 0.25, // Minimum speed
        scrollStep: 0.25, // Step when using mouse wheel (shift + scroll mouse)
        sliderStep: 0.25, // Step for the UI slider
        presetButtons: [0.5, 1, 1.25, 1.5, 2, 2.25, 2.5, 3, 3.25], // Quick buttons

        // Hold
        // (When you hold down the spacebar or mouse button)
        holdSpeed: 2, // Speed when clamped
        indicatorSeconds: 2, // Speed indicator in seconds for normal changes
        holdIndicatorSeconds: 4, // Speed indicator in seconds for hold mode (-1 = until released)
        hideCursorOnHold: true, // Hide cursor on hold (true/false)

        // Visuals
        // (There will be more in the future)
        mainColor: '#ff0000',
        menuBg: 'rgba(15, 15, 15, 0.95)',
        blurAmount: '12px',
        borderRadius: '12px',
        menuSpeed: '0.25s',
        menuTransitionType: 'cubic-bezier(0.4, 0, 0.2, 1)',
        labelTitle: 'Playback speed',

        // Not necessarily
        hideNativeSpeed: true,
        githubUrl: 'https://github.com/Salyts/YouTube-Speed-Controller'
    };

    let lastRate = 1.0;
    let isHolding = false;
    let manualChangeActive = false; // Flag to prevent cursor bug

    const style = document.createElement('style');
    style.innerHTML = `
        /* Hide native UI elements */
        .ytp-speedmaster-overlay, .ytp-bezel-text-wrapper { display: none !important; }

        /* Class to hide cursor */
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
            color: #fff !important;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            width: 54px;
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
        #custom-speed-trigger:hover { background-color: rgba(255, 255, 255, 0.15); opacity: 1; }

        #speed-video-blocker {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: transparent;
            z-index: 50;
            display: none;
        }

        #speed-menu-box {
            position: absolute;
            bottom: 52px;
            right: 0;
            width: 210px;
            background: ${CONFIG.menuBg};
            backdrop-filter: blur(${CONFIG.blurAmount});
            -webkit-backdrop-filter: blur(${CONFIG.blurAmount});
            border-radius: ${CONFIG.borderRadius};
            padding: 8px 12px 12px 12px;
            display: none;
            flex-direction: column;
            z-index: 100003 !important;
            box-shadow: 0 4px 24px rgba(0,0,0,0.6);
            border: 1px solid rgba(255,255,255,0.08);
            opacity: 0;
            transform: translateY(12px);
            transition: opacity ${CONFIG.menuSpeed} ${CONFIG.menuTransitionType},
                        transform ${CONFIG.menuSpeed} ${CONFIG.menuTransitionType};
        }

        #speed-menu-box.show {
            display: flex !important;
            opacity: 1;
            transform: translateY(0);
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
        .home-link svg { fill: #fff; width: 18px; height: 18px; }

        .s-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            margin: 8px 0 10px 0;
            cursor: pointer;
            outline: none;
        }
        .s-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px; height: 12px;
            background: #fff;
            border: 2px solid ${CONFIG.mainColor};
            border-radius: 50%;
        }

        .s-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .s-btn {
            background: rgba(255,255,255,0.08);
            border: none;
            color: #ccc;
            padding: 6px 0;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
        }
        .s-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .s-btn.active { background: ${CONFIG.mainColor}; color: #fff; font-weight: bold; }

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
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 18px;
            z-index: 100004;
            pointer-events: none;
            display: none;
            backdrop-filter: blur(4px);
        }
    `;
    document.head.appendChild(style);

    function showIndicator(text, duration) {
        let ind = document.getElementById('speed-indicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'speed-indicator';
            document.querySelector('#movie_player')?.appendChild(ind);
        }
        ind.innerText = text;
        ind.style.display = 'block';
        clearTimeout(window.speedTimeout);

        if (duration !== -1) {
            window.speedTimeout = setTimeout(() => { if(ind) ind.style.display = 'none'; }, duration * 1000);
        }
    }

    function setRate(val, showVisual = false) {
        const video = document.querySelector('video');
        if (video) {
            manualChangeActive = true; // Mark as manual to prevent hold logic trigger
            let num = Math.round(parseFloat(val) * 100) / 100;
            num = Math.max(CONFIG.minSpeed, Math.min(CONFIG.maxSpeed, num));
            lastRate = num;
            video.playbackRate = lastRate;

            const speedText = parseFloat(lastRate.toFixed(2)) + 'x';

            if (showVisual) {
                showIndicator(speedText, CONFIG.indicatorSeconds);
            }

            const trigger = document.getElementById('custom-speed-trigger');
            if(trigger) trigger.innerText = speedText;
            const sVal = document.getElementById('s-val');
            if(sVal) sVal.innerText = speedText;
            const sInput = document.getElementById('s-input');
            if(sInput) sInput.value = lastRate;
            document.querySelectorAll('.s-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.v) === lastRate));

            setTimeout(() => { manualChangeActive = false; }, 100);
        }
    }

    function toggleMenu(forceClose = false) {
        const box = document.getElementById('speed-menu-box');
        const blocker = document.getElementById('speed-video-blocker');
        if (!box) return;

        if (forceClose || box.classList.contains('show')) {
            box.classList.remove('show');
            if(blocker) blocker.style.display = 'none';
            setTimeout(() => { if(!box.classList.contains('show')) box.style.display = 'none'; }, 300);
        } else {
            box.style.display = 'flex';
            if(blocker) blocker.style.display = 'block';
            setTimeout(() => box.classList.add('show'), 10);
        }
    }

    function init() {
        if (document.getElementById('custom-speed-trigger')) return;
        const controls = document.querySelector('.ytp-right-controls');
        const player = document.querySelector('#movie_player');
        if (!controls || !player) return;

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
        let buttonsHtml = CONFIG.presetButtons.map(v => `<button class="s-btn" data-v="${v}">${v}x</button>`).join('');

        wrapper.innerHTML = `
            <button id="custom-speed-trigger">1x</button>
            <div id="speed-menu-box">
                <div class="speed-header">
                    <div style="display:flex; align-items:center;">
                        <a href="${CONFIG.githubUrl}" target="_blank" class="home-link" title="GitHub">
                            <svg viewBox="0 -960 960 960"><path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/></svg>
                        </a>
                        <span style="font-size:13px; color:#aaa; font-weight:500;">${CONFIG.labelTitle}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <b id="s-val" style="color:#fff; font-size:14px;">1x</b>
                        <div class="speed-menu-close" id="speed-close-x">
                            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </div>
                    </div>
                </div>
                <input type="range" id="s-input" class="s-slider" min="${CONFIG.minSpeed}" max="${CONFIG.maxSpeed}" step="${CONFIG.sliderStep}" value="1">
                <div class="s-grid">${buttonsHtml}</div>
            </div>
        `;

        controls.insertBefore(wrapper, controls.firstChild);

        document.getElementById('custom-speed-trigger').onclick = (e) => { e.stopPropagation(); toggleMenu(); };
        document.getElementById('speed-close-x').onclick = (e) => { e.stopPropagation(); toggleMenu(true); };

        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault(); e.stopPropagation();
            setRate(lastRate + (e.deltaY < 0 ? 1 : -1) * CONFIG.scrollStep, true);
        }, { passive: false });

        document.getElementById('s-input').oninput = (e) => setRate(e.target.value);
        wrapper.querySelectorAll('.s-btn').forEach(b => b.onclick = () => setRate(b.dataset.v));
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

    setInterval(() => {
        init();
        const box = document.getElementById('speed-menu-box');
        const player = document.querySelector('#movie_player');
        const video = document.querySelector('video');

        if (box && box.classList.contains('show') && player) player.wakeUpControls();

        if (video) {
            if (!video.dataset.holdBound) {
                video.dataset.holdBound = "true";
                video.addEventListener('ratechange', () => {
                    const playerElement = document.querySelector('#movie_player');

                    // If YouTube forces 2x (native hold) and we are NOT manually changing it via UI
                    if (video.playbackRate === 2.0 && !isHolding && !manualChangeActive) {
                        isHolding = true;
                        video.playbackRate = CONFIG.holdSpeed;
                        if (CONFIG.hideCursorOnHold && playerElement) playerElement.classList.add('hide-cursor');
                        showIndicator(parseFloat(CONFIG.holdSpeed.toFixed(2)) + 'x', CONFIG.holdIndicatorSeconds);
                    }
                    // When native hold is released
                    else if (video.playbackRate === 1.0 && isHolding) {
                        isHolding = false;
                        video.playbackRate = lastRate;
                        if (playerElement) playerElement.classList.remove('hide-cursor');
                        const ind = document.getElementById('speed-indicator');
                        if(ind) ind.style.display = 'none';
                        clearTimeout(window.speedTimeout);
                    }
                });
            }
        }

        // Safety check to restore cursor if menu is open or hold is inactive
        const playerElement = document.querySelector('#movie_player');
        if (playerElement && !isHolding && playerElement.classList.contains('hide-cursor')) {
            playerElement.classList.remove('hide-cursor');
        }

        if (CONFIG.hideNativeSpeed) {
            document.querySelectorAll('.ytp-menuitem').forEach(item => {
                if (item.innerText.toLowerCase().includes('speed') || item.innerText.toLowerCase().includes('скорость')) item.style.display = 'none';
            });
        }
    }, 500);
})();