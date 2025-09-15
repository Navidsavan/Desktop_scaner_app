// Axios
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const currentTime = Date.now();
//const folderPath = '../../tempfiles';
const folderPath = path.resolve(__dirname, '../../tempfiles');
// Root Dir Variable
let { State } = require('./variables');


//--------------------- Login -----------------------
const authentication = (data, server_url) => {
    //api/desktop/login
    //api/user/login`
    let URL = `${server_url}api/desktop/login`;
    //
    try {
        return axios.post(URL, data);
    } catch (error) {
        console.error('Error Login From LD Pos');
    }
}

//---------------- Logout --------------------------
const logout = (data, token) => {
    let auth = State.get('auth');
    // URL
    const URL = `${auth.server_url}api/user/logout`;
    // Bearer Token Instance
    let axiosInstance = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    try {
        return axios.post(URL, data, axiosInstance);
    } catch (error) {
        console.error('Error Logout From LD Desktop');
    }
}

// Export Modules
module.exports = {
    authentication,
    logout,
};