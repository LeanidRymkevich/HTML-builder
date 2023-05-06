const PATH = require('path');
const FS = require('fs');
const FS_PROMISES = require('fs/promises');

const source_folder_name = 'styles';
const target_folder_name = 'project-dist';
const bundle_file_name = 'bundle.css';

const source_folder_path = PATH.join(__dirname, source_folder_name);
const target_folder_path = PATH.join(__dirname, target_folder_name);
const bundle_file_path = PATH.join(target_folder_path, bundle_file_name);

async function joinFiles(source_folder_path, bundle_file_path) {
  const file_dirents = await FS_PROMISES.readdir(
    source_folder_path,
    {
      encoding: 'utf8',
      withFileTypes: true,
    }
  );
  
  let item_path;
  let read_stream;
  let item_extention;
  
  file_dirents.forEach(item => {
    item_path = PATH.join(source_folder_path, item.name);
    
    if(item.isDirectory()){
      joinFiles(item_path, bundle_file_path);
    } else {
      item_extention = item.name.split('.').at(-1);

      if(item_extention === 'css'){
        read_stream = FS.createReadStream(item_path, 'utf-8');
        read_stream.on('data', data => {
          FS_PROMISES.appendFile(bundle_file_path, data + '\n');
        })
      }
    }
  })
}

FS_PROMISES.rm( bundle_file_path, { recursive: true, force: true } ).then( () => {
  joinFiles(source_folder_path, bundle_file_path);
});
