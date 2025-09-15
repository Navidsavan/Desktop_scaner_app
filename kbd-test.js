// kbd-test.js
const { GlobalKeyboardListener } = require('node-global-key-listener');
console.log('Starting kbd-test: press some keys (Ctrl-C to quit)');

const keyboard = new GlobalKeyboardListener();

keyboard.addListener((e) => {
  // print the raw event so we can inspect what the library gives us
  console.log(JSON.stringify(e));
});
