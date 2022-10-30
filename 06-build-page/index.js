const { join } = require('node:path');
const { mkdir, readdir } = require('node:fs/promises');
const { createReadStream, writeFile } = require('fs');

const { mergeStyles } = require('../05-merge-styles/mergeStyles');
const { copyDirectory } = require('../04-copy-directory/copyDirectory');

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