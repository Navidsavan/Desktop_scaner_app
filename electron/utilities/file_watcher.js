// Chokidar File Watcher
const chokidar = require('chokidar');
// Root Dir Variable
const { dir, appPath } = require('./variables');
//
const { checkIfFileIsFree, delete_file } = require('./file_system');
// File System
const fs = require('fs');
// XML To Json
const xml2js = require('xml2js');
//
const { processQueue, addToQueue } = require('./db');
//
const { State } = require('./variables');
//------------------------------------------------------------------------------------
let ready = false;
let temp_dir = appPath + '/tempfiles';
let watcher;
let watcherPath = '\\\\10.5.48.2\\XMLGateway\\BOOutBox';
//------------------------------------------------------------------------------------
// Watcher Function
//------------------------------------------------------------------------------------
let setupWatcher = (watcher_dir, win) => {
    //------------------------------------------------------------------------------------
    // Create directory if it doesn't exist
    if (!fs.existsSync(temp_dir)){
        fs.mkdirSync(temp_dir);
    }
    watcher = chokidar.watch(watcher_dir, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
        depth: 99,
    });
    // On File Add
    watcher.on('add', (full_path) => {
        //
        var filename = dir.basename(full_path);
        //
        let tempPath = dir.format({
            root: '/ignored',
            dir: temp_dir,
            base: filename,
        }).replace(/\\/g, "/");
        //
        win.webContents.send('send_path', tempPath);
        //
        if (ready) {
            console.log(`File ${full_path} has been added`);
            // Copy The File
            checkIfFileIsFree(full_path, () => {
                // Copy the file from source to destination
                fs.copyFile(full_path, tempPath, (err) => {
                    if (err) {
                        console.error('Error copying file:', err);
                    }
                    // Read The XML File
                    const xml = fs.readFileSync(tempPath);
                    // parse the XML file
                    xml2js.parseString(xml, async (err, result) => {
                        if (err) {
                            delete_file(tempPath);
                            console.error('Error: File Has Undefined Error | DELETE FILE 1');
                        }
                        // Get Data From State
                        let { user_id, store_id, pos_dept_id } = State.get('auth');
                        let upcCodes = State.get('upc');
                        //
                        if (result && result['NAXML-POSJournal'] && result['NAXML-POSJournal']['JournalReport']) {
                            const journalReport = result['NAXML-POSJournal']['JournalReport'][0];
                            if (journalReport) {
                                if (journalReport['SaleEvent']) {
                                    // Sale Data Array
                                    let sales_data = [];
                                    //
                                    let SuspendFlag = journalReport['SaleEvent'][0]['SuspendFlag'][0].$.value;
                                    //
                                    if (SuspendFlag == "no") {
                                        // Transaction Date
                                        let transaction_date = journalReport['SaleEvent'][0]['ReceiptDate'][0];
                                        // Transaction Time
                                        let transaction_time = journalReport['SaleEvent'][0]['ReceiptTime'][0];
                                        // Transaction ID
                                        let transaction_id = journalReport['SaleEvent'][0]['TransactionID'][0];
                                        // Extract The Specific Node
                                        let jsonArray = journalReport['SaleEvent'][0]['TransactionDetailGroup'][0]['TransactionLine'];
                                        // Loop Through The Node
                                        jsonArray.forEach(first => {
                                            //
                                            if (typeof first.$ != 'undefined' && first.$.status == "normal") {
                                                var fNode = first.ItemLine;
                                                if (typeof fNode != 'undefined') {
                                                    fNode.map((second) => {
                                                        // Merchandise Code
                                                        let merch_id = second.MerchandiseCode[0];
                                                        // Lottery UPC
                                                        let lottery_upc = second.ItemCode[0].POSCode[0].slice(7, 11);
                                                        // Lottery Name
                                                        let lottery_name = second.Description[0];
                                                        // Lottery Price
                                                        let lottery_price = second.RegularSellPrice[0];
                                                        // Lottery Quanitity
                                                        let lottery_quantity = second.SalesQuantity[0];
                                                        // UPC Not Found And Dept ID Not Match
                                                        if (upcCodes.includes(lottery_upc) && pos_dept_id == merch_id) {
                                                            let data = {
                                                                'merch_id': merch_id,
                                                                'lottery_upc': lottery_upc,
                                                                'lottery_name': lottery_name,
                                                                'lottery_price': lottery_price,
                                                                'lottery_quantity': lottery_quantity,
                                                            };
                                                            //
                                                            sales_data.push(data);
                                                        }
                                                        else {
                                                            console.log('Error: UPC Or Dept ID Dose Not Match | DELETE FILE 2');
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('Error: No Item Found | DELETE FILE 3');
                                                }
                                            }
                                            else {
                                                console.log('Error: Transaction Is Cancel Or Undefine | DELETE FILE 4');
                                            }
                                        });
                                        //
                                        if (sales_data.length > 0) {
                                            sales_data = JSON.stringify(sales_data);
                                            //
                                            addToQueue({
                                                'json': sales_data,
                                                'status': 'queued',
                                                'user_id': user_id,
                                                'store_id': store_id,
                                                'is_return': 0,
                                                'transaction_date': `${transaction_date} ${transaction_time}`,
                                                'transaction_id': transaction_id,
                                            }, 'deleteFile')
                                            .then(response => {
                                                console.log(`Lotteries Has Been Added`);
                                            })
                                            .catch(error => {
                                                console.error('Error outside async function:', error)
                                            });
                                            //
                                            processQueue();
                                        }
                                        else {
                                            console.log('Error: No Sales Record Found | DELETE FILE 5');
                                        }
                                    }
                                    else {
                                        console.log('Error: Transaction Has Suspended | DELETE FILE 6');
                                    }
                                }
                                else if (journalReport['RefundEvent']) {
                                    // Sale Data Array
                                    let return_data = [];
                                    //
                                    let SuspendFlag = journalReport['RefundEvent'][0]['SuspendFlag'][0].$.value;
                                    //
                                    if (SuspendFlag == "no") {
                                        // Transaction Date
                                        let transaction_date = journalReport['RefundEvent'][0]['ReceiptDate'][0];
                                        // Transaction Time
                                        let transaction_time = journalReport['RefundEvent'][0]['ReceiptTime'][0];
                                        // Transaction ID
                                        let transaction_id = journalReport['RefundEvent'][0]['TransactionID'][0];
                                        // Extract The Specific Node
                                        let jsonArray = journalReport['RefundEvent'][0]['TransactionDetailGroup'][0]['TransactionLine'];
                                        // Loop Through The Node
                                        jsonArray.forEach(first => {
                                            //
                                            if (typeof first.$ != 'undefined' && first.$.status == "normal") {
                                                var fNode = first.ItemLine;
                                                if (typeof fNode != 'undefined') {
                                                    fNode.map((second) => {
                                                        // Merchandise Code
                                                        let merch_id = second.MerchandiseCode[0];
                                                        // Lottery UPC
                                                        let lottery_upc = second.ItemCode[0].POSCode[0].slice(7, 11);
                                                        // Lottery Name
                                                        let lottery_name = second.Description[0];
                                                        // Lottery Price
                                                        let lottery_price = second.RegularSellPrice[0];
                                                        // Lottery Quanitity
                                                        let lottery_quantity = second.SalesQuantity[0];
                                                        //
                                                        if (upcCodes.includes(lottery_upc) && pos_dept_id == merch_id) {
                                                            let data = {
                                                                'merch_id': merch_id,
                                                                'lottery_upc': lottery_upc,
                                                                'lottery_name': lottery_name,
                                                                'lottery_price': lottery_price,
                                                                'lottery_quantity': lottery_quantity,
                                                            };
                                                            //
                                                            return_data.push(data);
                                                        }
                                                        else {
                                                            console.log('Error: UPC Or Dept ID Dose Not Match | DELETE FILE 7');
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('Error: No Item Found | DELETE FILE 8');
                                                }
                                            }
                                            else {
                                                console.log('Error: Transaction Is Cancel Or Undefine | DELETE FILE 9');
                                            }
                                        });
                                        //
                                        if (return_data.length > 0) {
                                            return_data = JSON.stringify(return_data);
                                            //
                                            addToQueue({
                                                'json': return_data,
                                                'status': 'queued',
                                                'user_id': user_id,
                                                'store_id': store_id,
                                                'is_return': 1,
                                                'transaction_date': `${transaction_date} ${transaction_time}`,
                                                'transaction_id': transaction_id,
                                            }, 'deleteFile')
                                            .then(response => {
                                                console.log(`Lotteries Has Been Added`);
                                            })
                                            .catch(error => {
                                                console.error('Error outside async function:', error)
                                            });
                                            //
                                            processQueue();
                                        }
                                        else {
                                            console.log('Error: No Sales Record Found | DELETE FILE 10');
                                        }
                                    }
                                    else {
                                        console.log('Error: Transaction Has Suspended | DELETE FILE 11');
                                    }
                                }
                                else {
                                    console.log('DELETE FILE 1');
                                }
                            }
                            else {
                                console.log('DELETE FILE 2');
                            }
                        }
                        else {
                            delete_file(tempPath);
                            console.log('DELETE FILE 3');
                        }
                    });
                });
            });
        }
    });
    // On Watcher Ready
    watcher.on('ready', () => {
        console.log('Initial scan complete. Watching for new files...');
        ready = true;
    })
    // On File Delete
    watcher.on('unlink', (full_path) => {
        console.log(`File ${full_path} has been removed`);
    });
    // On File Change
    watcher.on('change', (full_path) => {
        console.log(`File ${full_path} has been change`);
    });
    // Handle the file-watching error gracefully
    watcher.on('error', (error) => {
        if (error.code === 'ECONNRESET') {
            // Connection reset, retry
            console.log('Connection reset, retrying...');
            if (watcher != null && watcher.closed != null && !watcher.closed) {
                watcher.close();
            }
            setTimeout(() => {
                watcher = setupWatcher(watcherPath, win)
            }, 1000); // Retry after a 5-second delay
        } else {
            console.error(`Chokidar error: ${error}`);
        }
    });
    //------------------------------------------------------------------------------------
    return watcher;
}

//------------------------------------------------------------------------------------
// Export Modules
module.exports = {
    setupWatcher,
};
//------------------------------------------------------------------------------------