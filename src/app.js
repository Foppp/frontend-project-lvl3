/* eslint-disable no-param-reassign */
import 'bootstrap';

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import initView from './view.js';
import parseXml from './parser.js';

const refreshDelay = 5000;

const getProxyUrl = (url) => {
  const corsProxyUrl = new URL('https://hexlet-allorigins.herokuapp.com/get');
  const newUrl = new URL(`?disableCache=true&url=${encodeURIComponent(url)}`, corsProxyUrl);
  return newUrl.toString();
};

const requestData = (url) => axios.get(url)
  .then((response) => response.data.contents);

const getNewPosts = (posts, lastUpdate) => posts
  .filter((post) => Date.parse(post.date) > lastUpdate);

const loadData = (watchedState, url) => {
  requestData(getProxyUrl(url)).then((response) => {
    const { feedName, feedDescription, posts } = parseXml(response);
    const loadDate = Date.now();
    watchedState.rssData.feeds.unshift({
      url, feedName, feedDescription, loadDate,
    });
    watchedState.rssData.posts.push(...posts);
    watchedState.form.error = null;
    watchedState.form.processState = 'finished';
  }).catch((err) => {
    switch (err.message) {
      case 'Parsing Error':
        watchedState.form.error = 'xml';
        break;
      case 'Network Error':
        watchedState.form.error = 'network';
        break;
      default:
        watchedState.form.error = 'unknown';
        break;
    }
    watchedState.form.processState = 'failed';
  });
};

const refreshData = (watchedState) => {
  const feedsList = watchedState.rssData.feeds;
  feedsList.forEach(({ url, loadDate }) => {
    requestData(getProxyUrl(url)).then((response) => {
      const { posts } = parseXml(response);
      const newPosts = getNewPosts(posts, loadDate);
      watchedState.rssData.posts.push(...newPosts);
      loadDate = Date.now();
    }).catch(() => {});
  });
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      error: null,
      valid: true,
    },
    rssData: {
      feeds: [],
      posts: [],
    },
    visitedPostsId: new Set(),
    modal: {
      currentPostId: null,
    },
  };

  const newInstance = i18next.createInstance();
  newInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then((t) => {
    yup.setLocale({
      string: {
        url: 'url',
      },
      mixed: {
        notOneOf: 'doubleUrl',
      },
    });
    t();
  });

  const elements = {
    submitButton: document.querySelector('[aria-label="add"]'),
    input: document.querySelector('[aria-label="url"]'),
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalOpenButtons: document.querySelectorAll('[data-toggle="modal"]'),
  };

  const watchedState = initView(state, elements, newInstance);

  const validate = (value) => {
    const schema = yup.object().shape({
      url: yup
        .string()
        .url()
        .notOneOf(watchedState.rssData.feeds.map(({ url }) => url)),
    });
    try {
      schema.validateSync(value);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  elements.posts.addEventListener('click', (e) => {
    const targetId = e.target.dataset.id;
    if (targetId) {
      watchedState.visitedPostsId.add(targetId);
      watchedState.modal.currentPostId = targetId;
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formUrl = formData.get('url');
    watchedState.form.processState = 'sending';
    const error = validate({ url: formUrl });
    if (error) {
      watchedState.form.valid = false;
      watchedState.form.error = error;
      watchedState.form.processState = 'failed';
    } else {
      watchedState.form.valid = true;
      loadData(watchedState, formUrl);
    }
  });

  setTimeout(function reload() {
    refreshData(watchedState);
    setTimeout(reload, refreshDelay);
  }, refreshDelay);

  // return newInstance;
};
