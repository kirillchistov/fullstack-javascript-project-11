import './styles.css';
import i18next from 'i18next';
import { proxy } from 'valtio/vanilla';
import { Modal } from 'bootstrap';
import initView from './view.js';
import validateRss, { errorKeys } from './validation.js';
import resources from './locales/index.js';
import fetchRss from './api.js';
import parseRss, { parseErrorMessage } from './parser.js';

const storageKey = 'rss-reader-state';

let nextId = 1;
const generateId = () => String(nextId++);

const loadState = () => {
  const raw = localStorage.getItem(storageKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistState = (state) => {
  const data = {
    feeds: state.feeds,
    readPostLinks: state.ui.readPostLinks,
  };

  localStorage.setItem(storageKey, JSON.stringify(data));
};

const createInitialState = () => {
  const savedState = loadState();

  return {
    form: {
      processState: 'filling',
      errorKey: null,
      successKey: null,
    },
    feeds: savedState?.feeds ?? [],
    posts: [],
    ui: {
      openedPostId: null,
      isWatcherStarted: false,
      readPostLinks: savedState?.readPostLinks ?? [],
    },
  };
};

const buildPosts = (posts, feedId) => posts.map((post) => ({
  id: generateId(),
  feedId,
  title: post.title,
  description: post.description,
  link: post.link,
}));

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
    modal: document.querySelector('#postModal'),
    modalTitle: document.querySelector('#postModalLabel'),
    modalBody: document.querySelector('#postModal .modal-body'),
    modalOpenLink: document.querySelector('#postModal .modal-open-link'),
    modalCloseButton: document.querySelector('#postModal .modal-close-button'),
  };

  elements.onReadPost = () => {
    persistState(state);
  };

  const modalInstance = new Modal(elements.modal);

  elements.modal.addEventListener('hidden.bs.modal', () => {
    state.ui.openedPostId = null;
  });

  const watchFeeds = () => {
    const currentFeeds = [...state.feeds];

    if (currentFeeds.length === 0) {
      setTimeout(watchFeeds, 5000);
      return;
    }

    const promises = currentFeeds.map((feed) => fetchRss(feed.url)
      .then((response) => {
        const { posts } = parseRss(response.data.contents);

        const existingLinks = state.posts
          .filter((post) => post.feedId === feed.id)
          .map((post) => post.link);

        const freshPosts = posts.filter((post) => !existingLinks.includes(post.link));

        if (freshPosts.length === 0) {
          return;
        }

        const preparedPosts = buildPosts(freshPosts, feed.id);
        state.posts.unshift(...preparedPosts);
      })
      .catch(() => {
      }));

    Promise.all(promises)
      .finally(() => {
        setTimeout(watchFeeds, 5000);
      });
  };

  const loadSavedFeedsPosts = () => {
    const feedRequests = state.feeds.map((feed) => fetchRss(feed.url)
      .then((response) => {
        const { posts } = parseRss(response.data.contents);
        return buildPosts(posts, feed.id);
      })
      .catch(() => []));

    Promise.all(feedRequests)
      .then((postsGroups) => {
        const allPosts = postsGroups.flat();
        state.posts = allPosts;
      });
  };

  initI18n().then((i18n) => {
    initView(state, elements, i18n, modalInstance);

    loadSavedFeedsPosts();

    if (!state.ui.isWatcherStarted) {
      state.ui.isWatcherStarted = true;
      watchFeeds();
    }

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

          const preparedPosts = buildPosts(posts, feedId);

          state.feeds.unshift(preparedFeed);
          state.posts.unshift(...preparedPosts);

          persistState(state);

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

          if (error.message === parseErrorMessage) {
            state.form.errorKey = errorKeys.parse;
            return;
          }

          state.form.errorKey = errorKeys.network;
        });
    });

    // state.ui.readPostLinks.push = new Proxy(state.ui.readPostLinks.push, {
    //   apply(target, thisArg, args) {
    //     const result = Reflect.apply(target, thisArg, args);
    //     persistState(state);
    //     return result;
    //   },
    // });
  });
};

runApp();