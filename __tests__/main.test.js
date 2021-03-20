// import '@testing-library/jest-dom';
// import path from 'path';
// import fs from 'fs';
// import { screen, waitFor } from '@testing-library/dom';
// import testingLibraryUserEvent from '@testing-library/user-event';
// import i18next from 'i18next';
import run from '../src/app.js';

test('sum', () => {
  expect(run(3, 3)).toBe(6);
});
// const userEvent = testingLibraryUserEvent;

// let elements;

// beforeEach(() => {
//   const pathToFixture = path.join('__tests__', '__fixtures__', 'index.html');
//   const initHtml = fs.readFileSync(pathToFixture).toString();
//   document.body.innerHTML = initHtml;
//   run();

//   elements = {
//     input: screen.getByRole('textbox'),
//     submit: screen.getByRole('button', { selector: '[type="submit"]' }),
//   };
// });
