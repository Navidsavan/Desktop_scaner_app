//------------------------------------------------------------------
// Variabels
const btn_set_watcher_dir = document.getElementById('btn_click');
const btn_logout = document.getElementById('btn_logout');
//
const para = document.getElementById('path');
//
const enableEndNoUpdate = document.getElementById('enable_end_no_update');
//------------------------------------------------------------------

api.send_path((event, tempPath) => {
    para.value = tempPath; 
});

//
document.addEventListener("DOMContentLoaded", async (event) => {
   //
   var auth = await api.get_auth_data();
   //
   para.value = auth.dir_path;
   // Set the checkbox to true (checked)
   enableEndNoUpdate.checked = auth.end_no_switch;
});


//------------------------------------------------------------------
// Select Watcher Dir BTN
btn_set_watcher_dir.addEventListener('click', () => {
    api.set_watcher_dir();
});
//------------------------------------------------------------------


//------------------------------------------------------------------
// Select Watcher Dir BTN
btn_logout.addEventListener('click', () => {
    console.log("logout trigered from setting.js")
    api.logout();
});
//------------------------------------------------------------------


//------------------------------------------------------------------
// Select Watcher Dir BTN
enableEndNoUpdate.addEventListener('click', async () => {
    // Get the current value of the checkbox
    const isChecked = enableEndNoUpdate.checked;
    // Perform actions based on the value (isChecked)
    if (isChecked)
    {
        console.log(isChecked);
    }
    else
    {
        console.log(isChecked);
    }
    await api.end_no_switch(isChecked);
});
//------------------------------------------------------------------


//------------------------------------------------------------------
window.addEventListener('load', function () {
    let appVer = api.appVer();
    version.innerText = `v${appVer}`;
})
//------------------------------------------------------------------
