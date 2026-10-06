/**
 * Talks to process.php. Every failure surfaces as an ApiError carrying a
 * message that is already safe to show the user.
 */

const ENDPOINT = 'process.php';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const OFFLINE_MESSAGE =
  'Não consegui falar com o servidor. Confirme que o PHP está a correr.';

/**
 * @typedef {object} Capabilities
 * @property {string[]} algorithms
 * @property {string} phpVersion
 */

/**
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Capabilities>}
 */
export async function fetchCapabilities({ signal } = {}) {
  const payload = await request(ENDPOINT, { signal });

  return {
    algorithms: Array.isArray(payload.algorithms) ? payload.algorithms : [],
    phpVersion: typeof payload.phpVersion === 'string' ? payload.phpVersion : '',
  };
}

/**
 * @typedef {object} HashResult
 * @property {string} hash
 * @property {string} algorithm
 * @property {string} algorithmLabel
 * @property {number} length
 * @property {number|null} cost
 * @property {number|null} memoryCost
 * @property {number|null} timeCost
 * @property {number|null} threads
 * @property {boolean} truncated
 * @property {boolean} verified
 */

/**
 * @param {string} password
 * @param {string} algorithm
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<HashResult>}
 */
export async function generateHash(password, algorithm, { signal } = {}) {
  const payload = await request(ENDPOINT, {
    method: 'POST',
    body: { password, algorithm },
    signal,
  });

  return {
    hash: String(payload.hash ?? ''),
    algorithm: String(payload.algorithm ?? algorithm),
    algorithmLabel: String(payload.algorithmLabel ?? algorithm),
    length: Number(payload.length ?? 0),
    cost: toNumberOrNull(payload.cost),
    memoryCost: toNumberOrNull(payload.memoryCost),
    timeCost: toNumberOrNull(payload.timeCost),
    threads: toNumberOrNull(payload.threads),
    truncated: Boolean(payload.truncated),
    verified: Boolean(payload.verified),
  };
}

/**
 * @param {string} url
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function request(url, { method = 'GET', body, signal } = {}) {
  /** @type {Response} */
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;

    throw new ApiError(OFFLINE_MESSAGE, 0);
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success !== true) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : 'O servidor devolveu uma resposta inesperada.';

    throw new ApiError(message, response.status);
  }

  return payload;
}

/**
 * @param {unknown} value
 * @returns {number|null}
 */
function toNumberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
