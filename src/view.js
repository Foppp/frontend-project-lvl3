import onChange from 'on-change';

// const render = (xml) => {
//   const channelTitle = xml.querySelector('channel > title');
//   const channelDescription = xml.querySelector('channel > description');
//   console.log(channelTitle.textContent);
//   console.log(channelDescription.innerText);
// };
const initView = (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.fields.url') {
      console.log(value);
    }
    if (path === 'form.errors') {
      console.log(value);
    }
    if (path === 'rssUrl') {
      console.log(value);
    }
    if (path === 'rssData.posts') {
      console.log(value);
    }
    if (path === 'rssData.feeds') {
      console.log(value);
    }
  });
  return watchedState;
};

export default initView;
