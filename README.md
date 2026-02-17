# YouTube Speed Controller

A powerful, lightweight, and fully customizable userscript for YouTube that gives you precise control over playback speed. Control speed with a dedicated UI, mouse wheel, or presets, all while keeping the native YouTube interface clean and functional.

## ✨ Features
<img width="1135" height="358" alt="изображение" src="https://github.com/user-attachments/assets/86b6d915-05d5-4bb0-8d33-005bc470928d" />

- **Custom UI Button**: Shows the current speed directly in the YouTube player bar.
- **Quick buttons**: Quick-access buttons for your favorite speeds.
- **Mouse Wheel Control**: Change speed by scrolling over the mouse while holding `Shift`.
- **Config**: Easily change maximum speed, colors, and shortcuts in the script code.

## 🚀 Installation

To use this script, you need a userscript manager installed in your browser.

### Step 1: Install a Userscript Manager
Choose one based on your browser:
- **Chrome / Edge / Opera**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)`(Recommended)` or [Greasemonkey](https://addons.mozilla.org/nl/firefox/addon/greasemonkey/)

### Step 2: Install the Script
1. Click on your Userscript Manager icon in the browser toolbar and select **"Create a new script"**.
2. Delete any template code and paste the entire content of `YouTube Speed Controller.js` from this repository.
3. Press `Ctrl + S` (or File > Save) to save the script.
4. Open any [YouTube](https://www.youtube.com) video and enjoy!

## 🛠 Configuration

You can easily modify the script behavior by editing the `CONFIG` block at the top of the code:

```javascript
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
