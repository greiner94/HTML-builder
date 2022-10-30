const { join } = require('node:path');
const { copyFile, readdir, rm, mkdir }  = require('node:fs/promises');

exports.copyDirectory = async function copyDirectory(src, dest) {
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
