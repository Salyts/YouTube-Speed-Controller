// ==UserScript==
// @name         YouTube Speed Controller
// @name:ru      Контроллер скорости YouTube
// @namespace    http://tampermonkey.net/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @version      1.2
// @description  Fully customizable speed controller with English interface
// @description:ru Полностью настраиваемый регулятор скорости с английским интерфейсом.
// @author       Salyts
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ================= [ CONFIGURATION / SETTINGS ] =================
    const CONFIG = {
        maxSpeed: 4.0, // Maximum speed on the slider (4.0)
        minSpeed: 0.25, // Minimum speed (0.25)
        scrollStep: 0.25, // Step when using mouse wheel (shift + scroll mouse) (0.25)
        sliderStep: 0.25, // Step for the UI slider (0.25)

        // Quick preset buttons
        presetButtons: [0.5, 1, 1.5, 2, 3, 4], // [0.5, 1, 1.5, 2, 3, 4]

        // Visuals
        mainColor: '#ff0000', // YouTube Red (#ff0000)
        menuBg: 'rgba(15, 15, 15, 0.95)', // (rgba(15, 15, 15, 0.95))
        blurAmount: '12px', // (12px)
        borderRadius: '12px',// (12px)
        indicatorTime: 800, // How long the speed indicator stays (ms) (800)

        // Labels (English)
        labelTitle: 'Playback speed',
        labelClose: 'Close',

        // Behavior
        hideNativeSpeed: true
    };
    // ===========================================================

    let lastRate = 1.0;

    const style = document.createElement('style');
    style.innerHTML = `
        .speed-btn-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 65px;
            height: 100%;
            vertical-align: top;
            z-index: 2147483647 !important;
        }
        #custom-speed-trigger {
            background: none;
            border: none;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            height: 100%;
            opacity: 0.9;
            font-family: "YouTube Sans", Roboto, Arial, sans-serif;
        }
        #custom-speed-trigger:hover { color: ${CONFIG.mainColor} !important; }

        #speed-menu-box {
            position: absolute;
            bottom: 60px;
            right: 0;
            width: 220px;
            background: ${CONFIG.menuBg};
            backdrop-filter: blur(${CONFIG.blurAmount});
            -webkit-backdrop-filter: blur(${CONFIG.blurAmount});
            border-radius: ${CONFIG.borderRadius};
            padding: 16px;
            display: none;
            flex-direction: column;
            z-index: 100003 !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
            transition: opacity 0.2s, transform 0.2s;
            transform: translateY(10px);
            opacity: 0;
            pointer-events: auto;
        }
        #speed-menu-box.show {
            display: flex !important;
            opacity: 1;
            transform: translateY(0);
        }

        .speed-menu-close {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        .speed-menu-close:hover { background: rgba(255,255,255,0.1); }
        .speed-menu-close svg { fill: #fff; width: 18px; height: 18px; }

        .s-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            margin: 18px 0;
            cursor: pointer;
            outline: none;
        }
        .s-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px; height: 14px;
            background: ${CONFIG.mainColor};
            border-radius: 50%;
        }
        .s-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        .s-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            color: #eee;
            padding: 8px 5px;
            font-size: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
        }
        .s-btn:hover { background: rgba(255,255,255,0.2); }
        .s-btn.active { background: ${CONFIG.mainColor}; color: #fff; }

        #speed-indicator {
            position: absolute;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 20px;
            z-index: 100004;
            pointer-events: none;
            display: none;
            backdrop-filter: blur(4px);
        }
    `;
    document.head.appendChild(style);

    function setRate(val, showVisual = false) {
        const video = document.querySelector('video');
        if (video) {
            let num = Math.round(parseFloat(val) * 100) / 100;
            if (num > CONFIG.maxSpeed) num = CONFIG.maxSpeed;
            if (num < CONFIG.minSpeed) num = CONFIG.minSpeed;
            lastRate = num;
            video.playbackRate = lastRate;

            if (showVisual) {
                let ind = document.getElementById('speed-indicator');
                if (!ind) {
                    ind = document.createElement('div');
                    ind.id = 'speed-indicator';
                    document.querySelector('#movie_player')?.appendChild(ind);
                }
                ind.innerText = lastRate.toFixed(2) + 'x';
                ind.style.display = 'block';
                clearTimeout(window.speedTimeout);
                window.speedTimeout = setTimeout(() => { if(ind) ind.style.display = 'none'; }, CONFIG.indicatorTime);
            }

            const trigger = document.getElementById('custom-speed-trigger');
            if(trigger) trigger.innerText = lastRate.toFixed(2) + 'x';
            const sVal = document.getElementById('s-val');
            if(sVal) sVal.innerText = lastRate.toFixed(2) + 'x';
            const sInput = document.getElementById('s-input');
            if(sInput) sInput.value = lastRate;
            document.querySelectorAll('.s-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.v) === lastRate));
        }
    }

    function toggleMenu(forceClose = false) {
        const box = document.getElementById('speed-menu-box');
        if (!box) return;
        if (forceClose) { box.classList.remove('show'); }
        else { box.classList.toggle('show'); }
    }

    function init() {
        if (document.getElementById('custom-speed-trigger')) return;

        const controls = document.querySelector('.ytp-right-controls');
        if (!controls) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'speed-btn-wrapper';

        let buttonsHtml = CONFIG.presetButtons.map(v => `<button class="s-btn" data-v="${v}">${v}x</button>`).join('');

        wrapper.innerHTML = `
            <button id="custom-speed-trigger">1.00x</button>
            <div id="speed-menu-box">
                <div class="speed-menu-close" id="speed-close-x" title="${CONFIG.labelClose}">
                    <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:13px; color:#fff; font-weight:500; padding-right:25px;">
                    <span>${CONFIG.labelTitle}</span>
                    <b id="s-val" style="color:${CONFIG.mainColor};">1.00x</b>
                </div>
                <input type="range" id="s-input" class="s-slider" min="${CONFIG.minSpeed}" max="${CONFIG.maxSpeed}" step="${CONFIG.sliderStep}" value="1">
                <div class="s-grid">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        controls.insertBefore(wrapper, controls.firstChild);

        const btn = document.getElementById('custom-speed-trigger');
        const box = document.getElementById('speed-menu-box');
        const closeX = document.getElementById('speed-close-x');

        btn.onclick = (e) => { e.stopPropagation(); toggleMenu(); };
        closeX.onclick = (e) => { e.stopPropagation(); toggleMenu(true); };
        box.onclick = (e) => e.stopPropagation();

        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setRate(lastRate + (e.deltaY > 0 ? -CONFIG.scrollStep : CONFIG.scrollStep), true);
        }, { passive: false });

        document.getElementById('s-input').oninput = (e) => setRate(e.target.value);
        box.querySelectorAll('.s-btn').forEach(b => b.onclick = () => setRate(b.dataset.v));
    }

    window.addEventListener('wheel', (e) => {
        if (e.shiftKey && document.querySelector('#movie_player')?.contains(e.target)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            setRate(lastRate + (e.deltaY > 0 ? -CONFIG.scrollStep : CONFIG.scrollStep), true);
        }
    }, { capture: true, passive: false });

    document.addEventListener('click', () => toggleMenu(true));

    setInterval(() => {
        init();
        if (CONFIG.hideNativeSpeed) {
            document.querySelectorAll('.ytp-menuitem').forEach(item => {
                const txt = item.innerText.toLowerCase();
                if (txt.includes('speed') || txt.includes('скорость')) item.style.display = 'none';
            });
        }
        const v = document.querySelector('video');
        if (v && lastRate > 2 && Math.abs(v.playbackRate - lastRate) > 0.05) v.playbackRate = lastRate;
    }, 1000);
})();