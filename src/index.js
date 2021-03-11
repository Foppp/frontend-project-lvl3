/* eslint-disable no-param-reassign */
// import 'jquery';
// import 'popper.js';
import 'bootstrap';
// import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import parseXml from './parser.js';
import initView from './view.js';

const collectFeeds = (watchedState, xml) => {
  const feedTitle = xml.querySelector('channel > title');
  const feedDescription = xml.querySelector('channel > description');
  const feed = {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  };
  watchedState.rssData.feeds.unshift(feed);
};
const collectPosts = (watchedState, xml, currentTime = null) => {
  const result = [];
  const items = xml.querySelectorAll('channel > item');
  items.forEach((item) => {
    watchedState.rssData.postsCountId += 1;
    const id = watchedState.rssData.postsCountId;
    const postTitle = item.querySelector('title');
    const postDescription = item.querySelector('description');
    const postLink = item.querySelector('link');
    const date = item.querySelector('pubDate');
    const publishTime = date.textContent;
    const post = {
      id,
      date: publishTime,
      title: postTitle.textContent,
      description: postDescription.textContent,
      link: postLink.textContent,
    };
    if (currentTime) {
      if (Date.parse(publishTime) > currentTime) {
        result.unshift(post);
      }
    } else {
      result.unshift(post);
    }
  });
  watchedState.rssData.posts.push(...result);
};

const reloadXml = (watchedState) => {
  const urlList = watchedState.rssData.url;
  Object.entries(urlList).forEach(([url, loadTime]) => {
    const encodedUrl = `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;
    axios(encodedUrl).then((response) => {
      const xmlDoc = parseXml(response.data.contents);
      collectPosts(watchedState, xmlDoc, loadTime);
      watchedState.rssData.url[url] = Date.now();
    }).catch(() => {});
  });
};

const loadXml = (watchedState, url) => {
  const encodedUrl = `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;
  axios(encodedUrl).then((response) => {
    const xmlDoc = parseXml(response.data.contents);
    watchedState.form.processError = null;
    watchedState.rssData.status = null;
    watchedState.form.processState = 'finished';
    collectFeeds(watchedState, xmlDoc);
    collectPosts(watchedState, xmlDoc);
    watchedState.rssData.status = 'loaded';
  }).catch((err) => {
    watchedState.form.processState = 'failed';
    watchedState.form.processError = err.message;
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
        .required()
        .url('This URL is not valid!')
        .test('is-exist', 'This URL already exist in feed!', (val) => !watchedState.rssData.url[val]),
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
      watchedState.rssData.url[formUrl] = Date.now();

      loadXml(watchedState, formUrl);
    }
  });
  setInterval(() => reloadXml(watchedState), 5000);
};

run();
