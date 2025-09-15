const http = require('http');

let isInternetAvailable = () => {
    return new Promise((resolve) => {
        const req = http.request('http://www.google.com', (res) => {
            if (res.statusCode === 200) {
                resolve(true); // Internet is available
            } else {
                resolve(false); // Internet is not available
            }
        });
        req.on('error', () => {
            resolve(false); // Internet is not available
        });
        req.end();
    });
}
// Export Modules
module.exports = {
    isInternetAvailable,
};
