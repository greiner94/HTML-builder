const { join, extname } = require('node:path');
const { readdir, unlink } = require('node:fs/promises');
const { createReadStream, createWriteStream } = require('fs');

exports.mergeStyles = function mergeStyles(src = join(__dirname, 'styles'), 
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