const cron = require('node-cron');
//
const hasUpdatetEveryDay = (autoUpdater) => {
    cron.schedule('0 4 * * *', async function() {
        autoUpdater.checkForUpdates();
    });
}
module.exports = { hasUpdatetEveryDay };