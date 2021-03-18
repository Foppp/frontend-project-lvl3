/* eslint-disable object-curly-newline */
/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import resources from './locales';
import initView from './view.js';
import parseXml from './parser.js';

const refreshDelay = 5000;

const encodeUrl = (url) => {
  const corsProxyUrl = 'https://hexlet-allorigins.herokuapp.com/get';
  const queryParams = `?disableCache=true&url=${encodeURIComponent(url)}`;
  return `${corsProxyUrl}${queryParams}`;
};

const requestData = (url) => axios.get(url)
  .then((response) => response.data.contents);

const generateId = (watchedState, posts) => {
  const id = watchedState.rssData.posts.length + 1;
  return posts.map((post, index) => ({ id: index + id, ...post }));
};

const getNewPosts = (posts, lastUpdate) => posts
  .filter((post) => Date.parse(post.date) > lastUpdate);

const loadData = (watchedState, url) => {
  requestData(encodeUrl(url)).then((response) => {
    const { feedName, feedDescription, posts } = parseXml(response);
    const updatedPostsId = generateId(watchedState, posts);
    watchedState.rssData.feeds.unshift({ feedName, feedDescription });
    watchedState.rssData.posts.push(...updatedPostsId);
    watchedState.form.processError = null;
    watchedState.form.processState = 'finished';
    watchedState.rssData.url[url] = Date.now();
  }).catch((err) => {
    if (err.request) {
      watchedState.form.processError = i18next.t('errors.network');
    } else {
      watchedState.form.processError = err.message;
    }
    watchedState.form.processState = 'failed';
  });
};

const refreshData = (watchedState) => {
  const urlList = watchedState.rssData.url;
  Object.entries(urlList).forEach(([url, lastUpdate]) => {
    requestData(encodeUrl(url)).then((response) => {
      const { posts } = parseXml(response);
      const newPosts = getNewPosts(posts, lastUpdate);
      const updatedId = generateId(watchedState, newPosts);
      watchedState.rssData.posts.push(...updatedId);
      watchedState.rssData.url[url] = Date.now();
    }).catch(() => {
      watchedState.form.processState = 'failed';
    });
  });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  });

  const state = {
    form: {
      processState: 'filling',
      processError: null,
      fields: {
        url: '',
      },
      valid: true,
      error: null,
    },
    rssData: {
      url: {},
      feeds: [],
      posts: [],
    },
  };

  const elements = {
    submitButton: document.querySelector('[aria-label="add"]'),
    input: document.querySelector('[aria-label="url"]'),
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const watchedState = initView(state, elements);

  const validate = (value) => {
    const schema = yup.object().shape({
      url: yup
        .string()
        .url(i18next.t('errors.url'))
        .test('doubleUrl', i18next.t('errors.doubleUrl'), (val) => !watchedState.rssData.url[val]),
    });
    try {
      schema.validateSync(value);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  elements.input.addEventListener('input', (e) => {
    const inputData = e.target.value;
    watchedState.form.processState = 'filling';
    watchedState.form.fields.url = inputData;
  });

  elements.form.addEventListener('submit', (e) => {
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
      loadData(watchedState, formUrl);
    }
  });

  const refreshTimer = setTimeout(function reload() {
    const urlList = watchedState.rssData.url;
    if (urlList.length === 0) {
      clearTimeout(refreshTimer);
    }
    refreshData(watchedState);
    setTimeout(reload, refreshDelay);
  }, refreshDelay);
};
