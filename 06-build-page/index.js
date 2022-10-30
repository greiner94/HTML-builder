const { join } = require('node:path');
const { mkdir, readdir } = require('node:fs/promises');
const { createReadStream, writeFile } = require('fs');
const { extname } = require('node:path');
const { unlink } = require('node:fs/promises');
const { createWriteStream } = require('fs');
const { copyFile, rm}  = require('node:fs/promises');

const mergeStyles = function mergeStyles(src = join(__dirname, 'styles'), 
dist = join(__dirname, 'project-dist'), nameOfBundle = 'bundle.css') {

  const srcPath = src;
  const distPath = dist;
  
  async function delDestCss() {
    await readdir(distPath)
    .then(files => {
      files.forEach(file => {
        if (extname(join(distPath, file)) == '.css') {
          unlink(join(distPath, file));
        }
      });
    });
  }
  
  async function getCssFromSrc() {
    let cssFilesArr = [];
    const allFiles = await readdir(srcPath);
  
    allFiles.forEach(file => {
      if(extname(join(srcPath, file)) == '.css') {
        cssFilesArr.push(join(srcPath, file));
      }
    });
    
    return cssFilesArr;
  }
  
  async function combineCss(filesDist) {
  
    return await new Promise((resolve, reject) => {
      let resultFile = '';
  
      filesDist.forEach((file, index) => {
        const readableStream = createReadStream(file, 'utf-8');
        readableStream.on('data', chunk => resultFile += chunk);
  
        readableStream.on('end', () => {
          if (index == filesDist.length - 1) {
            resolve(resultFile);
          }
        });
  
        readableStream.on('error', error => reject(error));
  
      });
    });
   
  }
  
  function writeToFile(text) {
    const output = createWriteStream(join(distPath, nameOfBundle));
    output.write(text);
  }
  delDestCss()
  .then(() => getCssFromSrc())
  .then(res => combineCss(res))
  .then(res => writeToFile(res));

};

const copyDirectory = async function copyDirectory(src, dest) {
    await rm(dest, { force: true, recursive: true });
    await mkdir(dest, { recursive: true });
    let files = await readdir(src, { withFileTypes: true });

    for (let file of files) {
        let srcPath = join(src, file.name);
        let destPath = join(dest, file.name);

        if (file.isDirectory()) {
          await copyDirectory(srcPath, destPath);
        } else {
          await copyFile(srcPath, destPath);
        }
    }
};

const dest = join(__dirname, 'project-dist');
const templateDist = join(__dirname, 'template.html');
const components = join(__dirname, 'components');

createFolder(dest);
mergeStyles(join(__dirname, 'styles'), join(__dirname, 'project-dist'),'style.css');
copyDirectory(join(__dirname, 'assets'), join(__dirname, 'project-dist', 'assets'));
combineHtml();

async function createFolder(dist) {
  await mkdir(dist, { recursive: true });
}

async function combineHtml() {
  
  const htmlInner = await new Promise((resolve, reject) => {
    let resultFile = '';

    const readableStream = createReadStream(templateDist, 'utf-8');
    readableStream.on('data', chunk => resultFile += chunk);

    readableStream.on('end', () => {
        resolve(resultFile);
    });

    readableStream.on('error', error => reject(error));

  });

  const componentsArr = await readdir(components);

  const componentsInner = await new Promise((resolve, reject) => {
    let componentsInner = [];

    componentsArr.forEach((file, index) => {
      let fileInner = '';
      const readableStream = createReadStream(join(components, file), 'utf-8');
      readableStream.on('data', chunk => fileInner += chunk);

      readableStream.on('end', () => {
          componentsInner.push({
            name: file.split('.')[0],
            content: fileInner
          });

        if (index == componentsArr.length - 1) {
          resolve(componentsInner);
        }
      });

      readableStream.on('error', error => reject(error));

    });
  });

  let resultHtml = htmlInner;
  let resultComponents = componentsInner;

  resultComponents.forEach(({name, content}) => {
    if (resultHtml.indexOf(`{{${name}}}`) != -1) {
      let splitedHtml = resultHtml.split(`{{${name}}}`); 
      resultHtml = splitedHtml[0] + content + splitedHtml[1];
    }
  });
  
  writeFile(join(dest, 'index.html'), resultHtml, (err) => {
    if (err) throw err;
  });

}