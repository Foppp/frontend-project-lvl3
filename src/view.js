/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const setAttributes = (element, values) => Object.keys(values)
  .forEach((attribute) => {
    element.setAttribute(attribute, values[attribute]);
  });

const openModal = (state, elements, translate) => {
  const [modalContent] = state.rssData.posts.filter((el) => el.id === state.modal.currentPostId);
  const closeButton = document.querySelector('.btn-secondary');
  const readMoreButton = document.querySelector('.full-article');
  readMoreButton.setAttribute('href', modalContent.link);
  elements.modalTitle.textContent = modalContent.title;
  elements.modalBody.textContent = modalContent.description;
  closeButton.textContent = translate.t('buttons.modalWindow.close');
  readMoreButton.textContent = translate.t('buttons.modalWindow.readMore');
};

const renderFeeds = (state, elements, translate) => {
  const mainFeedsTitle = document.createElement('h2');
  const feedsGroup = document.createElement('ul');
  feedsGroup.setAttribute('class', 'list-group');
  feedsGroup.classList.add('mb-5');
  mainFeedsTitle.textContent = translate.t('feeds');
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

const renderPosts = (state, elements, translate) => {
  const mainPostsTitle = document.createElement('h2');
  const listGroup = document.createElement('ul');
  listGroup.setAttribute('class', 'list-group');
  mainPostsTitle.textContent = translate.t('posts');
  state.rssData.posts.forEach(({ id, title, link }) => {
    const listItem = document.createElement('li');
    const linkElement = document.createElement('a');
    const previewButton = document.createElement('button');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    previewButton.classList.add('btn', 'btn-primary', 'btn-sm');
    const font = !state.visitedPostsId.has(id) ? 'font-weight-bold' : 'font-weight-normal';
    const linkAttributes = {
      href: link, class: font, 'data-id': id, target: '_blank', rel: 'noopener noreferrer',
    };
    const buttonAttributes = {
      type: 'button', 'data-id': id, 'data-toggle': 'modal', 'data-target': '#modal',
    };
    setAttributes(linkElement, linkAttributes);
    setAttributes(previewButton, buttonAttributes);
    linkElement.textContent = title;
    previewButton.textContent = translate.t('buttons.preview');
    listItem.appendChild(linkElement);
    listItem.appendChild(previewButton);
    listGroup.prepend(listItem);
  });
  elements.posts.innerHTML = '';
  elements.posts.appendChild(mainPostsTitle);
  elements.posts.appendChild(listGroup);
};

const processStateHandler = (state, elements, translate) => {
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
      elements.feedback.textContent = translate.t('loadSuccess');
      elements.form.reset();
      elements.input.focus();
      break;
    default:
      throw new Error(`Uknown state ${state.form.processState}`);
  }
};

const renderError = (state, elements, translate) => {
  console.log(state.form.error);
  elements.feedback.removeAttribute('class');
  elements.feedback.classList.add('feedback', 'text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = translate.t(`errors.${state.form.error}`);
};

const initView = (state, elements, translate) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(state, elements, translate);
        break;
      case 'form.error':
        renderError(state, elements, translate);
        break;
      case 'rssData.feeds':
        renderFeeds(state, elements, translate);
        break;
      case 'rssData.posts':
        renderPosts(state, elements, translate);
        break;
      case 'modal.currentPostId':
        openModal(state, elements, translate);
        renderPosts(state, elements, translate);
        break;
      default:
        break;
    }
  });
  return watchedState;
};

export default initView;
