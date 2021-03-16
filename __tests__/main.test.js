import '@testing-library/jest-dom';
import path from 'path';
import fs from 'fs';
import { screen, waitFor } from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import i18next from 'i18next';
import run from '../src/index.js';

const userEvent = testingLibraryUserEvent;

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
  expect(elements.submit).not.toBeDisabled();
  userEvent.type(elements.input, 'Hello');
  userEvent.click(elements.submit);
  expect(elements.input).toHaveClass('is-invalid');
  expect(screen.queryByText(i18next.t('errors.url'))).toBeInTheDocument();

  userEvent.clear(elements.input);

  userEvent.type(elements.input, 'http://lorem-rss.herokuapp.com/feed');
  userEvent.click(elements.submit);
  expect(elements.submit).toBeDisabled();

  await waitFor(() => {
    expect(elements.submit).not.toBeDisabled();
    expect(screen.queryByText('text-success')).not.toBeInTheDocument();
    const posts = screen.getAllByRole('listitem');
    expect(posts).toHaveLength(11);
  });
  userEvent.clear(elements.input);
});
