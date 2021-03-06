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
  const feed = {
    id,
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  };
  watchedState.rssData.feeds.unshift(feed);
  const items = xml.querySelectorAll('channel > item');
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
    watchedState.rssData.posts.unshift(post);
  });
};

const getRss = (watchedState, formUrl) => {
  if (watchedState.rssUrl.includes(formUrl)) {
    throw new Error('This URL already exist!');
  }
  const encodedUrl = `https://api.allorigins.win/get?url=${formUrl}`;
  axios(encodedUrl).then((response) => {
    const xmlDoc = parseXml(response.data.contents);
    watchedState.rssUrl.push(formUrl);
    makeRssData(watchedState, xmlDoc);
  }).catch((error) => {
    watchedState.form.errors = error.message;
  });
};

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
    rssUrl: [],
    rssData: {
      feeds: [],
      posts: [],
    },
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
      getRss(watchedState, formUrl);
    } catch (err) {
      watchedState.form.valid = false;
      watchedState.form.errors = err.message;
    }
  });
};

run();
