import onChange from 'on-change';
import i18next from 'i18next';

const body = document.querySelector('body');
const modalWindow = document.querySelector('.modal');
const submitButton = document.querySelector('[aria-label="add"]');
const input = document.querySelector('[aria-label="url"]');
const feedback = document.querySelector('.feedback');
const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');
const form = document.querySelector('form');
const footer = document.querySelector('footer');

const openModal = (element, post) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const closeButton = document.querySelector('.btn-secondary');
  const readMoreButton = document.querySelector('.full-article');
  readMoreButton.setAttribute('href', post.link);
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  closeButton.textContent = i18next.t('buttons.modalWindow.close');
  readMoreButton.textContent = i18next.t('buttons.modalWindow.readMore');
  body.classList.add('modal-open');
  const modalBackDrop = document.createElement('div');
  modalBackDrop.setAttribute('class', 'modal-backdrop');
  modalBackDrop.classList.add('fade', 'show');
  footer.after(modalBackDrop);
  element.removeAttribute('aria-hidden');
  element.setAttribute('aria-modal', 'true');
  element.setAttribute('style', 'display: block;');
  element.classList.add('show');
};

const closeModal = (element) => {
  element.classList.remove('show');
  element.setAttribute('style', 'display: none;');
  element.setAttribute('aria-hidden', 'true');
  element.removeAttribute('aria-modal');
  const modalBackDrop = document.querySelector('.modal-backdrop');
  if (modalBackDrop) {
    modalBackDrop.remove();
  }
};

const renderFeeds = (feedsData) => {
  const h2 = document.createElement('h2');
  const ul = document.createElement('ul');
  ul.setAttribute('class', 'list-group');
  ul.classList.add('mb-5');
  h2.textContent = i18next.t('feeds');
  feedsData.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.setAttribute('class', 'list-group-item');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    h3.textContent = title;
    p.textContent = description;
    li.appendChild(h3);
    li.appendChild(p);
    ul.appendChild(li);
  });
  feeds.innerHTML = '';
  feeds.appendChild(h2);
  feeds.appendChild(ul);
};

const renderPosts = (postsData, state) => {
  const h2 = document.createElement('h2');
  const ul = document.createElement('ul');
  ul.setAttribute('class', 'list-group');
  h2.textContent = i18next.t('posts');
  postsData.forEach(({ id, title, link }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const button = document.createElement('button');
    li.setAttribute('class', 'list-group-item');
    li.classList.add('d-flex', 'justify-content-between', 'align-items-start');
    a.setAttribute('href', link);
    a.setAttribute('class', 'font-weight-bold');
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn');
    button.classList.add('btn-primary', 'btn-sm');
    button.setAttribute('data-id', id);
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', '#modal');
    button.textContent = i18next.t('buttons.preview');
    li.appendChild(a);
    li.appendChild(button);
    ul.prepend(li);
  });
  posts.innerHTML = '';
  posts.appendChild(h2);
  posts.appendChild(ul);

  const modalOpenButtons = document.querySelectorAll('[data-toggle="modal"]');
  const modalCloseButtons = document.querySelectorAll('[data-dismiss="modal"]');

  modalOpenButtons.forEach((openBtn) => {
    openBtn.addEventListener('click', (e) => {
      const targetId = e.target.dataset.id;
      const [modalContent] = state.rssData.posts.filter((el) => el.id === Number(targetId));
      openModal(modalWindow, modalContent);
    });
  });

  modalCloseButtons.forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => closeModal(modalWindow));
  });
};

const processStateHandler = (processState) => {
  switch (processState) {
    case 'filling':
      submitButton.disabled = false;
      input.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      input.disabled = true;
      break;
    case 'failed':
      submitButton.disabled = false;
      input.disabled = false;
      break;
    case 'finished':
      submitButton.disabled = false;
      input.disabled = false;
      feedback.removeAttribute('class');
      feedback.classList.add('feedback', 'text-success');
      input.classList.remove('is-invalid');
      feedback.textContent = i18next.t('loadSuccess');
      form.reset();
      input.focus();
      break;
    default:
      throw new Error(`Uknown state ${processState}`);
  }
};
const renderError = (error) => {
  feedback.removeAttribute('class');
  feedback.classList.add('feedback', 'text-danger');
  input.classList.add('is-invalid');
  feedback.textContent = error;
};

const initView = (state) => {
  const mapping = {
    'form.processState': (value) => processStateHandler(value),
    'form.error': (value) => renderError(value),
    'form.processError': (value) => renderError(value),
    'rssData.feeds': (value) => renderFeeds(value),
    'rssData.posts': (value) => renderPosts(value, state),
  };
  const watchedState = onChange(state, (path, value) => {
    if (mapping[path]) {
      mapping[path](value);
    }
  });
  return watchedState;
};

export default initView;
