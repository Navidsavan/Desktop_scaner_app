const { app } = require('electron');

// Director
const dir = require('path');

// Global Variables
const root_dir = dir.dirname(process.mainModule.filename);

const appPath = app.isPackaged ? dir.dirname(app.getPath('exe')) : app.getAppPath();

// State.js module - this module will hold the global state
const State = (function () {
    let state = {}; // The state object

    // Add a property to the state object
    function set(key, value) {
        state[key] = value;
    }

    // Get a property from the state object
    function get(key) {
        return state[key];
    }

    // Return the public methods
    return {
        set,
        get,
    };
})();


// Export Modules
module.exports = {
    dir,
    root_dir,
    appPath,
    State,
};