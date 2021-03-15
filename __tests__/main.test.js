import '@testing-library/jest-dom';
import path from 'path';
import nock from 'nock';
import fs from 'fs';
import { screen, waitFor } from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import i18next from 'i18next';
// import parseXml from '../src/parser.js';

import run from '../src/index.js';

const userEvent = testingLibraryUserEvent;

nock.disableNetConnect();

const pathToData = path.join('__tests__', '__fixtures__', 'rss.xml');
const data = fs.readFileSync(pathToData, 'utf-8');

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
  expect(elements.input).not.toHaveClass('is-invalid');
  expect(screen.queryByText(i18next.t('errors.url'))).not.toBeInTheDocument();

  await userEvent.type(elements.input, 'Hello');
  await userEvent.click(elements.submit);

  expect(screen.queryByText(i18next.t('errors.url'))).toBeInTheDocument();
  expect(elements.input).toHaveClass('is-invalid');

  await userEvent.clear(elements.input);

  nock('http://lorem-rss.herokuapp.com')
    .get('/feed')
    .reply(200, data);

  await userEvent.type(elements.input, 'http://lorem-rss.herokuapp.com/feed');
  await userEvent.click(elements.submit);

  await waitFor(() => {
    // expect(elements.input).not.toHaveClass('is-invalid');
    // expect(screen.queryByText(i18next.t('errors.url'))).not.toBeInTheDocument();
    // expect(screen.queryByText('Lorem ipsum')).toBeInTheDocument();
  });
});
