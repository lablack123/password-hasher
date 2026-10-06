/**
 * Owns the result panel and its four states: empty, loading, error, result.
 */

import { replayAnimation, select, selectText, setHidden, setText } from './dom.js';
import { alertIcon, checkIcon, cloudIcon } from './icons.js';
import { copyText } from './clipboard.js';

const STATE_NAMES = ['empty', 'loading', 'error', 'result'];
const COPIED_MESSAGE = 'Copiado!';
const COPY_LABEL = 'Copiar hash';
const COPY_FAILED_MESSAGE = 'Selecione e copie';
const COPY_RESET_DELAY = 2000;

export function createResultView() {
  const card = select('#result-card');

  const states = {
    empty: select('#state-empty'),
    loading: select('#state-loading'),
    error: select('#state-error'),
    result: select('#state-result'),
  };

  const emptyIcon = select('#state-empty-icon');
  const errorIcon = select('#state-error-icon');
  const badge = select('#result-badge');
  const hashOutput = select('#hash-output');
  const metaList = select('#meta-list');
  const warning = select('#result-warning');
  const errorText = select('#error-text');
  const verifyPill = select('#verify-pill');
  const copyButton = select('#copy-hash');
  const copyLabel = select('[data-role="copy-label"]', copyButton);

  emptyIcon.appendChild(cloudIcon(28));
  errorIcon.appendChild(alertIcon(28));
  verifyPill.prepend(checkIcon(14));

  /** @type {string} */
  let currentHash = '';
  /** @type {number} */
  let copyResetTimer = 0;

  copyButton.addEventListener('click', () => {
    void handleCopy();
  });

  /**
   * @param {'empty'|'loading'|'error'|'result'} name
   */
  function show(name) {
    STATE_NAMES.forEach((key) => {
      setHidden(states[key], key !== name);
    });

    card.setAttribute('data-state', name);
  }

  function showEmpty() {
    currentHash = '';
    show('empty');
  }

  function showLoading() {
    resetCopyLabel();
    show('loading');
  }

  /**
   * @param {string} message
   */
  function showError(message) {
    setText(errorText, message);
    resetCopyLabel();
    show('error');
  }

  /**
   * @param {import('./api.js').HashResult} result
   */
  function showResult(result) {
    currentHash = result.hash;

    setText(badge, result.algorithmLabel);
    setText(hashOutput, result.hash);
    metaList.replaceChildren(...buildMeta(result));
    setHidden(warning, !result.truncated);
    setHidden(verifyPill, !result.verified);

    resetCopyLabel();
    show('result');
    replayAnimation(states.result);
  }

  return { showEmpty, showLoading, showError, showResult };

  /**
   * @param {import('./api.js').HashResult} result
   * @returns {HTMLLIElement[]}
   */
  function buildMeta(result) {
    return [
      metaItem('Algoritmo', result.algorithmLabel),
      metaItem('Comprimento', `${result.length} caracteres`),
      ...costItems(result),
    ];
  }

  /**
   * @param {import('./api.js').HashResult} result
   * @returns {HTMLLIElement[]}
   */
  function costItems(result) {
    const items = [];

    if (result.cost !== null) items.push(metaItem('Custo', String(result.cost)));
    if (result.timeCost !== null) items.push(metaItem('Iterações', String(result.timeCost)));
    if (result.memoryCost !== null) items.push(metaItem('Memória', formatMemory(result.memoryCost)));
    if (result.threads !== null) items.push(metaItem('Threads', String(result.threads)));

    return items;
  }

  /**
   * @param {string} key
   * @param {string} value
   * @returns {HTMLLIElement}
   */
  function metaItem(key, value) {
    const item = document.createElement('li');
    item.className = 'meta__item';

    const keySpan = document.createElement('span');
    keySpan.className = 'meta__key';
    setText(keySpan, key);

    const valueSpan = document.createElement('span');
    valueSpan.className = 'meta__value';
    setText(valueSpan, value);

    item.append(keySpan, valueSpan);
    return item;
  }

  async function handleCopy() {
    if (currentHash === '') return;

    const copied = await copyText(currentHash);

    if (!copied) selectText(hashOutput);

    setText(copyLabel, copied ? COPIED_MESSAGE : COPY_FAILED_MESSAGE);

    window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(resetCopyLabel, COPY_RESET_DELAY);
  }

  function resetCopyLabel() {
    window.clearTimeout(copyResetTimer);
    setText(copyLabel, COPY_LABEL);
  }
}

/**
 * @param {number} kibibytes
 * @returns {string}
 */
function formatMemory(kibibytes) {
  if (kibibytes >= 1024 && kibibytes % 1024 === 0) {
    return `${kibibytes / 1024} MiB`;
  }

  return `${kibibytes} KiB`;
}
