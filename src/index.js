import 'jquery';
import 'popper.js';
import 'bootstrap';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import parseXml from './parser.js';
import initView from './view.js';

// const getRss = () => {
//   const url = 'http://lorem-rss.herokuapp.com/feed';
//   const encodedUrl = `https://api.allorigins.win/get?url=${url}`;
//   axios(encodedUrl).then((response) => {
//     const xmlDoc = parseXml(response.data.contents);
//     console.log(xmlDoc);
//   }).catch(console.log);
// };

// getRss();
const run = () => {
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      fields: {
        url: '',
      },
      valid: true,
      errors: [],
    },
    urlFeeds: [],
  };

  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const form = document.querySelector('form');
  const input = document.querySelector('input');
  const watchedState = initView(state);

  input.addEventListener('input', (e) => {
    const inputData = e.target.value;
    watchedState.form.processState = 'filling';
    watchedState.form.fields.url = inputData;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formUrl = formData.get('url');
    try {
      schema.validateSync(watchedState.form.fields);
      watchedState.form.valid = true;
      watchedState.form.errors = [];
      watchedState.urlFeeds = formUrl;
    } catch (err) {
      watchedState.form.valid = false;
      watchedState.form.errors = err.message;
    }
  });
};
run();
