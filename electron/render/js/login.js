const login_btn = document.getElementById('login_btn');
const msg = document.getElementById('msg');
//
let version = document.getElementById('version');
//
const serverDropdown = document.getElementById('serverDropdown');
//------------------------------------------------------------------

//------------------------------------------------------------------

login_btn.addEventListener('click', async () => {
    // Email
    const email = document.getElementById("email").value;
    // Password
    const password = document.getElementById("password").value;
    // Data
    const data = {
        email: email,
        password: password,
    };
    // Calling Login Function From Preload.js
    let res = await api.login(data);
    let alert = '';
    if(res.success > 0)
    {
        alert = '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-1 rounded relative mb-3" role="alert"><div class="flex items-center"><div class="py-1 mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><p id="response" class="response text-sm">'+res.message+'</p></div></div></div>'; 
    }
    else
    {
        alert = '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-1 rounded relative mb-3" role="alert"><div class="flex items-center"><div class="py-1 mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><p id="response" class="response text-sm">'+res.message+'</p></div></div></div>'; 
    }
    msg.innerHTML = alert;
});
//------------------------------------------------------------------
//
window.addEventListener('DOMContentLoaded', async () => {
    let serverURL = serverDropdown.value
    console.log(serverURL)
    //
    serverDropdown.addEventListener('change', async () => {
        serverURL = serverDropdown.value;
        await api.set_server(serverURL);
    });
    await api.set_server(serverURL);
});
//------------------------------------------------------------------
//
window.addEventListener('load', function () {
    let appVer = api.appVer();
    version.innerText = `v${appVer}`;
});



