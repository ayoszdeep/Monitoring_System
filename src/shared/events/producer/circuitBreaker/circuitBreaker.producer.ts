// circuitBreaker.ts

import { CircuitState } from '../../../constants/circuitState';
import { CircuitBreakerOptions } from '../../../utils/types/circuit.types';
// import { RETRYABLE_PATTERNS } from './constants';


export class CircuitBreaker {
    private failureThreshold: number;
    private cooldownMs: number;
    private halfOpenMaxAttempts: number;
    private logger: Console;

    private _state: CircuitState = CircuitState.CLOSED;
    private _failures = 0;
    private _lastFailureTime = 0;
    private _halfOpenAttempts = 0;
    private _halfOpenSuccesses = 0;

    constructor(opts: CircuitBreakerOptions = {}) {
        this.failureThreshold = opts.failureThreshold ?? 5;
        this.cooldownMs = opts.cooldownMs ?? 30_000;
        this.halfOpenMaxAttempts = opts.halfOpenMaxAttempts ?? 3;
        this.logger = opts.logger ?? console;
    }

    private cooldownElapsed(): boolean {
        return Date.now() - this._lastFailureTime >= this.cooldownMs;
    }

    private transitionTo(newState: CircuitState) {
        this._state = newState;

        if (newState === CircuitState.HALF_OPEN) {
            this._halfOpenAttempts = 0;
            this._halfOpenSuccesses = 0;
        }
    }

    private openCircuit() {
        this._lastFailureTime = Date.now();
        this.transitionTo(CircuitState.OPEN);
    }

    private reset() {
        this._state = CircuitState.CLOSED;
        this._failures = 0;
        this._halfOpenAttempts = 0;
        this._halfOpenSuccesses = 0;
    }

    get state(): CircuitState {
        if (this._state === CircuitState.OPEN && this.cooldownElapsed()) {
            this.transitionTo(CircuitState.HALF_OPEN);
        }
        return this._state;
    }

    allowRequest(): boolean {
        const current = this.state;

        if (current === CircuitState.CLOSED) return true;

        if (current === CircuitState.HALF_OPEN) {
            if (this._halfOpenAttempts < this.halfOpenMaxAttempts) {
                this._halfOpenAttempts++;
                return true;
            }
            return false;
        }

        return false;
    }

    onSuccess(): void {
        if (this._state === CircuitState.HALF_OPEN) {
            this._halfOpenSuccesses++;
            if (this._halfOpenSuccesses >= this.halfOpenMaxAttempts) {
                this.reset();
            }
            return;
        }

        if (this._failures > 0) {
            this._failures = 0;
        }
    }

    onFailure(): void {
        if (this._state === CircuitState.HALF_OPEN) {
            this.openCircuit();
            return;
        }

        this._failures++;
        this._lastFailureTime = Date.now();

        if (this._failures >= this.failureThreshold) {
            this.openCircuit();
        }
    }
}