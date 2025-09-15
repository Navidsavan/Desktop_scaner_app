let appUpdateAvailable = (autoUpdater) => {
    autoUpdater.on("update-available", (info) => {
        console.log('Update Available');
        let pth = autoUpdater.downloadUpdate();
    });
}

let appUpdateNotAvailable = (autoUpdater) => {
    autoUpdater.on("update-not-available", (info) => {
        console.log('No Update Available');
    });
}

let appUpdateDownload = (autoUpdater) => {
    autoUpdater.on("update-downloaded", (info) => {
        console.log('Update Download');
        autoUpdater.quitAndInstall();
    });
}

let appUpdateError = (autoUpdater) => {
    autoUpdater.on("error", (info) => {});
}

// Export Modules
module.exports = {
    appUpdateAvailable,
    appUpdateNotAvailable,
    appUpdateDownload,
    appUpdateError,
};