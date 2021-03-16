/* eslint-disable object-curly-newline */
/* eslint-disable no-param-reassign */
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import initView from './view.js';

const normalizeFeedsData = (watchedState, xml) => {
  const feedTitle = xml.querySelector('channel > title');
  const feedDescription = xml.querySelector('channel > description');
  const title = feedTitle.textContent;
  const description = feedDescription.textContent;
  const feed = { title, description };
  watchedState.rssData.feeds.unshift(feed);
};

const normalizePostsData = (watchedState, xml, currentTime = null) => {
  const collectedPosts = [];
  const items = xml.querySelectorAll('channel > item');
  items.forEach((item) => {
    watchedState.rssData.postsCountId += 1;
    const id = watchedState.rssData.postsCountId;
    const postTitle = item.querySelector('title');
    const postDescription = item.querySelector('description');
    const postLink = item.querySelector('link');
    const pubDate = item.querySelector('pubDate');
    const date = pubDate.textContent;
    const title = postTitle.textContent;
    const description = postDescription.textContent;
    const link = postLink.textContent;
    const post = { id, date, title, description, link };
    if (currentTime) {
      if (Date.parse(date) > currentTime) {
        collectedPosts.unshift(post);
      }
    } else {
      collectedPosts.unshift(post);
    }
  });
  watchedState.rssData.posts.push(...collectedPosts);
};

const encodeUrl = (url) => {
  const hook = 'https://hexlet-allorigins.herokuapp.com/get';
  const queryParams = `disableCache=true&url=${encodeURIComponent(url)}`;
  return `${hook}?${queryParams}`;
};

const parseXml = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xml');
};

const requestData = (url) => axios.get(url)
  .then((response) => response.data.contents);

const loadXml = (watchedState, url) => {
  const encodedUrl = encodeUrl(url);
  requestData(encodedUrl).then((data) => {
    const xmlDoc = parseXml(data);
    const parsererror = xmlDoc.querySelector('parsererror');
    if (parsererror) {
      throw new Error(i18next.t('errors.xml'));
    }
    watchedState.form.processError = null;
    watchedState.form.processState = 'finished';
    watchedState.rssData.url[url] = Date.now();
    normalizeFeedsData(watchedState, xmlDoc);
    normalizePostsData(watchedState, xmlDoc);
  }).catch((err) => {
    if (err.request) {
      watchedState.form.processError = i18next.t('errors.network');
    } else {
      watchedState.form.processError = err.message;
    }
    watchedState.form.processState = 'failed';
  });
};

export default () => {
  const refreshDelay = 5000;
  const defaultLanguage = 'en';

  i18next.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const state = {
    currentLanguage: 'en',
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
      postsCountId: 0,
    },
  };

  const form = document.querySelector('form');
  const input = document.querySelector('input');

  const watchedState = initView(state);

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
      loadXml(watchedState, formUrl);
    }
  });

  const timerId = setTimeout(function reloadXml() {
    const urlList = watchedState.rssData.url;
    if (urlList.length === 0) {
      clearTimeout(timerId);
    }
    Object.entries(urlList).forEach(([url, loadTime]) => {
      const encodedUrl = encodeUrl(url);
      requestData(encodedUrl).then((data) => {
        const xmlDoc = parseXml(data);
        normalizePostsData(watchedState, xmlDoc, loadTime);
        watchedState.rssData.url[url] = Date.now();
      }).catch(() => {
        watchedState.form.processState = 'failed';
      });
    });
    setTimeout(reloadXml, refreshDelay);
  }, refreshDelay);
};
