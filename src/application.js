import './styles.css';
import i18next from 'i18next';
import { proxy } from 'valtio/vanilla';
import initView from './view.js';
import validateRss from './validation.js';
import resources from './locales/index.js';

const createInitialState = () => ({
  form: {
    processState: 'filling',
    errorKey: null,
    successKey: null,
  },
  feeds: [],
});

const createFeed = (url) => ({ url });

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
        .then(({ url: validUrl }) => {
          state.feeds.push(createFeed(validUrl));
          state.form.processState = 'finished';
          state.form.errorKey = null;
          state.form.successKey = 'feedback.success';

          elements.form.reset();
          elements.input.focus();
        })
        .catch((error) => {
          state.form.processState = 'failed';
          state.form.errorKey = error.errors[0];
          state.form.successKey = null;
        });
    });
  });
};

runApp();