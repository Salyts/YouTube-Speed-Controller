// ==UserScript==
// @name         YouTube Speed Controller
// @name:ru      Контроллер скорости YouTube
// @namespace    https://github.com/Salyts/YouTube-Speed-Controller.git
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @version      1.4
// @description  Fully customizable speed controller.
// @description:ru Полностью настраиваемый регулятор скорости.
// @author       Salyts (Mod)
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

const CONFIG = {
    // General
    maxSpeed: 4.0, // Maximum speed on the slider
    minSpeed: 0.10, // Minimum speed
    scrollStep: 0.10, // Step when using mouse wheel (Shift + mouse scroll)
    sliderStep: 0.10, // Step for the UI slider
    plusMinusStep: 0.10, // Step for the - and + buttons near the slider
    presetButtons: [0.5, 1, 1.5, 2, 3, 4], // Quick preset buttons
    showTrailingZeros: false, // false = 2.2x, true = 2.20x (Whether to show trailing zeros)

    // Hold
    // (When holding down the spacebar or mouse button)
    holdSpeed: 2, // Speed while held
    indicatorSeconds: 2, // Speed indicator duration in seconds for normal changes
    holdIndicatorSeconds: 4, // Speed indicator duration in seconds for hold mode (-1 = until released)
    hideCursorOnHold: true, // Hide cursor while holding (true/false)

    // Visuals (Fully customizable design)
    mainColor: '#ff0000', // Primary color (active button, slider)
    menuBg: 'rgba(0, 0, 0, 0.65)', // Menu background
    blurAmount: '0px', // Background blur (backdrop-filter)
    borderRadius: '15px', // Menu corner radius
    menuWidth: '240px', // Menu width
    menuSpeed: '0.25s', // Menu animation speed
    menuTransitionType: 'cubic-bezier(0.4, 0, 0.2, 1)', // Menu animation timing function
    labelTitle: 'Playback speed', // Title label

    // Text
    textColor: '#ffffff', // Main text color
    mutedTextColor: '#ffffff', // Secondary text color (title)
    fontSizeSmall: '12px', // Font size for buttons
    fontSizeMedium: '13px', // Font size for title
    fontSizeLarge: '14px', // Font size for current speed

    // Slider
    sliderTrackColor: 'rgba(255, 255, 255, 0.2)', // Inactive slider track color
    sliderHeight: '4px', // Slider thickness
    sliderThumbSize: '15px', // Slider thumb size
    sliderThumbBorder: '2px', // Slider thumb border thickness
    sliderAnimDuration: 150, // Slider smooth animation duration (in milliseconds)

    // Preset and -/+ buttons
    btnBg: 'rgba(255, 255, 255, 0.10)', // Button background
    btnHoverBg: 'rgba(255, 255, 255, 0.15)', // Button background on hover
    btnTextColor: '#cccccc', // Inactive button text color
    btnActiveTextColor: '#ffffff', // Active button text color
    btnRadius: '30px', // Button corner radius
    plusMinusBtnWidth: '30px', // Width of - and + buttons

    // Borders and shadows
    boxShadow: '0 4px 24px rgba(0,0,0,0.0)', // Menu shadow
    borderStyle: '1px solid rgba(255,255,255,0.00)', // Menu border

    // Center screen indicator
    indicatorBg: 'rgba(0,0,0,0.6)', // Indicator background
    indicatorColor: '#ffffff', // Indicator text color
    indicatorRadius: '20px', // Indicator corner radius

    // Optional
    hideNativeSpeed: true,
    githubUrl: 'https://github.com/Salyts/YouTube-Speed-Controller'
};

    let lastRate = 1.0;
    let isHolding = false;
    let manualChangeActive = false;
    let sliderAnimationId = null;

    const style = document.createElement('style');
    style.textContent = `
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
        }
    `;
    document.head.appendChild(style);

    // Вспомогательная функция для форматирования нулей
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

    function showIndicator(text, duration) {
        let ind = document.getElementById('speed-indicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'speed-indicator';
            document.querySelector('#movie_player')?.appendChild(ind);
        }
        ind.textContent = text;
        ind.style.display = 'block';
        clearTimeout(window.speedTimeout);

        if (duration !== -1) {
            window.speedTimeout = setTimeout(() => { if(ind) ind.style.display = 'none'; }, duration * 1000);
        }
    }

    // Анимация для ползунка
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
            const ease = progress * (2 - progress); // Плавное замедление (easeOutQuad)

            slider.value = startValue + (endValue - startValue) * ease;

            if (progress < 1) {
                sliderAnimationId = requestAnimationFrame(step);
            } else {
                slider.value = endValue;
            }
        }
        sliderAnimationId = requestAnimationFrame(step);
    }

    // Обрати внимание: добавлен 3-й аргумент fromSlider
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
                showIndicator(speedText, CONFIG.indicatorSeconds);
            }

            const trigger = document.getElementById('custom-speed-trigger');
            if(trigger) trigger.textContent = speedText;

            const sVal = document.getElementById('s-val');
            if(sVal) sVal.textContent = speedText;

            const sInput = document.getElementById('s-input');
            if(sInput && !fromSlider) {
                animateSliderTo(lastRate);
            }

            document.querySelectorAll('.s-btn').forEach(b => {
                b.classList.toggle('active', parseFloat(b.dataset.v) === lastRate);
            });

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
            setTimeout(() => { if(!box.classList.contains('show')) box.style.display = 'none'; }, parseFloat(CONFIG.menuSpeed) * 1000);
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

        // --- Блок с ползунком и кнопками - / + ---
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
        // Передаем true в качестве fromSlider, чтобы ползунок не дергался при ручном перетаскивании
        slider.oninput = (e) => setRate(e.target.value, false, true);

        const plusBtn = document.createElement('button');
        plusBtn.className = 's-pm-btn';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => setRate(lastRate + CONFIG.plusMinusStep);

        sliderRow.appendChild(minusBtn);
        sliderRow.appendChild(slider);
        sliderRow.appendChild(plusBtn);
        menuBox.appendChild(sliderRow);
        // -----------------------------------------

        const grid = document.createElement('div');
        grid.className = 's-grid';
        CONFIG.presetButtons.forEach(v => {
            const btn = document.createElement('button');
            btn.className = 's-btn';
            btn.dataset.v = v;
            btn.textContent = formatSpeed(v);

            // Если скорость совпадает с текущей, делаем кнопку активной
            if (parseFloat(v) === lastRate) {
                btn.classList.add('active');
            }

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

                    if (video.playbackRate === 2.0 && !isHolding && !manualChangeActive) {
                        isHolding = true;
                        video.playbackRate = CONFIG.holdSpeed;
                        if (CONFIG.hideCursorOnHold && playerElement) playerElement.classList.add('hide-cursor');
                        showIndicator(formatSpeed(CONFIG.holdSpeed), CONFIG.holdIndicatorSeconds);
                    }
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

        const playerElement = document.querySelector('#movie_player');
        if (playerElement && !isHolding && playerElement.classList.contains('hide-cursor')) {
            playerElement.classList.remove('hide-cursor');
        }

        if (CONFIG.hideNativeSpeed) {
            document.querySelectorAll('.ytp-menuitem').forEach(item => {
                if (item.textContent.toLowerCase().includes('speed') || item.textContent.toLowerCase().includes('скорость')) item.style.display = 'none';
            });
        }
    }, 500);
})();