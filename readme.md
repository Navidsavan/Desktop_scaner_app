**TO RUN APP**

- git clone URL
- npm install 
- npm start

**COMPILE TAILWIND**
- npm run build-css

The Build Will Created Inside Source Code Folder Name Of The Folder Will Be "Dist"

**For EXE COMPILE**
- Change "oneClick": false and "allowToChangeInstallationDirectory": true In Package.json
- npm run rebuild
- npm run build

**UPDATER FILE COMPILE FOR GITHUB**
- Change "oneClick": true and "allowToChangeInstallationDirectory": false
- npm run rebuild
- npm run build


 **BOOutBox** 
 - a BackOfficeOutBox Folder Where each transaction drops. Located at Client PC inside XMLGateway Folder Where we are going to install out POS App
 - IP: \\10.5.48.2\XMLGateway

**How does POS work?**
- We watch a file using chokidar (a Node.js package) in BOOutBox, located inside XMLGateway then, we process it.

**How does file processing work?**
- We copy the file from BOOutBox and paste it into the TempFile folder inside our POS app. Then, we look for <SaleEvent> and <ReturnEvent> inside the XML, which contains transaction details like TransactionID, date, time, etc. Inside <SaleEvent>, we look for <TransactionDetailGroup>, which contains each transaction. Within each transaction, we search for <TransactionLine>, which represents a single transaction and its status. It should be "Normal." If it is "Cancelled," it means that the transaction is canceled, and we do not process it. Within each <TransactionLine>, there is an <ItemLine> with an <ItemCode>. Inside <ItemCode>, you will find transaction details like <POSCode>, which is the UPC code of the product, description, sales quantity, and sales amount, MerchandiseCode (Department ID), and we only process those that have a Lottery Department ID, etc.

**What happens after processing is complete?**
- After extracting all the necessary details, we save them in a database (SQLite) with a status of "Queue." We then fetch the data from the database and send it to the API. After processing through the API, we update the status in the database to "Complete."

**HOW POS SERVER SIDE API WORKING (LotteryScreen.App)**
- API Function “pos_transaction” is located in POSController we are receiving information of Transaction, Store ID from POS App We Match the information in sales table for sales package according to current date and essential table for essential package then update the end number

**To generate .exe file in MACBOOK:**
- First run this in the root of your project: ./node_modules/.bin/electron-builder --windows --publish always

**Incase any error while building .exe follow bellow steps;**
- Using Wine on macOS to generate a Windows executable (.exe file) for an Electron app involves running Windows-based tools and commands through Wine. Here are general steps you can follow
**Install Wine:**
- You can install Wine on macOS using Homebrew. Open Terminal and run the following commands:
- /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
**After Homebrew is installed, install Wine:**
- brew install --cask wine-stable

**To build .exe on macbook:**

- ./node_modules/.bin/electron-builder --windows --publish always
