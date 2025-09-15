

// Logout Button
const btn_logout = document.getElementById('btn_logout');

//
let version = document.getElementById('version');


//------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const minBtn = document.getElementById("min-btn");
  const maxBtn = document.getElementById("max-btn");
  const closeBtn = document.getElementById("close-btn");

  if (minBtn) {
    minBtn.addEventListener("click", () => {
      console.log("Clicked Minimize");
      window.api.minimize();
    });
  }

  if (maxBtn) {
    maxBtn.addEventListener("click", () => {
      console.log("Clicked Maximize");
      window.api.maximize();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      console.log("Clicked Close");
      window.api.close();
    });
  }
});


//------------------------------------------------------------------
// Select LD Dir BTN
btn_logout.addEventListener('click', () => {
    api.logout();
});

//------------------------------------------------------------------
window.addEventListener('load', function () {
    let appVer = api.appVer();
    version.innerText = `v${appVer}`;
})
//------------------------------------------------------------------


// renderer.js
let buffer = '';
let lastScanTime = Date.now();
const scanTimeout = 50; // ms — if gap > 50ms, reset buffer

window.addEventListener('keydown', (e) => {
    const now = Date.now();

    // If time gap is too big, start new scan
    if (now - lastScanTime > scanTimeout) {
        buffer = '';
    }
    lastScanTime = now;

    // Ignore special keys except Enter
    if (e.key === 'Enter') {
        if (buffer.length > 0) {
            console.log("Scanned barcode:", buffer);
            window.electronAPI.onBarcodeScan(buffer); // Send to main if needed
            buffer = '';
        }
    } else if (e.key.length === 1) {
        buffer += e.key;
    }
});










