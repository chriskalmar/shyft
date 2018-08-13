import fs from 'fs';

const buildArray = (length, value = 1) => {
  return new Array(length).fill(value);
};

export const readRows = fileName => {
  const filePath = `${__dirname}/data/${fileName}.csv`;
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split('\n')
    .filter(row => row.length)
    .map(row => row.split(','));
};

export const writeTestDataFile = (fileName, content) => {
  const filePath = `${__dirname}/data/${fileName}.csv`;
  fs.writeFileSync(filePath, content.join('\n') + '\n', 'utf8');
};

export const generateRows = (count, fileName, generator) => {
  const content = buildArray(count).map((item, idx) => {
    return generator(idx).join(',');
  });

  writeTestDataFile(fileName, content);
};
