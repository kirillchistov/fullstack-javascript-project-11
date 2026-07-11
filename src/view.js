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
};

const renderFormState = (state, elements, i18n) => {
  const { form } = snapshot(state);

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

const render = (state, elements, i18n) => {
  renderTexts(elements, i18n);
  renderFormState(state, elements, i18n);
};

export default (state, elements, i18n) => {
  subscribe(state, () => render(state, elements, i18n));
  render(state, elements, i18n);
};