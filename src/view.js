/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import i18next from 'i18next';

const setAttributes = (element, values) => Object.keys(values)
  .forEach((attribute) => {
    element.setAttribute(attribute, values[attribute]);
  });

const openModal = (state, elements) => {
  const [modalContent] = state.rssData.posts.filter((el) => el.id === state.modal.currentPostId);
  const closeButton = document.querySelector('.btn-secondary');
  const readMoreButton = document.querySelector('.full-article');
  readMoreButton.setAttribute('href', modalContent.link);
  elements.modalTitle.textContent = modalContent.title;
  elements.modalBody.textContent = modalContent.description;
  closeButton.textContent = i18next.t('buttons.modalWindow.close');
  readMoreButton.textContent = i18next.t('buttons.modalWindow.readMore');
};

const renderFeeds = (state, elements) => {
  const mainFeedsTitle = document.createElement('h2');
  const feedsGroup = document.createElement('ul');
  feedsGroup.setAttribute('class', 'list-group');
  feedsGroup.classList.add('mb-5');
  mainFeedsTitle.textContent = i18next.t('feeds');
  state.rssData.feeds.forEach(({ feedName, feedDescription }) => {
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

const renderPosts = (state, elements) => {
  const mainPostsTitle = document.createElement('h2');
  const listGroup = document.createElement('ul');
  listGroup.setAttribute('class', 'list-group');
  mainPostsTitle.textContent = i18next.t('posts');
  state.rssData.posts.forEach(({ id, title, link }) => {
    const listItem = document.createElement('li');
    const linkElement = document.createElement('a');
    const previewButton = document.createElement('button');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    previewButton.classList.add('btn', 'btn-primary', 'btn-sm');
    const font = !state.modal.visitedPostsId.includes(id) ? 'font-weight-bold' : 'font-weight-normal';
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
};

const processStateHandler = (state, elements) => {
  switch (state.form.processState) {
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
      throw new Error(`Uknown state ${state.form.processState}`);
  }
};

const renderError = (state, elements) => {
  elements.feedback.removeAttribute('class');
  elements.feedback.classList.add('feedback', 'text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = state.form.error;
};

const initView = (state, elements) => {
  const mapping = {
    'form.processState': () => processStateHandler(state, elements),
    'form.error': () => renderError(state, elements),
    'rssData.feeds': () => renderFeeds(state, elements),
    'rssData.posts': () => renderPosts(state, elements),
    'modal.currentPostId': () => {
      openModal(state, elements);
      renderPosts(state, elements);
    },
  };

  const watchedState = onChange(state, (path, value) => {
    if (mapping[path]) {
      mapping[path](value);
    }
  });
  return watchedState;
};

export default initView;
