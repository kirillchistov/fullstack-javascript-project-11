import './styles.css';
import { proxy } from 'valtio/vanilla';
import initView from './view.js';
import validateRss from './validation.js';

const createInitialState = () => ({
  form: {
    processState: 'filling',
    error: null,
    successMessage: null,
  },
  feeds: [],
});

const createFeed = (url) => ({ url });

const runApp = () => {
  const state = proxy(createInitialState());

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url'),
    submit: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
  };

  initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(elements.form);
    const url = formData.get('url').trim();
    const existingUrls = state.feeds.map((feed) => feed.url);

    state.form.processState = 'sending';
    state.form.error = null;
    state.form.successMessage = null;

    validateRss(url, existingUrls)
      .then(({ url: validUrl }) => {
        state.feeds.push(createFeed(validUrl));
        state.form.processState = 'finished';
        state.form.error = null;
        state.form.successMessage = 'RSS успешно загружен';

        elements.form.reset();
        elements.input.focus();
      })
      .catch((error) => {
        state.form.processState = 'failed';
        state.form.error = error.errors[0];
        state.form.successMessage = null;
      });
  });
};

runApp();