const { Menu, Tray } = require('electron');

// Tray Setting Function
let tray_setting = (app, dir, root_path, tray) => {
    // Tray Icon
    let icon = dir.join(root_path, 'images/icon/icon.png');
    // Tray Instance
    tray = new Tray(icon);
    // Tray Tool Tip Title
    tray.setToolTip('LD POS Watcher.');

    // Template Menu
    let template_menu = [{
        label: 'Exit', click: () => {
            app.isQuiting = true;
            app.quit();
        }
    }];

    // Tray Menu
    const contextMenu = Menu.buildFromTemplate(template_menu);
    // Set Menu In Context Menu
    tray.setContextMenu(contextMenu);
    //--------------------------------------------------------------
    return tray;
}







//------------------------------------------------------------------------------------
// Export Modules
module.exports = {
    tray_setting,
};
//------------------------------------------------------------------------------------


