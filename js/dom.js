/**
 * Tiny DOM helpers shared by the app modules.
 */

/**
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {T}
 */
export function select(selector, scope = document) {
  const element = scope.querySelector(selector);

  if (!element) {
    throw new Error(`Elemento não encontrado: ${selector}`);
  }

  return /** @type {T} */ (element);
}

/**
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {T[]}
 */
export function selectAll(selector, scope = document) {
  return /** @type {T[]} */ (Array.from(scope.querySelectorAll(selector)));
}

/**
 * @param {HTMLElement} element
 * @param {boolean} hidden
 */
export function setHidden(element, hidden) {
  element.hidden = hidden;
}

/**
 * @param {HTMLElement} element
 * @param {string} text
 */
export function setText(element, text) {
  element.textContent = text;
}

/**
 * Restarts a CSS animation that has already run once, so state changes
 * (a new hash arriving, a rejected submit) feel like a fresh beat.
 *
 * @param {HTMLElement} element
 */
export function replayAnimation(element) {
  element.style.animation = 'none';
  void element.offsetWidth;
  element.style.animation = '';
}

/**
 * @param {HTMLElement} element
 */
export function selectText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();

  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}
