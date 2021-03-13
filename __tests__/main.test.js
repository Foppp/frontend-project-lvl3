import path from 'path';
import { promises as fs } from 'fs';
import parseXml from '../src/parser.js';

const getFixturePath = (name) => path.join(`${__dirname}/__fixtures__/${name}`);

const fileName = 'rss.xml';
const src = getFixturePath(fileName);

// let expected;

// beforeAll(async () => {
//   expected = await fs.readFile(getFixturePath('rss.txt'), 'utf-8');
// });

test('parser', async () => {
  const expected = await fs.readFile(getFixturePath('rss.txt'), 'utf-8');
  const actual = await fs.readFile(src, 'utf-8');
  expect(parseXml(actual)).toEqual(expected);
});
