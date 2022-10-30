const { copyDirectory } = require('./copyDirectory');
const { join } = require('node:path');

copyDirectory(join(__dirname, 'files'), join(__dirname, 'files-copy'));