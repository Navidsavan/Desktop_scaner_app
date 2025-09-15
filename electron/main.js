const { app, BrowserWindow, ipcMain, screen, Menu, Tray } = require('electron');
const axios = require('axios');
let { dir, State } = require('./utilities/variables');
const windowStateKeeper = require('electron-window-state')
const { addToConfig, logoutDB, isAuth } = require('./utilities/db');
const AutoLaunch = require('auto-launch');
const { authentication, logout } = require('./utilities/api');
const Store = require('electron-store');
const store = new Store();
const { GlobalKeyboardListener } = require("node-global-key-listener");
const chokidar = require('chokidar'); // Add this at the top
let buffer = '';
const keyboard = new GlobalKeyboardListener();
app.disableHardwareAcceleration();

// Variables For Tray Settings
let root_path = app.getAppPath();
let server_url = '';
let homeWindow;
let loginWin;
let barcodeListener; // keep reference so we can remove it later
// Fav Icon
//let icon = dir.join(root_path, 'images/icon/icon.png');
const iconPath = dir.join(root_path, 'images/icon/icon.png');
let tray; // 🔹 Tray reference

// Optional: a dedicated store file named "user-prefs.json"
const prefsStore = new Store({
    name: 'user-prefs',
    // Optional: (see note at bottom) add `encryptionKey: '...'` to obfuscate at rest
    schema: {
        'login.rememberMe': { type: 'boolean', default: false },
        'login.email': { type: 'string', default: '' },
        'login.password': { type: 'string', default: '' } // stores plain text; see security note
    }
});

// Add this function to reload all windows when HTML files change
function setupFileWatchers() {
    if (process.env.NODE_ENV === 'development') {
      const watcher = chokidar.watch([
        path.join(__dirname, 'electron/render/**/*.html'),
        path.join(__dirname, 'src/**/*.css'),
        path.join(__dirname, 'src/**/*.jsx'),
        path.join(__dirname, 'src/**/*.js')
      ], {
        ignored: /node_modules/,
        persistent: true
      });
  
      watcher.on('change', (filePath) => {
        console.log('File changed:', filePath);
        
        // Reload all windows
        BrowserWindow.getAllWindows().forEach(win => {
          if (win && !win.isDestroyed()) {
            win.reload();
          }
        });
      });
    }
  }


const getAppVersion = () => {
    // Handle the IPC request for the app version
    ipcMain.on('appVer', (event) => {
        event.returnValue = app.getVersion();
    });
}

//----------------- Auto boot when pc login once shutdown --------------

const appLauncher = new AutoLaunch({
    name: 'ld-desktop',
    path: app.getPath('exe') // Set the path to the executable of your Electron app
});

// Enable auto-launching
appLauncher.enable();

//----------------- Login Window ------------------------------------
const createLoginWindow = () => {
    // Login Window
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    })
    loginWin = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 500,  // Minimum width
        minHeight: 700, // Minimum height
        backgroundColor: 'rgb(62,156,238)',
        autoHideMenuBar: true,
        resizable: true,   // ✅ REQUIRED
        frame: false,
        icon: iconPath,
        show: false, // 🔹 start hidden
        skipTaskbar: true, // 🔹 do not show in taskbar
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: dir.join(__dirname, 'preload/preload.js'),
        }
    });
    // Load Login Window File
    loginWin.loadFile('electron/render/login.html').then(() => {
        loginWin.webContents.executeJavaScript(`
        document.body.style.background = 'linear-gradient(to right,rgb(66,81,156),rgb(90,185,223))';
    `);
    });
    mainWindowState.manage(loginWin);
    // loginWin.webContents.openDevTools()
    loginWin.on('close', (event) => {
        event.preventDefault();
        loginWin.hide();
        loginWin.setSkipTaskbar(true);
    })
    return loginWin;
};

//=========== scanner listner ====================

app.whenReady().then(() => {
    setupFileWatchers(); // Add this line
    getAppVersion();
    Menu.setApplicationMenu(null);

    // 🔹 Create Tray
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: () => {
                if (homeWindow) {
                    homeWindow.show();
                    homeWindow.setSkipTaskbar(false);
                } else if (loginWin) {
                    loginWin.show();
                    loginWin.setSkipTaskbar(false);
                }
            }
        },
        {
            label: 'Hide App', click: () => {
                if (homeWindow) {
                    homeWindow.hide();
                    homeWindow.setSkipTaskbar(true);
                } else if (loginWin) {
                    loginWin.hide();
                    loginWin.setSkipTaskbar(true);
                }
            }
        },
        { label: 'Quit', click: () => { app.quit(); } }
    ]);
    tray.setToolTip('LD Desktop');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (homeWindow && homeWindow.isVisible()) {
            homeWindow.hide();
            homeWindow.setSkipTaskbar(true);
        } else if (homeWindow) {
            homeWindow.show();
            homeWindow.setSkipTaskbar(false);
        } else if (loginWin && loginWin.isVisible()) {
            loginWin.hide();
            loginWin.setSkipTaskbar(true);
        } else if (loginWin) {
            loginWin.show();
            loginWin.setSkipTaskbar(false);
        }
    });

    isAuth({}).then(async (config) => {
        if (config) {
            //Barcode listner 
            barcodeListnerHandler();
            // Set State
            State.set('auth', config.dataValues);
            let userDisplay = config.dataValues.userDisplay;
            homeWindow = createHomeWindow(userDisplay);
            homeWindow.hide(); // 🔹 Start hidden in tray
            homeWindow.setSkipTaskbar(true);

            //------------------ get active display ids and open displays -------------------------
            //  store.delete('display_ids'); // --- to delete display ids from electron store ----
            const currentDisplay = await store.get('display_ids');
            if (currentDisplay != undefined) {
                let base_url = config.dataValues.server_url;
                currentDisplay.forEach(displayId => {
                    // Call the createDisplayWindow function for each display ID
                    createDisplayWindow(displayId, base_url);
                });
            }
        } else {
            // Creating Main Window
            loginWin = createLoginWindow();
        }
    }).catch((error) => {
        loginWin = createLoginWindow();
    });
});

//----------------------------- Home Window -----------------------------------------
const createHomeWindow = (display_data = false) => {
    // Login Window
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1300,
        defaultHeight: 950
    })
    const homeWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 800,  // Minimum width
        minHeight: 600, // Minimum height
        backgroundColor: 'rgb(37,45,72)',
        autoHideMenuBar: true,
        frame: false,
        icon: iconPath,

        show: false, // 🔹 hidden by default
        skipTaskbar: true, // 🔹 not in taskbar
        webPreferences: {
            //contextIsolation: true,
            nodeIntegration: true,
            preload: dir.join(__dirname, 'preload/preload.js'),
        },
    });
    //homeWindow.webContents.openDevTools()
    // Load Login Window File
    homeWindow.loadFile('electron/render/home.html')
        .then(() => {
            homeWindow.webContents.send('display_data', display_data);
            homeWindow.webContents.executeJavaScript(`document.body.style.background = 'linear-gradient(to right,rgb(37,45,72),rgb(37,45,72))';`);
        });
    mainWindowState.manage(homeWindow);
    return homeWindow;
}

//----------------------------- Display Window -----------------------------------------
const createDisplayWindow = (data, server_url) => {
    let displayData = {
        display_id: data,
        serverurl: server_url
    }
    let displayIds = store.get('display_ids') || [];

    if (!displayIds.includes(data)) {
        displayIds.push(data);
        store.set('display_ids', displayIds);
    }
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    let mainWindowState = windowStateKeeper({
        defaultWidth: width,
        defaultHeight: height
    })
    const displayWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: 'rgb(37,45,72)',
        icon: iconPath,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: dir.join(__dirname, 'preload/preload.js'),
        }
    });

    displayWindow.loadFile('electron/render/display.html')
        .then(() => {
            displayWindow.webContents.send('display_credentials', displayData);
        });
    mainWindowState.manage(displayWindow);
    displayWindow.on('closed', () => {
        let currentDisplayIds = store.get('display_ids') || [];
        currentDisplayIds = currentDisplayIds.filter(id => id !== data);
        store.set('display_ids', currentDisplayIds);
    });

    return displayWindow;
}

// (rest of your code stays EXACTLY the same) ...
// IPC Main: Set Server URL Function
//------------------------------------------------------------------------------------
ipcMain.on("set_server", async (event, serverURL) => {
    server_url = serverURL;
});

//-------------------------------------IPC Main: Login Function -----------------------
ipcMain.handle("login", async (event, data) => {
    let response;
    try {
        response = await authentication(data, server_url);
        // console.log(response.data.userDisplay)
        // Response Data
        let reqInfo = response.data;
        // Success
        let success = reqInfo.success;
        if (success > 0) {
            //------------------------------------------------------------------------
            const { user, accessToken, store_id, userDisplay } = reqInfo;
            // Send message to the renderer process
            //------------------------------------------------------------------------
            let auth = {
                email: user.email,
                user_id: user.id,
                store_id,
                username: user.username,
                server_url: server_url,
                userDisplay,
                accessToken,
            }
            // Set State
            State.set('auth', auth);

            // Add To Config
            addToConfig(auth).then(response => {
                //Barcode listner 
                barcodeListnerHandler();
                loginWin.removeAllListeners('close');
                loginWin.close();
                loginWin = null;
                homeWindow = createHomeWindow(userDisplay);
            })
            return reqInfo;

        }
        else {
            return reqInfo
        }
    }
    catch (error) {
        if (error.response) {
            // handle server response with non-2xx status code
            console.error(error.response);
        }
        else if (error.request) {
            // handle request without a response (no internet connection)
            console.error('No internet connection');
            return { success: 0, message: "No internet connection" }
        }
        else {
            // handle other errors
            console.error('Error', error.message);
        }
    }

});
//--------------------------------- open display function when press on display -----------------------------

ipcMain.handle("open_display", async (event, data) => {
    let base_url = server_url;
    try {
        isAuth({}).then(async (config) => {
            if (config) {
                // Set State
                State.set('auth', config.dataValues);
                base_url = config.dataValues.server_url;
                return createDisplayWindow(data, base_url);
            }
        })
        //return   createDisplayWindow(data, base_url);
    } catch (error) {
        console.log(error)
    }
});


//------------------------------- IPC Main: Logout Function -------------------------------
ipcMain.on("logout", async (event, data) => {
    try {
        let auth = State.get('auth');

        if (!auth) {
            console.warn("No auth state found. Forcing login screen.");
            if (!loginWin) loginWin = createLoginWindow();
            return;
        }

        // Delete display IDs from store
        store.delete('display_ids');

        try {
            // Try to logout from server (but don't block local logout if fails)
            await logout({ user_id: auth.user_id }, auth.accessToken);
            console.log("Remote logout successful.");
        } catch (apiErr) {
            console.warn("Remote logout failed:", apiErr.message);
        }

        // Always clear local session
        await logoutDB(auth.user_id);

        // Close home window safely
        if (homeWindow && !homeWindow.isDestroyed()) {
            homeWindow.close();
        }
        homeWindow = null;

        // Show login window
        if (!loginWin) {
            loginWin = createLoginWindow();
        }

    } catch (err) {
        console.error("Unexpected error in logout flow:", err);
    }
});

//------------------------------------------------------------------------------------
ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
});

ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
    }
});

ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
});



//------------------------------------------------------------------------------------
// IPC Main: Logout Function
ipcMain.handle('get_auth_data', () => {
    // Getting Auth Data
    let auth = State.get('auth');
    return auth;
})

// 🔹 Barcode scanner listener setup
// Create global keyboard listener


const barcodeListnerHandler = () => {
    barcodeListener = (event) => {
        let lastScanTime = 0;
        if (event.state !== 'DOWN') return;

        if (/^[0-9]$/.test(event.name)) {
            buffer += event.name;
        } else if (/^[A-Z]$/.test(event.name)) {
            buffer += event.name.toLowerCase();
        } else if (event.name === 'RETURN') {
            let scannedBarcode = buffer.trim(); // cleanup spaces
            buffer = ''; // reset immediately

            // 🚫 Skip if empty or too short (e.g., < 5 chars)
            if (!scannedBarcode || scannedBarcode.length < 5) {
                // console.warn("⚠️ Ignored invalid/short barcode:", scannedBarcode);
                return;
            }

            // 🚫 Skip if contains non-alphanumeric
            if (!/^[a-z0-9]+$/i.test(scannedBarcode)) {
                // console.warn("⚠️ Ignored invalid characters in barcode:", scannedBarcode);
                return;
            }

            isAuth({})
                .then(async (config) => {
                    if (config) {
                        const ticketUpdateUrl = `${config.dataValues.server_url}api/updateTicket`;
                        const { user_id, store_id } = config.dataValues;
                        const now = Date.now();
                        if (now - lastScanTime < 500) {
                            // Ignore scans within 500ms window
                            return;
                        }
                        lastScanTime = now;


                        try {
                            const res = await axios.post(ticketUpdateUrl, {
                                scan_code: scannedBarcode,
                                store_id,
                                user_id,
                                dpScan: 1,
                            });
                            // console.log("✅ Ticket updated:", res.data);
                        } catch (err) {
                            console.error("❌ Axios error:", err.message);
                        } finally {
                            // ✅ Clear the barcode no matter what
                            scannedBarcode = null;
                        }
                    }
                })
                .catch(err => console.error("Auth error:", err));
        }
    };

    // attach
    keyboard.addListener(barcodeListener);
};


//-------- store 
ipcMain.handle('prefs:getLogin', () => {
    return {
        rememberMe: prefsStore.get('login.rememberMe'),
        email: prefsStore.get('login.email'),
        password: prefsStore.get('login.password'),
    };
});

ipcMain.handle('prefs:saveLogin', (event, { rememberMe, email, password }) => {
    prefsStore.set('login.rememberMe', !!rememberMe);
    if (rememberMe) {
        prefsStore.set('login.email', email || '');
        prefsStore.set('login.password', password || '');
    } else {
        prefsStore.delete('login.email');
        prefsStore.delete('login.password');
    }
    return true;
});

ipcMain.handle('prefs:clearLogin', () => {
    prefsStore.set('login.rememberMe', false);
    prefsStore.delete('login.email');
    prefsStore.delete('login.password');
    return true;
});



app.on('will-quit', () => {
    if (barcodeListener) {
        keyboard.removeListener(barcodeListener);
    }
});