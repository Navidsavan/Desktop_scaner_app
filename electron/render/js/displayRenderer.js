
//-------------------- received display data from main process and pass to generate_display_list() ---------------
api.display_data((event, data) => {
    generate_display_list(data);
    
});

//------------------- Generate display list dynamamically --------------------------------------------------------
function generate_display_list(data) {
    const displayListContainer = document.getElementById('display_list');
    data.forEach(item => {
        const button = document.createElement('button');
        button.setAttribute('class', 'display-button py-2 px-4 text-white');
        button.setAttribute('id', 'display_button');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('fill', '#A3A3A3');
        svg.setAttribute('width', '60px');
        svg.setAttribute('height', '60px');
        svg.setAttribute('viewBox', '0 0 56 56');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 5.4536 43.0962 L 50.5464 43.0962 C 54.1747 43.0962 56 41.3561 56 37.6426 L 56 13.3243 C 56 9.6108 54.1747 7.8708 50.5464 7.8708 L 5.4536 7.8708 C 1.8249 7.8708 0 9.6108 0 13.3243 L 0 37.6426 C 0 41.3561 1.8249 43.0962 5.4536 43.0962 Z M 5.5172 39.6797 C 4.0743 39.6797 3.4164 39.0856 3.4164 37.6001 L 3.4164 13.3880 C 3.4164 11.8814 4.0743 11.2872 5.5172 11.2872 L 50.4825 11.2872 C 51.9466 11.2872 52.5833 11.8814 52.5833 13.3880 L 52.5833 37.6001 C 52.5833 39.0856 51.9466 39.6797 50.4825 39.6797 Z M 43.4374 48.9953 C 43.4374 47.8919 42.5465 47.0007 41.4639 47.0007 L 14.4933 47.0007 C 13.4111 47.0007 12.5411 47.8919 12.5411 48.9953 C 12.5411 50.0988 13.4111 50.9901 14.4933 50.9901 L 41.4639 50.9901 C 42.5465 50.9901 43.4374 50.0988 43.4374 48.9953 Z');

        svg.appendChild(path);

        const h3 = document.createElement('h3');
        h3.setAttribute('class', 'display-name');
        h3.textContent = item.display_name;

        const subTitleContainer1 = createSubTitleContainer('Slot Number : ', `${item.slot_min} - ${item.slot_max}`);
        const subTitleContainer2 = createSubTitleContainer('Orientation : ', item.display_orientation);
        const subTitleContainer3 = createSubTitleContainer('Display Id : ', item.display_id);

        const themeName = document.createElement('div');
        themeName.setAttribute('class', 'theme-name');
        themeName.textContent = `Theme: ${item.display_theme}`;

        const listData = document.createElement('div');
        listData.setAttribute('class', 'list-data');
        listData.appendChild(svg);
        listData.appendChild(h3);
        listData.appendChild(subTitleContainer1);
        listData.appendChild(subTitleContainer2);
        listData.appendChild(subTitleContainer3);
        listData.appendChild(themeName);

        button.appendChild(listData);

        //----------------------- Add event listener to the button ----------------------------------------
        button.addEventListener('click', async () => {
            console.log(item.display_id); // Pass the display_id to the handler function
           await api.open_display(item.display_id);
        })


        displayListContainer.appendChild(button);
    })
}

function createSubTitleContainer(title, value) {
    const container = document.createElement('div');
    container.setAttribute('class', 'sub-title-container');

    const subTitle1 = document.createElement('div');
    subTitle1.setAttribute('class', 'sub-title');
    subTitle1.textContent = title;

    const subTitle2 = document.createElement('div');
    subTitle2.setAttribute('class', 'sub-title-2');
    subTitle2.textContent = value;

    container.appendChild(subTitle1);
    container.appendChild(subTitle2);

    return container;
}

//------------------------------------------------------------------
/*document.addEventListener("DOMContentLoaded", async (event) => {
    const data = [
        {
            "display_id": "162129673",
            "display_name": "DISPLAY A",
            "display_orientation": "Portrait",
            "display_theme": "TXB Theme 23232323",
            "slot_max": "40",
            "slot_min": "1",
            "store_left_widget": "None",
            "store_right_widget": "None"
        },
        {
            "display_id": "32323232322",
            "display_name": "DISPLAY B ",
            "display_orientation": "Landscape",
            "display_theme": "TXB Theme 1670519673",
            "slot_max": "30",
            "slot_min": "1",
            "store_left_widget": "None",
            "store_right_widget": "None"
        },
       
    ];
    generate_display_list(data);

});*/
