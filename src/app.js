/* eslint-disable no-param-reassign */
import 'bootstrap';

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales';
import initView from './view.js';
import parseXml from './parser.js';

const refreshDelay = 5000;

const getProxyUrl = (url) => {
  const corsProxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  corsProxyUrl.searchParams.set('disableCache', 'true');
  corsProxyUrl.searchParams.set('url', url);
  return corsProxyUrl.toString();
};

const requestData = (url) => axios.get(url)
  .then((response) => response.data.contents);

const getNewPosts = (oldPosts, newPosts) => _.differenceBy(newPosts, oldPosts, 'title');

const makeId = (posts) => posts.map((post) => ({ id: _.uniqueId(), ...post }));

const loadData = (watchedState, url) => {
  requestData(getProxyUrl(url)).then((response) => {
    const { feedName, feedDescription, posts } = parseXml(response);
    watchedState.rssData.feeds.unshift({
      url, feedName, feedDescription,
    });
    watchedState.rssData.posts.push(...makeId(posts));
    watchedState.form.error = null;
    watchedState.form.processState = 'finished';
  }).catch((err) => {
    if (err.request) {
      watchedState.form.error = 'network';
    } else if (err.isParserError) {
      watchedState.form.error = err.message;
    } else {
      watchedState.form.error = 'unknown';
    }
    watchedState.form.processState = 'failed';
  });
};

const refreshData = (watchedState) => {
  const feedsList = watchedState.rssData.feeds;
  feedsList.forEach(({ url }) => {
    requestData(getProxyUrl(url)).then((response) => {
      const { posts } = parseXml(response);
      const newPosts = getNewPosts(watchedState.rssData.posts, posts);
      watchedState.rssData.posts.push(...makeId(newPosts));
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

  const newInstance = i18next.createInstance();
  newInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'url',
      },
      mixed: {
        notOneOf: 'doubleUrl',
      },
    });

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
  });

  return newInstance;
};
