# YouTube Speed Controller

A powerful, lightweight, and fully customizable userscript for YouTube that gives you precise control over playback speed. Control speed with a dedicated UI, mouse wheel, or presets, all while keeping the native YouTube interface clean and functional.

## ✨ Features
<img width="663" height="217" alt="изображение" src="https://github.com/user-attachments/assets/a03ea238-80a8-4c45-8ca1-134f5a213f0c" />


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
