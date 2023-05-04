const PATH = require('path');
const FS = require('fs');

const text_path = PATH.join(__dirname, 'text.txt');
const input = FS.createReadStream(text_path);
let result = '';

input.on('data', data => { result += data.toString(); });
input.on('end', () => console.log(result));

