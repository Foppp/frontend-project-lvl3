import _ from 'lodash';

export default (data) => {
  const posts = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');
  const parsererror = xmlDoc.querySelector('parsererror');
  if (parsererror) {
    throw new Error('xml');
  }
  const feedName = xmlDoc.querySelector('channel > title').textContent;
  const feedDescription = xmlDoc.querySelector('channel > description').textContent;
  const postItems = xmlDoc.querySelectorAll('channel > item');
  postItems.forEach((post) => {
    const title = post.querySelector('title').textContent;
    const description = post.querySelector('description').textContent;
    const link = post.querySelector('link').textContent;
    const date = post.querySelector('pubDate').textContent;
    const id = _.uniqueId();
    const postData = {
      id, title, description, link, date,
    };
    posts.unshift(postData);
  });
  return { feedName, feedDescription, posts };
};
