const PATH = require('path');
const FS = require('fs');
const INPUT = process.stdin;
const READLINE = require('readline');
const GRETEENG = 'Welcome! Enter your text below:';
const FAREWELL = 'Bye!'

const text_path = PATH.join(__dirname, 'text.txt');
const output = FS.createWriteStream(text_path);
const interface = READLINE.createInterface(INPUT);
let result = '';

console.log(GRETEENG);

interface.on('line', line => {
  if(line.trim().toLowerCase() === 'exit'){
    process.emit('SIGINT');
  }
  result += line;
  output.write(result);
})

process.on('SIGINT', () => {
  console.log(FAREWELL);
  process.exit();
});



