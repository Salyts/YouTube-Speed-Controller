# YouTube Speed Controller PRO

A powerful, lightweight, and fully customizable userscript for YouTube that gives you precise control over playback speed. Control speed with a dedicated UI, mouse wheel, or presets, all while keeping the native YouTube interface clean and functional.

## ✨ Features

- **Custom UI Button**: Shows the current speed directly in the YouTube player bar.
- **Speed Presets**: Quick-access buttons for your favorite speeds (e.g., 0.5x, 2x, 5x).
- **Precise Slider**: Fine-tune your speed from 0.25x up to 5.0x.
- **Mouse Wheel Control**: Change speed by scrolling over the player while holding `Shift` (page scrolling is disabled during this action).
- **Pro Config**: Easily change maximum speed, colors, and shortcuts in the script code.
- **Clean Design**: Matches YouTube's modern aesthetic with blur effects and "YouTube Red" accents.

## 🚀 Installation

To use this script, you need a userscript manager installed in your browser.

### Step 1: Install a Userscript Manager
Choose one based on your browser:
- **Chrome / Edge / Opera**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Greasemonkey](https://addons.mozilla.org/nl/firefox/addon/greasemonkey/) or [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**: [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)

### Step 2: Install the Script
1. Click on your Userscript Manager icon in the browser toolbar and select **"Create a new script"**.
2. Delete any template code and paste the entire content of `script.js` from this repository.
3. Press `Ctrl + S` (or File > Save) to save the script.
4. Open any [YouTube](https://www.youtube.com) video and enjoy!

## 🛠 Configuration

You can easily modify the script behavior by editing the `CONFIG` block at the top of the code:

```javascript
const CONFIG = {
    maxSpeed: 5.0,        // Set your limit (e.g., 10.0)
    scrollStep: 0.25,     // Speed change per scroll tick
    mainColor: '#ff0000', // Change UI accent color
    presetButtons: [0.5, 1, 1.5, 2, 3, 5] // Customize quick buttons
};
