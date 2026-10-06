<?php

declare(strict_types=1);

/**
 * Segmented algorithm picker. Rendered on the server so the choices are on
 * screen before JavaScript runs.
 *
 * @var list<array{id: string, label: string, hint: string}> $algorithmPicker
 */
?>
<div class="segmented" id="algorithm-group" role="radiogroup" aria-labelledby="algorithm-label">
    <?php foreach ($algorithmPicker as $index => $algorithm): ?>
        <button
            type="button"
            role="radio"
            class="segmented__option"
            data-algorithm="<?= htmlspecialchars($algorithm['id'], ENT_QUOTES) ?>"
            data-hint="<?= htmlspecialchars($algorithm['hint'], ENT_QUOTES) ?>"
            aria-checked="<?= $index === 0 ? 'true' : 'false' ?>"
        ><?= htmlspecialchars($algorithm['label'], ENT_QUOTES) ?></button>
    <?php endforeach; ?>
</div>
