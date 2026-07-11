import './styles.css';
import i18next from 'i18next';
import { proxy } from 'valtio/vanilla';
import initView from './view.js';
import validateRss, { errorKeys } from './validation.js';
import resources from './locales/index.js';
import fetchRss from './api.js';
import parseRss from './parser.js';

let nextId = 1;
const generateId = () => String(nextId++);

const createInitialState = () => ({
  form: {
    processState: 'filling',
    errorKey: null,
    successKey: null,
  },
  feeds: [],
  posts: [],
});

const initI18n = () => {
  const instance = i18next.createInstance();

  return instance.init({
    lng: 'ru',
    fallbackLng: 'ru',
    debug: false,
    resources,
  }).then(() => instance);
};

const runApp = () => {
  const state = proxy(createInitialState());

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url'),
    submit: document.querySelector('[type="submit"]'),
    submitText: document.querySelector('.btn-text'),
    feedback: document.querySelector('.feedback'),
    title: document.querySelector('[data-i18n="title"]'),
    description: document.querySelector('[data-i18n="description"]'),
    label: document.querySelector('[data-i18n="form.label"]'),
    hint: document.querySelector('[data-i18n="form.example"]'),
    footerPrefix: document.querySelector('[data-i18n="footer.createdBy"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  initI18n().then((i18n) => {
    initView(state, elements, i18n);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(elements.form);
      const url = formData.get('url').trim();
      const existingUrls = state.feeds.map((feed) => feed.url);

      state.form.processState = 'sending';
      state.form.errorKey = null;
      state.form.successKey = null;

      validateRss(url, existingUrls)
        .then(() => fetchRss(url))
        .then((response) => {
          const { feed, posts } = parseRss(response.data.contents);

          const feedId = generateId();
          const preparedFeed = {
            id: feedId,
            url,
            title: feed.title,
            description: feed.description,
          };

          const preparedPosts = posts.map((post) => ({
            id: generateId(),
            feedId,
            title: post.title,
            description: post.description,
            link: post.link,
          }));

          state.feeds.unshift(preparedFeed);
          state.posts.unshift(...preparedPosts);

          state.form.processState = 'finished';
          state.form.errorKey = null;
          state.form.successKey = 'feedback.success';

          elements.form.reset();
          elements.input.focus();
        })
        .catch((error) => {
          state.form.processState = 'failed';
          state.form.successKey = null;

          if (error.errors) {
            state.form.errorKey = error.errors[0];
            return;
          }

          if (error.message === errorKeys.parse) {
            state.form.errorKey = errorKeys.parse;
            return;
          }

          state.form.errorKey = errorKeys.network;
        });
    });
  });
};

runApp();