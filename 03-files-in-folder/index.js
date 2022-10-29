const path = require('path');
const { stdout } = process;
const { readdir } = require('fs');
const fs = require('fs/promises');

let files = [];
const secretPath = path.join(__dirname, 'secret-folder');

readdir(secretPath, 
  { withFileTypes: true },
  (err, filesWithFolders) => {
  if (err) {
    stdout.write(err);
  } else {

    filesWithFolders.forEach(file => {
      if (!file.isDirectory()) {
        files.push(file.name);
      }
    });

    files.forEach(file => {
      Promise.all([getFileName(file), getFileExt(file), getSize(file)]).then(value => {
        console.log(value.join(' - '));
      });
    });
  }
});

async function getSize(fileName) {
  const stats = await fs.stat(path.join(secretPath, fileName));

  return Math.round((stats.size * 0.001 * 100)) / 100 + ' KB';
}

async function getFileExt(fileName) {
  return await path.parse(path.join(secretPath, fileName)).ext.slice(1);
}

async function getFileName(fileName) {
  return await path.parse(path.join(secretPath, fileName)).name;
}