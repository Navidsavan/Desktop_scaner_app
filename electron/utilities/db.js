const { app } = require('electron');
// Sql Lite 3
const sqlite3 = require('sqlite3').verbose();
//
const { Sequelize } = require('sequelize');
// API
const { updateQueue } = require('./api');
//------------------------------------------------------------------------------------
// Databae File Path
let AppDB = app.getPath('userData') + "/AppDB";
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: AppDB,
    logging: false,
});
//------------------------------------------------------------------------------------
// Creating Table In Database
const queue = sequelize.define('queue', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    store_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    transaction_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    json: {
        type: Sequelize.TEXT
    },
    is_return: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    transaction_date: {
        type: Sequelize.STRING(100),
    },
    status: {
        type: Sequelize.ENUM('queued', 'processing', 'completed', 'failed'),
    },
}, { logging: false });
//
queue.sync();
//------------------------------------------------------------------------------------
// Creating Table In Database
const config = sequelize.define('config', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    store_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    provider_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    username: {
        type: Sequelize.STRING(100),
    },
    server_url: {
        type: Sequelize.STRING(150),
    },
  
    email: {
        type: Sequelize.STRING(100),
    },
    userDisplay:{
        type: Sequelize.JSON,
    },
    accessToken: {
        type: Sequelize.STRING(100),
    },
    dir_path: {
        type: Sequelize.STRING(100),
    },
   
  
}, { logging: false });
config.sync();

//------------------------------------------------------------------------------------
// Creating Table In Database

const lotteries = sequelize.define('lotteries', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    lottery_name: {
        type: Sequelize.STRING(100),
    },
    lottery_upc_code: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
}, { logging: false });
//
lotteries.sync();
//------------------------------------------------------------------------------------

// Update Watcher Path In DB Config
const updateConfig = async (auth) => {
    delete auth.id;
    // Update Watch Path | Config Tbl
    try {
        return await config.update(auth, {
            where: { 'user_id': auth.user_id },
            returning: true
        });
    } catch (error) {
        console.error('Error Updating item to Config', error);
    }
}

// Add User To DB | Config Tbl
const addToConfig = async (data, deleteFile) => {

    //-------- dropping and recreating config 
    /*config.sync({ force: true })
    .then(() => {
      console.log('Config table dropped and recreated successfully.');
    })
    .catch((error) => {
      console.error('Error dropping and recreating config table:', error);
    });*/
    try {
        const item = await config.create(data);
    } catch (error) {
        console.error('Error Adding item to Config', error);
    }
}

// Add Lotterie To DB | Lotteries Tbl
const addToLotteries = async (data, deleteFile) => {
    try {
        return await lotteries.bulkCreate(data);
    } catch (error) {
        console.error('Error Adding item to Lotteries', error);
    }
}

// Add Sales Data To DB | Queue Tbl
const addToQueue = async (data, deleteFile) => {
    try {
        const item = await queue.create(data);
        console.log(`Added item to Queue: ${item.id} (${item.json})`);
    } catch (error) {
        console.error("An error occurred while Adding item to the Queue:", error);
    }
};

// Get Auth Info | Config Tbl
const isAuth = (obj) => {
    try {
        // Check if a user exists in the database and authenticate them
        return config.findOne(obj);
    }
    catch (error) {
        console.error('Error Deleting item From Configratuion', error);
    }
}

// Get Queued Items And Process On Internet | Queue Tbl
const processQueue = async () => {
    let clause = {
        where: {
            status: 'queued'
        },
    }
    try {
        let queues = await queue.findAll(clause);
        //
        if (queues.length > 0) {
            for (const queue of queues) {
                updateQueue(queue, async (data) => {
                    let updateObj = { status: 'complete' };
                    // Update Queued Record
                    try {
                        const rowsUpdated = await queue.update(updateObj, {
                            where: { 'id': data.id },
                            returning: true
                        });
                    } catch (error) {
                        console.error('Error On Update Ticket API');
                    }
                });
            }
        }
    }
    catch (error) {
        console.error('Unable To Process Records For API');
    }
}

// Get All Queued Items And Process On File Add | Queue Tbl
const getQueueData = async (user_id, page = 1, perPage = 15) => {
    let clause = {
        where: {
            user_id: user_id,
        },
        order: [['createdAt', 'DESC']],
    }
    try {
        //
        let queues = await queue.findAll(clause);
        //
        let records = [];
        const startIndex = (page - 1) * perPage;
        const endIndex = page * perPage;

        if (queues.length > 0) {
            for (const queue of queues) {
                var ticket_info = JSON.parse(queue.json);
                //
                if (ticket_info.length > 0) {
                    for (const info of ticket_info) {
                        let transaction_id = queue.transaction_id;
                        let lottery_upc = info.lottery_upc;
                        let lottery_name = info.lottery_name;
                        let lottery_price = info.lottery_price;
                        let lottery_quantity = info.lottery_quantity;
                        let createdAt = queue.createdAt.toISOString().slice(0, 19).replace('T', ' ');
                        //
                        let is_return = queue.is_return;
                        let status = queue.status;
                        //
                        let data = {
                            transaction_id,
                            lottery_upc,
                            lottery_name,
                            lottery_price,
                            lottery_quantity,
                            is_return,
                            status,
                            createdAt,
                        };
                        //
                        records.push(data);
                    }
                }
            }
        }

        const paginatedRecords = records.slice(startIndex, endIndex);
        const totalRecords = records.length;

        return {
            currentPage: page,
            totalPages: Math.ceil(totalRecords / perPage),
            totalRecords,
            records: paginatedRecords,
        };
    } catch (error) {
        console.error('Error Getting Transaction From DB', error);
    }
}

const getUPC = async () => {
    try {
        return await lotteries.findAll({
            attributes: ['lottery_upc_code'],
            raw: true
        });
    } catch (error) {
        console.error(error);
    }
}

// Remove User From DB | Config Tbl
const logoutDB = (user_id) => {
    let clause = {
        where: {
            user_id: user_id
        }
    }
    try {
        return config.destroy(clause);
    } catch (error) {
        console.error('Error Deleting item From Configratuion', error);
    }
}

const truncateLotteriesTable = async () => {
    try {
        return await lotteries.destroy({ truncate: true });
    } catch (error) {
        console.error(error);
    }
}


// Export Modules
module.exports = {
    processQueue,
    addToQueue,
    getQueueData,
    addToConfig,
    addToLotteries,
    logoutDB,
    isAuth,
    updateConfig,
    truncateLotteriesTable,
    getUPC,
};
