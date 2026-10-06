/**
 * Clipboard access with a fallback for insecure origins, where
 * `navigator.clipboard` is unavailable (plain http on a LAN address, for
 * instance). A developer tool has to copy the hash either way.
 */

/**
 * @param {string} text
 * @returns {Promise<boolean>} whether the text reached the clipboard
 */
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  return copyViaTextarea(text);
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function copyViaTextarea(text) {
  const scratch = document.createElement('textarea');

  scratch.value = text;
  scratch.setAttribute('readonly', '');
  scratch.setAttribute('aria-hidden', 'true');
  scratch.style.position = 'fixed';
  scratch.style.top = '-1000px';
  scratch.style.opacity = '0';

  document.body.appendChild(scratch);
  scratch.select();

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  scratch.remove();
  return copied;
}
