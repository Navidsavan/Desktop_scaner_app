// script.js
//-------------------- received display data from main process  ---------------
api.display_credentials((event, data) => {
    initializeIframe(data);

});
// Function to handle button click
function handleButtonClick() {
    document.getElementById('webView').src = 'index.html'; // Replace 'URL_OF_HOME_WINDOW' with your home window URL
}

function initializeIframe(data) {
    let displayUrl = `${data.serverurl}api/getDisplay/android/displaysetting${data.display_id}`;

    // Access the iframe element
    const iframe = document.createElement('iframe');
    iframe.id = 'webView';
    iframe.src = displayUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.allowFullscreen = true;

    // Add the iframe to the container
    document.querySelector('.container').appendChild(iframe);

    // Add event listener for message from iframe
    iframe.onload = function () {
        // Access the contentWindow of the iframe
        const iframeWindow = iframe.contentWindow;

        // Add a message event listener to the iframe
        iframeWindow.addEventListener('message', function (event) {
            // Log the message data to the console
            console.log('Message from iframe:', event.data);
        });
    };
}

