// File System
const fs = require('fs');

const checkIfFileIsFree = (filePath, cb) => {
    // Check if the file is free
    fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) {
            // The file is not free, wait and try again
            setTimeout(() => {
                checkIfFileIsFree(filePath, cb);
            }, 100);
        } else {
            // The file is free, call the callback
            cb();
        }
    });
};

// Delete XML File
let delete_file = (filePath) => {
    // Delete The File
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
        console.log('File deleted successfully');
    });
}


// Export Modules
module.exports = {
    checkIfFileIsFree,
    delete_file,
};