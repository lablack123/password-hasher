<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['password']) || trim($data['password']) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Password é obrigatório']);
    exit;
}

$password = $data['password'];
$algorithm = $data['algorithm'] ?? 'bcrypt';

switch ($algorithm) {
    case 'bcrypt':
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $algoName = 'BCRYPT';
        break;
    case 'argon2i':
        if (defined('PASSWORD_ARGON2I')) {
            $hash = password_hash($password, PASSWORD_ARGON2I);
            $algoName = 'ARGON2I';
        } else {
            echo json_encode(['error' => 'ARGON2I não disponível nesta versão do PHP']);
            exit;
        }
        break;
    case 'argon2id':
        if (defined('PASSWORD_ARGON2ID')) {
            $hash = password_hash($password, PASSWORD_ARGON2ID);
            $algoName = 'ARGON2ID';
        } else {
            echo json_encode(['error' => 'ARGON2ID não disponível nesta versão do PHP']);
            exit;
        }
        break;
    default:
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $algoName = 'DEFAULT';
        break;
}

// Get hash info
$info = password_hash_info($hash) ?? [];

echo json_encode([
    'success' => true,
    'hash' => $hash,
    'algorithm' => $algoName,
    'length' => strlen($hash),
    'verify' => password_verify($password, $hash),
    'php_version' => PHP_VERSION
]);
