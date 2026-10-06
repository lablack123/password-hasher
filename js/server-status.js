/**
 * Live check that the PHP endpoint answers, so a developer learns the backend
 * is down before typing a password into it.
 */

import { select, setText } from './dom.js';
import { fetchCapabilities } from './api.js';

const OFFLINE_SUMMARY =
  'Servidor PHP sem resposta. Abra o projeto pelo Apache ou por "php -S".';
const OFFLINE_CHIP = 'PHP offline';

export function createServerStatus() {
  const footer = select('#server-status');
  const summary = select('#server-summary');
  const chip = select('#php-chip');
  const chipLabel = select('[data-role="chip-label"]', chip);
  const controller = new AbortController();

  /**
   * @returns {Promise<string[]|null>} the algorithms the server can produce
   */
  async function refresh() {
    try {
      const capabilities = await fetchCapabilities({ signal: controller.signal });

      footer.dataset.server = 'online';
      setText(summary, describeAlgorithms(capabilities.algorithms));
      setText(chipLabel, capabilities.phpVersion ? `PHP ${capabilities.phpVersion}` : 'PHP');

      return capabilities.algorithms;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null;

      footer.dataset.server = 'offline';
      setText(summary, OFFLINE_SUMMARY);
      setText(chipLabel, OFFLINE_CHIP);

      return null;
    }
  }

  return {
    refresh,
    dispose: () => controller.abort(),
  };
}

/**
 * @param {string[]} algorithms
 * @returns {string}
 */
function describeAlgorithms(algorithms) {
  if (algorithms.length === 0) return 'Nenhum algoritmo de hash disponível';

  if (algorithms.length === 1) return `${algorithms[0]} disponível`;

  const head = algorithms.slice(0, -1).join(', ');
  return `${head} e ${algorithms.at(-1)} disponíveis`;
}
