/* eslint-disable no-param-reassign */
import 'jquery';
import 'popper.js';
import 'bootstrap';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import parseXml from './parser.js';
import initView from './view.js';

const makeRssData = (watchedState, xml) => {
  const id = watchedState.rssUrl.length;
  const feedTitle = xml.querySelector('channel > title');
  const feedDescription = xml.querySelector('channel > description');
  const items = xml.querySelectorAll('channel > item');
  const feed = {
    id,
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  };
  watchedState.rssData.feeds.unshift(feed);
  items.forEach((item) => {
    const postTitle = item.querySelector('title');
    const postDescription = item.querySelector('description');
    const postLink = item.querySelector('link');
    const post = {
      id,
      title: postTitle.textContent,
      description: postDescription.textContent,
      link: postLink.textContent,
    };
    watchedState.rssData.posts.push(post);
  });
};

const run = () => {
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      processSuccess: false,
      fields: {
        url: '',
      },
      valid: true,
      error: null,
    },
    rssUrl: [],
    rssData: {
      feeds: [],
      posts: [],
    },
  };
  const form = document.querySelector('form');
  const input = document.querySelector('input');
  const watchedState = initView(state);

  const validate = (value) => {
    const schema = yup.object().shape({
      url: yup
        .string()
        .required()
        .url()
        .test('is-exist', 'This URL already exist in feed!', (val) => !watchedState.rssUrl.includes(val)),
    });
    try {
      schema.validateSync(value);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  input.addEventListener('input', (e) => {
    const inputData = e.target.value;
    watchedState.form.processState = 'filling';
    watchedState.form.fields.url = inputData;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formUrl = formData.get('url');

    watchedState.form.processState = 'sending';
    const error = validate(watchedState.form.fields);

    if (error) {
      watchedState.form.valid = false;
      watchedState.form.error = error;
      watchedState.form.processState = 'failed';
    } else {
      watchedState.form.valid = true;
      watchedState.form.error = null;
      const encodedUrl = `https://api.allorigins.win/get?url=${formUrl}`;
      axios(encodedUrl).then((response) => {
        const xmlDoc = parseXml(response.data.contents);
        watchedState.form.processState = 'finished';
        watchedState.form.processSuccess = true;
        watchedState.rssUrl.push(formUrl);
        makeRssData(watchedState, xmlDoc);
      }).catch((err) => {
        watchedState.form.processState = 'failed';
        watchedState.form.processError = err.message;
      });
    }
  });
};

run();
