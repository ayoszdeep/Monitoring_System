import { RETRYABLE_PATTERNS } from '../../../constants/circuitStatee
import { RetryableError } from '../../../utils/types/circuit.types';

export function isRetryable(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;

    const error = err as RetryableError;

    const msg = (error.message ?? '').toLowerCase();
    const code = (error.code ?? '').toUpperCase();

    if (code === 'ENOTFOUND') return true;

    return RETRYABLE_PATTERNS.some(
        (p) =>
            msg.includes(p.toLowerCase()) ||
            code.includes(p.toUpperCase())
    );
}