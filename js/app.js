/**
 * Boots the CLOUDCORE hash generator: wires the form to the result panel and
 * runs a capability check against process.php on load.
 */

import { select, selectAll } from './dom.js';
import { createFormController } from './form-controller.js';
import { createResultView } from './result-view.js';
import { createServerStatus } from './server-status.js';

const elements = {
  form: select('#hash-form'),
  algorithmGroup: select('#algorithm-group'),
  algorithmHint: select('#algorithm-hint'),
  passwordInput: select('#password'),
  passwordHint: select('#password-hint'),
  visibilityToggle: select('#toggle-visibility'),
  visibilityLabel: select('[data-role="visibility-label"]'),
  submitButtons: selectAll('[data-role="submit"]'),
};

const resultView = createResultView();
const formController = createFormController({ elements, resultView });
const serverStatus = createServerStatus();

const disposeForm = formController.init();

resultView.showEmpty();

void (async () => {
  const available = await serverStatus.refresh();

  if (available && available.length > 0) {
    formController.setAvailableAlgorithms(available);
  }
})();

window.addEventListener('pagehide', () => {
  disposeForm();
  serverStatus.dispose();
});
