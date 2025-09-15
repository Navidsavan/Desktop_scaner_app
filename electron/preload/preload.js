const { contextBridge, ipcRenderer } = require('electron');

const API = {
    // Set Watcher Dir
    set_watcher_dir: () => ipcRenderer.send('set_watcher_dir'),
    // Send Record
    send_records: (callback) => ipcRenderer.on('send_records', callback),
    // Get Record
    get_records: (pagination) => ipcRenderer.invoke('get_records', pagination),
    // Path
    get_auth_data: () => ipcRenderer.invoke('get_auth_data'),
    //-- send display data to main 
    display_data: (callback) => ipcRenderer.on('display_data', callback),
    //--- open display 
    open_display: (data) => ipcRenderer.invoke("open_display", data),
    // Login //display_credentials
     //-- send display id and base url to ifram
     display_credentials: (callback) => ipcRenderer.on('display_credentials', callback),
    login: (data) => ipcRenderer.invoke("login", data),
    // Logout
    logout: (data) => ipcRenderer.send("logout"),
    // Set ServerURL
    set_server: (data) => ipcRenderer.send('set_server', data),
    //
    end_no_switch: (endNumberToggle) => ipcRenderer.send('end_no_switch', endNumberToggle),
    // Send Path When File Added In Folder
    auth_inview: (callback) => ipcRenderer.on('auth_inview', callback),
    //
    appVer: () => ipcRenderer.sendSync('appVer'),

    // ✅ Window controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
};

contextBridge.exposeInMainWorld('prefs', {
  getLogin:  () => ipcRenderer.invoke('prefs:getLogin'),
  saveLogin: (data) => ipcRenderer.invoke('prefs:saveLogin', data),
  clearLogin: () => ipcRenderer.invoke('prefs:clearLogin'),
});



contextBridge.exposeInMainWorld('electronAPI', {
    onBarcodeScan: (code) => ipcRenderer.send('barcode-scan', code)
});

contextBridge.exposeInMainWorld('api', API);
