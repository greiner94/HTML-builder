const { stdout, stdin } = process;
const path = require('path');
const fs = require('fs');

fs.writeFile(
  path.join(__dirname, 'text.txt'),
  '',
  (err) => {
      if (err) throw err;
      console.log('Введите текст, который запишется в text.txt:');
  }
);

const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));

stdin.on('data', data => {

  if(data.toString().trim() == 'exit') {
    process.exit();
  }

  output.write(data);
});

process.on('exit', () => stdout.write('Пока! Удачи в обучении!'));
process.on('SIGINT', () => process.exit());
