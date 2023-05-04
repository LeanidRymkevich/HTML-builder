const PATH = require('path');
const FS = require('fs/promises');

const secret_folder_path = PATH.join(__dirname, 'secret-folder');

async function showFilesList(path){
  const file_dirents = await FS.readdir(
    secret_folder_path,
    {
      encoding: 'utf8',
      withFileTypes: true
    }
  );

  let file_path;
  let file_name;
  
  file_dirents.forEach(item => {
    if(!item.isDirectory()){
      file_path = PATH.join (secret_folder_path, item.name);
      file_name = item.name.slice(0, item.name.lastIndexOf('.'));
      showFileInfo(file_path, file_name);
    }
  });
}

async function showFileInfo(path, name) {
  const file_extention = path.split('.').at(-1);
  const file_stat = await FS.stat(path);
  const file_size = `${file_stat.size}b`;
  console.log(`${name} - ${file_extention} - ${file_size}`);
}

showFilesList(secret_folder_path);