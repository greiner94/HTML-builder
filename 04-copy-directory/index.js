const { mkdir } = require('node:fs/promises');
const { resolve, join } = require('node:path');
const { copyFile, constants }  = require('node:fs/promises');
const { readdir, unlink } = require('node:fs/promises');

const srcPath = join(__dirname, 'files');
const destPath = join(__dirname, 'files-copy');

async function makeDirectory() {
  const projectFolder = join(__dirname, 'files-copy');
  return await mkdir(projectFolder, { recursive: true });
}

async function copyFiles(fileName) {
  return await copyFile(join(srcPath, fileName), join(destPath, fileName));
}

async function delDestFiles() {
  await readdir(destPath)
  .then(files => {
    files.forEach(file => {
      unlink(join(destPath, file));
    });
  });
}

async function getFilePaths() {
  return await readdir(srcPath);
}

makeDirectory()
.then(() => delDestFiles())
.then(() => getFilePaths())
.then(res =>  res.forEach(file => {
  copyFiles(file);
}));