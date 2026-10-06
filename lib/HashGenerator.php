<?php

declare(strict_types=1);

namespace Passhas\Security;

use InvalidArgumentException;
use RuntimeException;

/**
 * Turns a plain password into a password_hash() digest and reports
 * everything the UI needs to describe that digest.
 */
final class HashGenerator
{
    /** UI algorithm id => label shown to the user. */
    public const ALGORITHMS = [
        'bcrypt' => 'Bcrypt',
        'argon2i' => 'Argon2i',
        'argon2id' => 'Argon2id',
    ];

    /** bcrypt silently ignores every byte after the 72nd. */
    private const BCRYPT_MAX_BYTES = 72;

    /** Hard ceiling so a runaway request cannot exhaust memory. */
    public const MAX_PASSWORD_LENGTH = 4096;

    /**
     * @return array{
     *     hash: string,
     *     algorithm: string,
     *     algorithmLabel: string,
     *     length: int,
     *     cost: int|null,
     *     memoryCost: int|null,
     *     timeCost: int|null,
     *     threads: int|null,
     *     truncated: bool,
     *     verified: bool
     * }
     */
    public function generate(string $password, string $algorithm): array
    {
        $algorithm = $this->resolveAlgorithm($algorithm);
        $hash = password_hash($password, $this->nativeAlgorithm($algorithm));

        if ($hash === false) {
            throw new RuntimeException('Não foi possível gerar o hash.');
        }

        $info = password_get_info($hash);
        $options = is_array($info['options'] ?? null) ? $info['options'] : [];

        return [
            'hash' => $hash,
            'algorithm' => $algorithm,
            'algorithmLabel' => self::ALGORITHMS[$algorithm],
            'length' => strlen($hash),
            'cost' => isset($options['cost']) ? (int) $options['cost'] : null,
            'memoryCost' => isset($options['memory_cost']) ? (int) $options['memory_cost'] : null,
            'timeCost' => isset($options['time_cost']) ? (int) $options['time_cost'] : null,
            'threads' => isset($options['threads']) ? (int) $options['threads'] : null,
            'truncated' => $algorithm === 'bcrypt' && strlen($password) > self::BCRYPT_MAX_BYTES,
            'verified' => password_verify($password, $hash),
        ];
    }

    /** @return list<string> */
    public static function availableAlgorithms(): array
    {
        return array_values(array_filter(
            array_keys(self::ALGORITHMS),
            static fn (string $algorithm): bool => self::isSupported($algorithm)
        ));
    }

    public static function isSupported(string $algorithm): bool
    {
        return match ($algorithm) {
            'bcrypt' => true,
            'argon2i' => defined('PASSWORD_ARGON2I'),
            'argon2id' => defined('PASSWORD_ARGON2ID'),
            default => false,
        };
    }

    private function resolveAlgorithm(string $algorithm): string
    {
        $algorithm = strtolower(trim($algorithm));

        if (!isset(self::ALGORITHMS[$algorithm])) {
            throw new InvalidArgumentException(
                'Algoritmo desconhecido. Use bcrypt, argon2i ou argon2id.'
            );
        }

        if (!self::isSupported($algorithm)) {
            throw new InvalidArgumentException(sprintf(
                '%s não está disponível nesta versão do PHP.',
                self::ALGORITHMS[$algorithm]
            ));
        }

        return $algorithm;
    }

    private function nativeAlgorithm(string $algorithm): string
    {
        return match ($algorithm) {
            'bcrypt' => PASSWORD_BCRYPT,
            'argon2i' => PASSWORD_ARGON2I,
            'argon2id' => PASSWORD_ARGON2ID,
        };
    }
}
