import onChange from 'on-change';

const initView = (state) => {
  const submitButton = document.querySelector('[aria-label="add"]');
  const input = document.querySelector('[aria-label="url"]');
  const feedback = document.querySelector('.feedback');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');

  const renderFeeds = (feedsData) => {
    const h2 = document.createElement('h2');
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group');
    ul.classList.add('mb-5');
    h2.textContent = 'Feeds';
    feedsData.forEach(({ title, description }) => {
      const li = document.createElement('li');
      li.setAttribute('class', 'list-group-item');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');
      h3.textContent = title;
      p.textContent = description;
      li.append(h3);
      li.append(p);
      ul.appendChild(li);
    });
    feeds.innerHTML = '';
    feeds.appendChild(h2);
    feeds.appendChild(ul);
  };
  const renderPosts = (postsData) => {
    const h2 = document.createElement('h2');
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group');
    h2.textContent = 'Posts';
    postsData.forEach(({
      id, title, description, link,
    }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const button = document.createElement('button');
      li.setAttribute('class', 'list-group-item');
      li.classList.add('d-flex', 'justify-content-between', 'align-items-start');
      a.setAttribute('href', link);
      a.setAttribute('class', 'font-weight-normal');
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
      button.textContent = 'Preview';
      li.append(a);
      li.append(button);
      ul.append(li);
    });
    posts.innerHTML = '';
    posts.append(h2);
    posts.append(ul);
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
        break;
      default:
        throw new Error(`Uknown state ${processState}`);
    }
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.processState') {
      processStateHandler(value);
    }
    if (path === 'form.error' || path === 'form.processError') {
      feedback.removeAttribute('class');
      feedback.classList.add('feedback', 'text-danger');
      feedback.textContent = value;
    }
    if (path === 'form.processSuccess') {
      if (value) {
        feedback.removeAttribute('class');
        feedback.classList.add('feedback', 'text-success');
        feedback.textContent = 'RSS was downloaded succsessfully!';
      }
    }
    if (path === 'rssData.feeds') {
      renderFeeds(value);
    }
    if (path === 'rssData.posts') {
      renderPosts(value);
    }
  });
  return watchedState;
};

export default initView;