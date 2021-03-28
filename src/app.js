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
    watchedState.rssData.feeds.unshift({ feedName, feedDescription });
    watchedState.rssData.posts.push(...posts);
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
    requestData(getProxyUrl(url)).then((response) => {
      const { posts } = parseXml(response);
      const newPosts = getNewPosts(posts, lastUpdate);
      watchedState.rssData.posts.push(...newPosts);
      watchedState.rssData.url[url] = Date.now();
    }).catch(() => {
      watchedState.form.processState = 'failed';
    });
  });
};

export default () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    form: {
      processState: 'filling',
      processError: null,
      valid: true,
      error: null,
    },
    rssData: {
      url: {},
      feeds: [],
      posts: [],
    },
    modal: {
      currentPostId: null,
      visitedPostsId: [],
    },
  };

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

  elements.posts.addEventListener('click', (e) => {
    const targetId = e.target.dataset.id;
    if (targetId) {
      watchedState.modal.visitedPostsId.push(targetId);
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
      watchedState.form.error = null;
      loadData(watchedState, formUrl);
    }
  });

  setTimeout(function reload() {
    refreshData(watchedState);
    setTimeout(reload, refreshDelay);
  }, refreshDelay);
};
