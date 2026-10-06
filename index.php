<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/HashGenerator.php';

use Passhas\Security\HashGenerator;

$algorithms = HashGenerator::availableAlgorithms();
$phpVersion = PHP_VERSION;

/** Copy for the picker. Keys must match HashGenerator::ALGORITHMS. */
$algorithmCopy = [
    'bcrypt' => [
        'label' => 'Bcrypt',
        'hint' => 'O clássico. Rápido, compatível com tudo e pronto para qualquer base de dados.',
    ],
    'argon2i' => [
        'label' => 'Argon2i',
        'hint' => 'Resistente a trocas de memória. Boa escolha em servidores partilhados.',
    ],
    'argon2id' => [
        'label' => 'Argon2id',
        'hint' => 'O mais recente e o mais duro de atacar. Ideal quando há memória para gastar.',
    ],
];

$algorithmPicker = array_values(array_filter(array_map(
    static function (string $algorithm) use ($algorithmCopy): ?array {
        if (!isset($algorithmCopy[$algorithm])) {
            return null;
        }

        return ['id' => $algorithm, ...$algorithmCopy[$algorithm]];
    },
    $algorithms
)));
?>
<!DOCTYPE html>
<html lang="pt" data-theme="cloudcore" style="--tp-h: 225">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#cfe4ff">
    <meta
        name="description"
        content="Gerador de hash de palavras-passe em PHP: bcrypt, Argon2i e Argon2id prontos a copiar."
    >

    <title>passhas · gerador de hash</title>

    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Lexend:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap"
    >
    <link rel="stylesheet" href="theme.css">
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="sky tp-web-stage" aria-hidden="true">
        <div class="tp-fx"></div>
    </div>

    <div class="shell">
        <header class="pillbar">
            <span class="pillbar__brand">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <g fill="currentColor">
                        <circle cx="8.4" cy="14.2" r="4.5"></circle>
                        <circle cx="13.6" cy="12.4" r="5.4"></circle>
                        <circle cx="17.8" cy="15.4" r="3.5"></circle>
                        <circle cx="12.2" cy="16.8" r="3.9"></circle>
                        <circle cx="7.6" cy="17.2" r="3.3"></circle>
                    </g>
                </svg>
                passhas
            </span>
            <span class="pillbar__chip" id="php-chip">
                <span data-role="chip-label">PHP <?= htmlspecialchars($phpVersion, ENT_QUOTES) ?></span>
            </span>
        </header>

        <main class="stack">
            <section class="card">
                <div class="card__body">
                    <div class="hero tp-stage">
                        <div class="hero__media">
                            <img
                                class="hero__img"
                                src="assets/hero-clouds.png"
                                alt="Céu pastel com nuvens fofas e um arco-íris"
                                width="1024"
                                height="1024"
                            >
                            <span class="hero__overlay" aria-hidden="true"></span>
                        </div>
                    </div>

                    <p class="eyebrow">palavras-passe viram nuvens</p>

                    <h1 class="title">Gerador de hash</h1>

                    <p class="lede">
                        Escreva uma palavra-passe e leve o hash pronto a colar na sua aplicação PHP.
                        Use bcrypt no dia a dia ou Argon2id quando quiser a nuvem mais fechada.
                    </p>

                    <form class="form" id="hash-form" novalidate>
                        <div class="field">
                            <span class="field__label" id="algorithm-label">Algoritmo</span>
                            <?php require __DIR__ . '/partials/algorithm-picker.php'; ?>
                            <p class="field__hint" id="algorithm-hint"></p>
                        </div>

                        <div class="field">
                            <label class="field__label" for="password">Palavra-passe</label>
                            <div class="input-row">
                                <input
                                    class="input"
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Escreva aqui, ninguém está a ver"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    spellcheck="false"
                                    required
                                >
                                <button
                                    class="btn btn--ghost"
                                    type="button"
                                    id="toggle-visibility"
                                    aria-pressed="false"
                                >
                                    <span data-role="visibility-label">Mostrar</span>
                                </button>
                            </div>
                            <p class="field__hint" id="password-hint">Nada sai deste servidor.</p>
                        </div>

                        <button
                            class="btn btn--primary btn--block form__submit-inline"
                            type="submit"
                            data-role="submit"
                        >
                            <span class="btn__icon btn__spinner" data-role="submit-icon" hidden></span>
                            <span data-role="submit-label">Gerar hash</span>
                        </button>
                    </form>
                </div>
            </section>

            <section class="card result-card tp-screen" id="result-card" data-state="empty" aria-live="polite">
                <div class="card__body">
                    <?php require __DIR__ . '/partials/result-panel.php'; ?>
                </div>
            </section>
        </main>

        <noscript>
            <p class="notice">
                Este gerador precisa de JavaScript para falar com o <code>process.php</code>.
            </p>
        </noscript>

        <footer class="footer" id="server-status" data-server="online">
            <span id="server-summary">A verificar o servidor…</span>
        </footer>
    </div>

    <div class="thumbbar">
        <button class="btn btn--primary btn--block" type="submit" form="hash-form" data-role="submit">
            <span class="btn__icon btn__spinner" data-role="submit-icon" hidden></span>
            <span data-role="submit-label">Gerar hash</span>
        </button>
    </div>

    <script type="module" src="js/app.js"></script>
</body>
</html>
