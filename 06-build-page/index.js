const PATH = require('path');
const FS = require('fs');
const FS_PROMISES = require('fs/promises');

const assets_folder_name = 'assets';
const bundle_folder_name = 'project-dist';
const styles_folder_name = 'styles';
const style_bundle_name = 'style.css';
const components_folder_name = 'components';
const tempalte_file_name = 'template.html';
const html_bundle_name = 'index.html';

const bundle_folder_path = PATH.join(__dirname, bundle_folder_name);
const styles_folder_path = PATH.join(__dirname, styles_folder_name);
const style_bundle_path = PATH.join(bundle_folder_path, style_bundle_name);
const components_folder_path = PATH.join(__dirname, components_folder_name);
const tempalte_file_path = PATH.join(__dirname, tempalte_file_name);
const html_bundle_path = PATH.join(bundle_folder_path, html_bundle_name);

async function createFolder(bundle_folder_path){
  await FS_PROMISES.rm(bundle_folder_path, { recursive: true, force: true });
  await FS_PROMISES.mkdir(bundle_folder_path);
}

async function copyFolder(coped_folder_parent, clone_folder_parent, coped_folder_name, clone_folder_name) {
  const coped_folder_path = PATH.join(coped_folder_parent, coped_folder_name);
  const file_dirents = await FS_PROMISES.readdir(
    coped_folder_path,
    {
      encoding: 'utf8',
      withFileTypes: true
    }
  );
  const clone_folder_path = PATH.join(clone_folder_parent, clone_folder_name);

  await createFolder(clone_folder_path);

  let coped_file_path;
  let clone_file_path;

  file_dirents.forEach(item => {
    if(item.isDirectory()) {
      copyFolder(coped_folder_path, clone_folder_path, item.name, item.name);
    } else {
      coped_file_path = PATH.join(coped_folder_path, item.name);
      clone_file_path = PATH.join(clone_folder_path, item.name);
      FS_PROMISES.copyFile(coped_file_path, clone_file_path);
    }
  });
}

async function joinCSSFiles(source_folder_path, bundle_file_path) {
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

async function bundleStyles(source_folder_path, bundle_file_path) {
  await FS_PROMISES.rm( bundle_file_path, { recursive: true, force: true } )
  await joinCSSFiles(source_folder_path, bundle_file_path);
}

async function getComponents(components_folder_path) {
  const file_dirents = await FS_PROMISES.readdir(
    components_folder_path,
    {
      encoding: 'utf8',
      withFileTypes: true
    }
  );

  const components = [];
  let item_path;
  let item_name;
  let item_extention;
  let component;
  let component_obj;

  for(let item of file_dirents){
    item_path = PATH.join(components_folder_path, item.name);
    item_name = item.name.slice(0, item.name.lastIndexOf('.'));
    item_extention = item.name.split('.').at(-1);
    
    if(item.isDirectory()) {
      components.push(...await getComponents(item_path))
    } else {
      if(item_extention === 'html'){
        component = await FS_PROMISES.readFile(item_path, { encoding: 'utf-8'});
        component_obj = {
          tag: item_name,
          content: component,
        }
        components.push(component_obj);
      }
    }
  }
  return components;
}

function replaceTemplateWithComponent(html_template, components) {
  let result = html_template;
  for(let component of components){
    result = result.replace(`{{${component.tag}}}`, component.content);
  }
  return result;
}

async function joinHTMLFiles(bundle_file_path, tempalte_file_path, components_folder_path){
  const html_template = await FS_PROMISES.readFile(tempalte_file_path, {encoding: 'utf-8'});
  const components = await getComponents(components_folder_path);
  const changed_html = replaceTemplateWithComponent(html_template, components);
  
  FS_PROMISES.writeFile(bundle_file_path, changed_html);
}

async function bundleHTML(bundle_file_path, tempalte_file_path, components_folder_path) {
  await FS_PROMISES.rm( bundle_file_path, { recursive: true, force: true } )
  await joinHTMLFiles(bundle_file_path, tempalte_file_path, components_folder_path);
}

async function bundleProject(){
  await createFolder(bundle_folder_path);
  await copyFolder(__dirname, bundle_folder_path, assets_folder_name, assets_folder_name);
  await bundleStyles(styles_folder_path, style_bundle_path);
  await bundleHTML(html_bundle_path, tempalte_file_path, components_folder_path);
}

// run application

bundleProject();