/**
 * The generator form: algorithm picker, password field, submit flow and the
 * byte counter that warns when bcrypt is about to truncate the input.
 */

import { select, setHidden, setText } from './dom.js';
import { ApiError, generateHash } from './api.js';
import { spinnerIcon } from './icons.js';

const BCRYPT_BYTE_LIMIT = 72;
const IDLE_LABEL = 'Gerar hash';
const BUSY_LABEL = 'A gerar…';
const IDLE_HINT = 'Nada sai deste servidor.';
const EMPTY_MESSAGE = 'Escreva uma palavra-passe para continuar.';
const GENERIC_ERROR = 'Não consegui gerar o hash. Tente outra vez.';

/**
 * @typedef {object} FormElements
 * @property {HTMLFormElement} form
 * @property {HTMLElement} algorithmGroup
 * @property {HTMLElement} algorithmHint
 * @property {HTMLInputElement} passwordInput
 * @property {HTMLElement} passwordHint
 * @property {HTMLButtonElement} visibilityToggle
 * @property {HTMLElement} visibilityLabel
 * @property {HTMLButtonElement[]} submitButtons
 */

/**
 * @param {{ elements: FormElements, resultView: ReturnType<import('./result-view.js').createResultView> }} options
 */
export function createFormController({ elements, resultView }) {
  const {
    form,
    algorithmGroup,
    algorithmHint,
    passwordInput,
    passwordHint,
    visibilityToggle,
    visibilityLabel,
    submitButtons,
  } = elements;

  const options = Array.from(algorithmGroup.querySelectorAll('[data-algorithm]'));
  let selected = options.find((option) => option.getAttribute('aria-checked') === 'true') ?? options[0];

  /** @type {AbortController|null} */
  let pending = null;
  let busy = false;

  submitButtons.forEach((button) => {
    select('[data-role="submit-icon"]', button).appendChild(spinnerIcon(16));
  });

  algorithmGroup.addEventListener('click', (event) => {
    const option = event.target instanceof Element ? event.target.closest('[data-algorithm]') : null;

    if (option && options.includes(option)) selectAlgorithm(option);
  });

  algorithmGroup.addEventListener('keydown', (event) => {
    const step = stepForKey(event.key);

    if (step === null) return;

    event.preventDefault();

    const currentIndex = options.indexOf(selected);
    const nextIndex = step === 'first' ? 0
      : step === 'last' ? options.length - 1
        : (currentIndex + step + options.length) % options.length;

    selectAlgorithm(options[nextIndex], { focus: true });
  });

  visibilityToggle.addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';

    passwordInput.type = hidden ? 'text' : 'password';
    visibilityToggle.setAttribute('aria-pressed', String(hidden));
    setText(visibilityLabel, hidden ? 'Ocultar' : 'Mostrar');
    passwordInput.focus();
  });

  passwordInput.addEventListener('input', updatePasswordHint);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void run();
  });

  // The shake is removed when the animation ends rather than on a timer.
  form.addEventListener('animationend', () => {
    form.classList.remove('is-shaking');
  });

  /**
   * @param {'ArrowLeft'|'ArrowRight'|'ArrowUp'|'ArrowDown'|'Home'|'End'|string} key
   * @returns {number|'first'|'last'|null}
   */
  function stepForKey(key) {
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        return 1;
      case 'ArrowLeft':
      case 'ArrowUp':
        return -1;
      case 'Home':
        return 'first';
      case 'End':
        return 'last';
      default:
        return null;
    }
  }

  /**
   * @param {HTMLElement} option
   * @param {{ focus?: boolean }} [config]
   */
  function selectAlgorithm(option, { focus = false } = {}) {
    selected = option;

    options.forEach((item) => {
      const isSelected = item === option;

      item.setAttribute('aria-checked', String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
    });

    setText(algorithmHint, option.dataset.hint ?? '');
    updatePasswordHint();

    if (focus) option.focus();
  }

  function updatePasswordHint() {
    const value = passwordInput.value;
    const bytes = new TextEncoder().encode(value).length;

    if (value === '') {
      setText(passwordHint, IDLE_HINT);
      passwordHint.dataset.tone = 'info';
      return;
    }

    if (selected?.dataset.algorithm === 'bcrypt' && bytes > BCRYPT_BYTE_LIMIT) {
      setText(
        passwordHint,
        `${bytes} bytes — o bcrypt só lê os primeiros ${BCRYPT_BYTE_LIMIT}, o resto fica de fora.`
      );
      passwordHint.dataset.tone = 'warn';
      return;
    }

    setText(passwordHint, `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`);
    passwordHint.dataset.tone = 'info';
  }

  async function run() {
    if (busy) return;

    if (passwordInput.value.trim() === '') {
      setText(passwordHint, EMPTY_MESSAGE);
      passwordHint.dataset.tone = 'warn';
      shake();
      passwordInput.focus();
      return;
    }

    pending?.abort();

    const controller = new AbortController();
    pending = controller;

    setBusy(true);
    resultView.showLoading();

    try {
      const result = await generateHash(
        passwordInput.value,
        selected.dataset.algorithm ?? 'bcrypt',
        { signal: controller.signal }
      );

      resultView.showResult(result);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      resultView.showError(error instanceof ApiError ? error.message : GENERIC_ERROR);
      shake();
    } finally {
      if (pending === controller) {
        pending = null;
        setBusy(false);
      }
    }
  }

  /**
   * @param {boolean} value
   */
  function setBusy(value) {
    busy = value;

    submitButtons.forEach((button) => {
      button.disabled = value;
      setText(select('[data-role="submit-label"]', button), value ? BUSY_LABEL : IDLE_LABEL);
      setHidden(select('[data-role="submit-icon"]', button), !value);
    });

    form.setAttribute('aria-busy', String(value));
  }

  function shake() {
    form.classList.remove('is-shaking');
    void form.offsetWidth;
    form.classList.add('is-shaking');
  }

  return {
    init() {
      selectAlgorithm(selected);
      updatePasswordHint();

      return () => pending?.abort();
    },

    /**
     * Keeps the picker honest: never offer a digest the server cannot produce.
     * @param {string[]} available
     */
    setAvailableAlgorithms(available) {
      const supported = new Set(available);

      options.forEach((option) => {
        option.disabled = !supported.has(option.dataset.algorithm);
      });

      if (selected.disabled) {
        const fallback = options.find((option) => !option.disabled);

        if (fallback) selectAlgorithm(fallback);
      }
    },
  };
}
