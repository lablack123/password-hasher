<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/HashGenerator.php';

use Passhas\Security\HashGenerator;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$generator = new HashGenerator();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond([
        'success' => true,
        'algorithms' => HashGenerator::availableAlgorithms(),
        'phpVersion' => PHP_VERSION,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Método não permitido.'], 405);
}

$payload = json_decode((string) file_get_contents('php://input'), true);
$payload = is_array($payload) ? $payload : $_POST;

$password = $payload['password'] ?? '';
$password = is_string($password) ? $password : '';

if (trim($password) === '') {
    respond(['success' => false, 'error' => 'Escreva uma palavra-passe para continuar.'], 422);
}

if (mb_strlen($password) > HashGenerator::MAX_PASSWORD_LENGTH) {
    respond([
        'success' => false,
        'error' => sprintf(
            'A palavra-passe pode ter no máximo %d caracteres.',
            HashGenerator::MAX_PASSWORD_LENGTH
        ),
    ], 422);
}

$algorithm = $payload['algorithm'] ?? 'bcrypt';
$algorithm = is_string($algorithm) ? $algorithm : 'bcrypt';

try {
    $result = $generator->generate($password, $algorithm);
} catch (\InvalidArgumentException $exception) {
    respond(['success' => false, 'error' => $exception->getMessage()], 422);
} catch (\Throwable $exception) {
    respond(['success' => false, 'error' => 'O servidor não conseguiu gerar o hash.'], 500);
}

respond([
    'success' => true,
    'phpVersion' => PHP_VERSION,
    ...$result,
]);

/**
 * Emits a JSON response and stops the request.
 *
 * @param array<string, mixed> $body
 */
function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
