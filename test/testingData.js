import fs from 'fs';

const buildArray = (length, value = 1) => {
  return new Array(length).fill(value);
};

export const readRows = (fileName) => {
  const filePath = `${__dirname}/data/${fileName}.csv`;
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split('\n')
    .filter((row) => row.length)
    .map((row) => {
      // take care of escaped commas '\,'
      const prep = row.replace(/\\,/g, '|||');
      const columns = prep.split(',');
      return columns.map((column) => column.replace(/\|\|\|/g, ','));
    });
};

export const writeTestDataFile = (fileName, content) => {
  const filePath = `${__dirname}/data/${fileName}.csv`;
  fs.writeFileSync(filePath, `${content.join('\n')}\n`, 'utf8');
};

export const generateRows = (count, fileName, generator) => {
  const content = buildArray(count).map((item, idx) => {
    return generator(idx).join(',');
  });

  writeTestDataFile(fileName, content);
};
