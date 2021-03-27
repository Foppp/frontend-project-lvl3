/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import i18next from 'i18next';

// const readedPostId = [];

const setAttributes = (element, values) => Object.keys(values)
  .forEach((attribute) => {
    element.setAttribute(attribute, values[attribute]);
  });
const openModal = (content, elements) => {
  // const modalTitle = document.querySelector('.modal-title');
  // const modalBody = document.querySelector('.modal-body');
  const closeButton = document.querySelector('.btn-secondary');
  const readMoreButton = document.querySelector('.full-article');
  const element = document.querySelector(`[data-id="${content.id}"]`);
  readMoreButton.setAttribute('href', content.link);
  elements.modalTitle.textContent = content.title;
  elements.modalBody.textContent = content.description;
  closeButton.textContent = i18next.t('buttons.modalWindow.close');
  readMoreButton.textContent = i18next.t('buttons.modalWindow.readMore');
  element.classList.remove('font-weight-bold');
  element.classList.add('font-weight-normal');
};

const renderFeeds = (feedsData, elements) => {
  const mainFeedsTitle = document.createElement('h2');
  const feedsGroup = document.createElement('ul');
  feedsGroup.setAttribute('class', 'list-group');
  feedsGroup.classList.add('mb-5');
  mainFeedsTitle.textContent = i18next.t('feeds');
  feedsData.forEach(({ feedName, feedDescription }) => {
    const listItem = document.createElement('li');
    listItem.setAttribute('class', 'list-group-item');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    title.textContent = feedName;
    description.textContent = feedDescription;
    listItem.appendChild(title);
    listItem.appendChild(description);
    feedsGroup.appendChild(listItem);
  });
  elements.feeds.innerHTML = '';
  elements.feeds.appendChild(mainFeedsTitle);
  elements.feeds.appendChild(feedsGroup);
};

const renderPosts = (postsData, state, elements) => {
  const mainPostsTitle = document.createElement('h2');
  const listGroup = document.createElement('ul');
  listGroup.setAttribute('class', 'list-group');
  mainPostsTitle.textContent = i18next.t('posts');
  postsData.forEach(({ id, title, link }) => {
    const listItem = document.createElement('li');
    const linkElement = document.createElement('a');
    const previewButton = document.createElement('button');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    previewButton.classList.add('btn', 'btn-primary', 'btn-sm');
    const font = !state.readedPostId.includes(id) ? 'font-weight-bold' : 'font-weight-normal';
    const linkAttributes = {
      href: link, class: font, 'data-id': id, target: '_blank', rel: 'noopener noreferrer',
    };
    const buttonAttributes = {
      type: 'button', 'data-id': id, 'data-toggle': 'modal', 'data-target': '#modal',
    };
    setAttributes(linkElement, linkAttributes);
    setAttributes(previewButton, buttonAttributes);
    linkElement.textContent = title;
    previewButton.textContent = i18next.t('buttons.preview');
    listItem.appendChild(linkElement);
    listItem.appendChild(previewButton);
    listGroup.prepend(listItem);
  });
  elements.posts.innerHTML = '';
  elements.posts.appendChild(mainPostsTitle);
  elements.posts.appendChild(listGroup);

  const modalOpenButtons = document.querySelectorAll('[data-toggle="modal"]');

  modalOpenButtons.forEach((openBtn) => {
    openBtn.addEventListener('click', (e) => {
      const targetId = e.target.dataset.id;
      const [modalContent] = state.rssData.posts.filter((el) => el.id === targetId);
      state.readedPostId.push(targetId);
      openModal(modalContent, elements);
    });
  });
};

const processStateHandler = (processState, elements) => {
  switch (processState) {
    case 'filling':
      elements.submitButton.disabled = false;
      elements.input.readOnly = false;
      break;
    case 'sending':
      elements.submitButton.disabled = true;
      elements.input.readOnly = true;
      break;
    case 'failed':
      elements.submitButton.disabled = false;
      elements.input.readOnly = false;
      break;
    case 'finished':
      elements.submitButton.disabled = false;
      elements.input.readOnly = false;
      elements.feedback.removeAttribute('class');
      elements.feedback.classList.add('feedback', 'text-success');
      elements.input.classList.remove('is-invalid');
      elements.feedback.textContent = i18next.t('loadSuccess');
      elements.form.reset();
      elements.input.focus();
      break;
    default:
      throw new Error(`Uknown state ${processState}`);
  }
};

const renderError = (error, elements) => {
  elements.feedback.removeAttribute('class');
  elements.feedback.classList.add('feedback', 'text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = error;
};

const initView = (state, elements) => {
  const mapping = {
    'form.processState': (value) => processStateHandler(value, elements),
    'form.error': (value) => renderError(value, elements),
    'form.processError': (value) => renderError(value, elements),
    'rssData.feeds': (value) => renderFeeds(value, elements),
    'rssData.posts': (value) => renderPosts(value, state, elements),
  };

  const watchedState = onChange(state, (path, value) => {
    if (mapping[path]) {
      mapping[path](value);
    }
  });
  return watchedState;
};

export default initView;
