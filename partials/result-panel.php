<?php

declare(strict_types=1);

/**
 * The result panel. Four states live here and js/result-view.js shows one at a
 * time: empty, loading skeleton, error, and the finished hash.
 */
?>
<div class="state" id="state-empty">
    <span class="state__icon" id="state-empty-icon" aria-hidden="true"></span>
    <p class="state__title">Ainda não há nuvens por aqui</p>
    <p class="state__text">
        Escreva uma palavra-passe e toque em gerar. O hash aparece aqui, pronto a copiar.
    </p>
</div>

<div class="state state--start" id="state-loading" hidden>
    <span class="skeleton skeleton--line"></span>
    <span class="skeleton skeleton--line skeleton--line-short"></span>
    <span class="skeleton skeleton--hash"></span>
    <div class="skeleton-row">
        <span class="skeleton skeleton--chip"></span>
        <span class="skeleton skeleton--chip"></span>
        <span class="skeleton skeleton--chip"></span>
    </div>
</div>

<div class="state" id="state-error" hidden>
    <span class="state__icon" id="state-error-icon" aria-hidden="true"></span>
    <p class="state__title">Algo desalinhou as nuvens</p>
    <p class="state__text" id="error-text"></p>
</div>

<div class="state state--start state--result" id="state-result" hidden>
    <div class="result__head">
        <h2 class="result__title">A sua nuvem</h2>
        <span class="badge" id="result-badge"></span>
    </div>

    <div class="hash-box">
        <code class="hash" id="hash-output"></code>
    </div>

    <div class="result__actions">
        <button class="btn btn--ghost" type="button" id="copy-hash">
            <span data-role="copy-label">Copiar hash</span>
        </button>
        <span class="pill pill--ok" id="verify-pill">
            <span>Verificado</span>
        </span>
    </div>

    <ul class="meta" id="meta-list"></ul>

    <div class="notice" id="result-warning" hidden>
        <p>
            <strong>O bcrypt corta aos 72 bytes.</strong>
            O resto da palavra-passe ficou fora desta nuvem. O Argon2 não corta nada.
        </p>
    </div>
</div>
