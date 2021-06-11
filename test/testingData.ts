import fs from 'fs';

const buildArray = (length: number, value = 1) => {
  return new Array(length).fill(value);
};

export const readRows = (fileName: string): string[][] => {
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

export const writeTestDataFile = (
  fileName: string,
  content: string[],
): void => {
  const filePath = `${__dirname}/data/${fileName}.csv`;
  fs.writeFileSync(filePath, `${content.join('\n')}\n`, 'utf8');
};

export const generateRows = (
  count: number,
  fileName: string,
  generator: (arg: number) => any[],
): void => {
  const content = buildArray(count).map((_item, idx) => {
    return generator(idx).join(',');
  });

  writeTestDataFile(fileName, content);
};
