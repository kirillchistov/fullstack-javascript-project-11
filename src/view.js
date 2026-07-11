import { subscribe, snapshot } from 'valtio/vanilla';

const render = (state, elements) => {
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

  if (form.error) {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('invalid-feedback', 'd-block');
    elements.feedback.textContent = form.error;
  }

  if (form.successMessage) {
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = form.successMessage;
  }
};

export default (state, elements) => {
  subscribe(state, () => render(state, elements));
  render(state, elements);
};