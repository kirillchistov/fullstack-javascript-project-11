import { subscribe, snapshot } from 'valtio/vanilla';

const renderTexts = (elements, i18n) => {
  elements.title.textContent = i18n.t('title');
  elements.description.textContent = i18n.t('description');
  elements.label.textContent = i18n.t('form.label');
  elements.input.placeholder = i18n.t('form.placeholder');
  elements.input.setAttribute('aria-label', i18n.t('form.label'));
  elements.hint.textContent = i18n.t('form.example');
  elements.submitText.textContent = i18n.t('form.submit');
  elements.footerPrefix.textContent = i18n.t('footer.createdBy');
  elements.modalOpenLink.textContent = i18n.t('ui.readFull');
  elements.modalCloseButton.textContent = i18n.t('ui.close');
};

const renderFormState = (watchedState, elements, i18n) => {
  const { form } = watchedState;

  elements.input.classList.remove('is-invalid');
  elements.feedback.className = 'feedback mt-2';
  elements.feedback.textContent = '';

  if (form.processState === 'sending') {
    elements.submit.disabled = true;
    elements.input.setAttribute('readonly', true);
  } else {
    elements.submit.disabled = false;
    elements.input.removeAttribute('readonly');
  }

  if (form.errorKey) {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('invalid-feedback', 'd-block');
    elements.feedback.textContent = i18n.t(form.errorKey);
  }

  if (form.successKey) {
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = i18n.t(form.successKey);
  }
};

const createCard = (title) => {
  const card = document.createElement('div');
  card.classList.add('card', 'mb-3');

  const body = document.createElement('div');
  body.classList.add('card-body');

  const heading = document.createElement('h2');
  heading.classList.add('card-title', 'h4');
  heading.textContent = title;

  body.appendChild(heading);
  card.appendChild(body);

  return { card, body };
};

const renderFeeds = (watchedState, elements, i18n) => {
  if (!elements.feeds) {
    return;
  }

  elements.feeds.innerHTML = '';

  if (watchedState.feeds.length === 0) {
    return;
  }

  const { card, body } = createCard(i18n.t('sections.feeds'));
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  watchedState.feeds.forEach((feed) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0', 'px-0');

    const titleRow = document.createElement('div');
    titleRow.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-1', 'gap-3');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const link = document.createElement('a');
    link.href = feed.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add('small', 'text-decoration-none', 'flex-shrink-0');
    link.textContent = i18n.t('ui.source');

    titleRow.append(title, link);

    const description = document.createElement('p');
    description.classList.add('m-0', 'text-muted', 'small');
    description.textContent = feed.description;

    item.append(titleRow, description);
    list.appendChild(item);
  });

  body.appendChild(list);
  elements.feeds.appendChild(card);
};

const renderPosts = (state, watchedState, elements, i18n) => {
  if (!elements.posts) {
    return;
  }

  elements.posts.innerHTML = '';

  if (watchedState.posts.length === 0) {
    return;
  }

  const { card, body } = createCard(i18n.t('sections.posts'));
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  watchedState.posts.forEach((post) => {
    const isRead = watchedState.ui.readPostLinks.includes(post.link);

    const item = document.createElement('li');
    item.classList.add('list-group-item', 'px-0', 'py-3');

    const row = document.createElement('div');
    row.classList.add('d-flex', 'justify-content-between', 'align-items-start', 'gap-3');

    const link = document.createElement('a');
    link.href = post.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.classList.add('text-decoration-none', 'flex-grow-1');
    link.classList.add(isRead ? 'fw-normal' : 'fw-bold');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'flex-shrink-0');
    button.textContent = i18n.t('ui.preview');
    button.addEventListener('click', () => {
      state.ui.openedPostId = post.id;
    
      if (!state.ui.readPostLinks.includes(post.link)) {
        state.ui.readPostLinks.push(post.link);
      }
    
      if (typeof elements.onReadPost === 'function') {
        elements.onReadPost();
      }
    });

    row.append(link, button);
    item.appendChild(row);
    list.appendChild(item);
  });

  body.appendChild(list);
  elements.posts.appendChild(card);
};

const renderModalState = (watchedState, elements, i18n, modalInstance) => {
  const openedPostId = watchedState.ui?.openedPostId;

  if (!openedPostId) {
    return;
  }

  const currentPost = watchedState.posts.find((post) => post.id === openedPostId);

  if (!currentPost) {
    return;
  }

  elements.modalTitle.textContent = currentPost.title;
  elements.modalBody.textContent = currentPost.description;
  elements.modalOpenLink.href = currentPost.link;
  elements.modalOpenLink.textContent = i18n.t('ui.readFull');

  modalInstance.show();
};

const render = (state, elements, i18n, modalInstance) => {
  const watchedState = snapshot(state);

  renderTexts(elements, i18n);
  renderFormState(watchedState, elements, i18n);
  renderPosts(state, watchedState, elements, i18n);
  renderFeeds(watchedState, elements, i18n);
  renderModalState(watchedState, elements, i18n, modalInstance);
};

export default (state, elements, i18n, modalInstance) => {
  subscribe(state, () => render(state, elements, i18n, modalInstance));
  render(state, elements, i18n, modalInstance);
};