import '@testing-library/jest-dom';
import path from 'path';
import nock from 'nock';
import fs from 'fs';
import { screen, waitFor } from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import parseXml from '../src/parser.js';

import run from '../src/index.js';

const userEvent = testingLibraryUserEvent;

nock.disableNetConnect();

const pathToData = path.join('__tests__', '__fixtures__', 'rss.xml');
const data = fs.readFileSync(pathToData).toString();

let elements;

beforeEach(() => {
  const pathToFixture = path.join('__tests__', '__fixtures__', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;
  run();

  elements = {
    input: screen.getByRole('textbox'),
    submit: screen.getByRole('button', { selector: '[type="submit"]' }),
  };
});

test('working process', async () => {
  expect(screen.queryByText('This is not a valid URL!')).not.toBeInTheDocument();
  expect(elements.submit).not.toBeDisabled();

  await userEvent.type(elements.input, 'Hello');
  nock('http://lorem-rss.herokuapp.com')
    .get('/feed')
    .reply(200, data);

  // await userEvent.click(elements.submit);
  // await waitFor(() => {
  //   expect(elements.input).toHaveClass('is-invalid');
  //   expect(screen.queryByText('This is not a valid URL!')).toBeInTheDocument();
  // });
});
