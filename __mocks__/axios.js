import fs from 'fs';
import path from 'path';

const pathToData = path.join('__tests__', '__fixtures__', 'rss.xml');
const xmlData = fs.readFileSync(pathToData, 'utf-8');

export default {
  get: jest.fn(() => Promise.resolve({ data: { contents: xmlData } })),
};
