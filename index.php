```php
<?php
$hash = '';
$password = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';

    if ($password !== '') {
        $hash = password_hash($password, PASSWORD_BCRYPT, [
            'cost' => 10
        ]);
    }
}
?>

<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Gerador de Hash</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

<div class="container">

    <div class="card">

        <h1>Gerador de Password</h1>

        <p class="subtitle">
            Gere um hash bcrypt para utilizar na sua aplicação PHP.
        </p>

        <form method="POST">

            <label for="password">
                Palavra-passe
            </label>

            <div class="input-group">

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Digite a palavra-passe"
                    required
                >

                <button
                    type="button"
                    onclick="togglePassword()"
                    class="show-btn"
                >
                    Mostrar
                </button>

            </div>

            <button type="submit" class="generate-btn">
                Gerar Hash
            </button>

        </form>

        <?php if ($hash): ?>

            <div class="result">

                <label>Hash bcrypt:</label>

                <textarea
                    id="hash"
                    readonly
                ><?= htmlspecialchars($hash) ?></textarea>

                <button
                    type="button"
                    onclick="copyHash()"
                    class="copy-btn"
                >
                    Copiar Hash
                </button>

            </div>

        <?php endif; ?>

    </div>

</div>

<script>

function togglePassword() {

    const input = document.getElementById('password');
    const button = document.querySelector('.show-btn');

    if (input.type === 'password') {

        input.type = 'text';
        button.textContent = 'Ocultar';

    } else {

        input.type = 'password';
        button.textContent = 'Mostrar';

    }
}


function copyHash() {

    const hash = document.getElementById('hash');

    navigator.clipboard.writeText(hash.value);

    const button = document.querySelector('.copy-btn');

    button.textContent = 'Copiado!';

    setTimeout(() => {

        button.textContent = 'Copiar Hash';

    }, 2000);

}

</script>

</body>
</html>
```
