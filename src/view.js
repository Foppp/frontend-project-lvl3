import onChange from 'on-change';
import i18next from 'i18next';

const readedPostId = [];

const initView = (state) => {
  const submitButton = document.querySelector('[aria-label="add"]');
  const input = document.querySelector('[aria-label="url"]');
  const feedback = document.querySelector('.feedback');
  const form = document.querySelector('form');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');

  const openModal = (content) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const closeButton = document.querySelector('.btn-secondary');
    const readMoreButton = document.querySelector('.full-article');
    const element = document.querySelector(`[data-id="${content.id}"]`);
    readMoreButton.setAttribute('href', content.link);
    modalTitle.textContent = content.title;
    modalBody.textContent = content.description;
    closeButton.textContent = i18next.t('buttons.modalWindow.close');
    readMoreButton.textContent = i18next.t('buttons.modalWindow.readMore');
    element.classList.remove('font-weight-bold');
    element.classList.add('font-weight-normal');
  };

  const renderFeeds = (feedsData) => {
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
    feeds.innerHTML = '';
    feeds.appendChild(mainFeedsTitle);
    feeds.appendChild(feedsGroup);
  };

  const renderPosts = (postsData) => {
    const mainPostsTitle = document.createElement('h2');
    const listGroup = document.createElement('ul');
    listGroup.setAttribute('class', 'list-group');
    mainPostsTitle.textContent = i18next.t('posts');
    postsData.forEach(({ id, title, link }) => {
      const listItem = document.createElement('li');
      const linkElement = document.createElement('a');
      const previewButton = document.createElement('button');
      listItem.setAttribute('class', 'list-group-item');
      listItem.classList.add('d-flex', 'justify-content-between', 'align-items-start');
      linkElement.setAttribute('href', link);
      const font = !readedPostId.includes(id) ? 'font-weight-bold' : 'font-weight-normal';
      linkElement.setAttribute('class', font);
      linkElement.setAttribute('data-id', id);
      linkElement.setAttribute('target', '_blank');
      linkElement.setAttribute('rel', 'noopener noreferrer');
      linkElement.textContent = title;
      previewButton.setAttribute('type', 'button');
      previewButton.setAttribute('class', 'btn');
      previewButton.classList.add('btn-primary', 'btn-sm');
      previewButton.setAttribute('data-id', id);
      previewButton.setAttribute('data-toggle', 'modal');
      previewButton.setAttribute('data-target', '#modal');
      previewButton.textContent = i18next.t('buttons.preview');
      listItem.appendChild(linkElement);
      listItem.appendChild(previewButton);
      listGroup.prepend(listItem);
    });
    posts.innerHTML = '';
    posts.appendChild(mainPostsTitle);
    posts.appendChild(listGroup);

    const modalOpenButtons = document.querySelectorAll('[data-toggle="modal"]');

    modalOpenButtons.forEach((openBtn) => {
      openBtn.addEventListener('click', (e) => {
        const targetId = Number(e.target.dataset.id);
        const [modalContent] = state.rssData.posts.filter((el) => el.id === targetId);
        readedPostId.push(targetId);
        openModal(modalContent);
      });
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
