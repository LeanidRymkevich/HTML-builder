const PATH = require('path');
const FS = require('fs/promises');

const coped_folder_name = 'files';
const clone_folder_name = `${coped_folder_name}-copy`;

async function copyFolder(coped_folder_parent, clone_folder_parent, coped_folder_name, clone_folder_name) {
  const coped_folder_path = PATH.join(coped_folder_parent, coped_folder_name);
  const file_dirents = await FS.readdir(
    coped_folder_path,
    {
      encoding: 'utf8',
      withFileTypes: true
    }
  );
  const clone_folder_path = PATH.join(clone_folder_parent, clone_folder_name);

  await FS.mkdir(clone_folder_path, { recursive: true });

  let coped_file_path;
  let clone_file_path;

  file_dirents.forEach(item => {
    if(item.isDirectory()) {
      copyFolder(coped_folder_path, clone_folder_path, item.name, item.name);
    } else {
      coped_file_path = PATH.join(coped_folder_path, item.name);
      clone_file_path = PATH.join(clone_folder_path, item.name);
      FS.copyFile(coped_file_path, clone_file_path);
    }
  });
}

copyFolder(__dirname, __dirname, coped_folder_name, clone_folder_name);