// barcode-listener.js
const { GlobalKeyboardListener } = require("node-global-key-listener");

module.exports = function createBarcodeListener(onScan) {
    const keyboard = new GlobalKeyboardListener();

    let buffer = "";
    let timeout;

    // Convert key name to character
    const keyNameToChar = (name) => {
        if (name.length === 1) return name;
        const map = {
            'Space': ' ',
            'Minus': '-',
            'Equal': '=',
            'Slash': '/',
            'Period': '.',
            'Comma': ',',
            'Semicolon': ';',
            'Quote': "'",
            'Backslash': '\\',
            'LeftBracket': '[',
            'RightBracket': ']',
            'Numpad0': '0','Numpad1': '1','Numpad2': '2','Numpad3': '3','Numpad4': '4',
            'Numpad5': '5','Numpad6': '6','Numpad7': '7','Numpad8': '8','Numpad9': '9',
            'Digit0': '0','Digit1': '1','Digit2': '2','Digit3': '3','Digit4': '4',
            'Digit5': '5','Digit6': '6','Digit7': '7','Digit8': '8','Digit9': '9'
        };
        return map[name] || '';
    };

    keyboard.addListener((e) => {
        console.log(e)
        if (e.state === "DOWN") {
            if (e.name === "Enter" || e.name === "Return") {
                if (buffer.length > 0) {
                    onScan(buffer.trim());
                    buffer = "";
                }
            } else {
                buffer += keyNameToChar(e.name);
            }

            // Reset buffer if no activity within 50ms
            clearTimeout(timeout);
            timeout = setTimeout(() => buffer = "", 50);
        }
    });

    console.log("[BarcodeListener] Listening for barcode input (background OK)");
};
