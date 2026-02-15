# YouTube Speed Controller PRO

A powerful, lightweight, and fully customizable userscript for YouTube that gives you precise control over playback speed. Control speed with a dedicated UI, mouse wheel, or presets, all while keeping the native YouTube interface clean and functional.

## ✨ Features

- **Custom UI Button**: Shows the current speed directly in the YouTube player bar.
- **Speed Presets**: Quick-access buttons for your favorite speeds (e.g., 0.5x, 2x, 5x).
- **Precise Slider**: Fine-tune your speed from 0.25x up to 5.0x.
- **Mouse Wheel Control**: Change speed by scrolling over the player while holding `Shift` (page scrolling is disabled during this action).
- **Pro Config**: Easily change maximum speed, colors, and shortcuts in the script code.
- **Clean Design**: Matches YouTube's modern aesthetic with blur effects and "YouTube Red" accents.
- <img width="263" height="266" alt="изображение" src="https://github.com/user-attachments/assets/cd8af931-5b5e-4841-a8d5-48d44fc8acb3" />


## 🚀 Installation

To use this script, you need a userscript manager installed in your browser.

### Step 1: Install a Userscript Manager
Choose one based on your browser:
- **Chrome / Edge / Opera**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)`(Recommended)` or [Greasemonkey](https://addons.mozilla.org/nl/firefox/addon/greasemonkey/)

### Step 2: Install the Script
1. Click on your Userscript Manager icon in the browser toolbar and select **"Create a new script"**.
2. Delete any template code and paste the entire content of `YouTube Speed Controller-1.2.js` from this repository.
3. Press `Ctrl + S` (or File > Save) to save the script.
4. Open any [YouTube](https://www.youtube.com) video and enjoy!

## 🛠 Configuration

You can easily modify the script behavior by editing the `CONFIG` block at the top of the code:

```javascript
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
