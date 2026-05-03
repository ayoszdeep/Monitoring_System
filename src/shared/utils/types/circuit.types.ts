// types.ts

export interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitterFactor?: number;
}

export interface CircuitBreakerOptions {
    failureThreshold?: number;
    cooldownMs?: number;
    halfOpenMaxAttempts?: number;
    logger?: Console;
}

export interface RetryableError {
    message?: string;
    code?: string;
}