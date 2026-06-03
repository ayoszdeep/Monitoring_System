import { EventEmitter } from "node:events";
import { ConfirmChannelManagerOptions } from "../../shared/utils/types/rabbitmq.types";

type Waiter = {
    resolve: (channel: any) => void;
    reject: (err: unknown) => void;
};

export class ConfirmChannelManager extends EventEmitter {
    private _rabbitmq: ConfirmChannelManagerOptions["rabbitmq"];
    private _logger: Console;

    private _channel: any | null = null;
    private _connecting = false;
    private _connectWaiters: Waiter[] = [];

    constructor({ rabbitmq, logger }: ConfirmChannelManagerOptions) {
        super();

        if (!rabbitmq) {
            throw new Error("ConfirmChannelManager requires rabbitmq");
        }

        this._rabbitmq = rabbitmq;
        this._logger = logger ?? console;
    }

    /**
     * Get or create confirm channel
     */
    async getChannel(): Promise<any> {
        if (this._channel) return this._channel;

        if (this._connecting) {
            return new Promise((resolve, reject) => {
                this._connectWaiters.push({ resolve, reject });
            });
        }

        return this._connect();
    }

    /**
     * Create confirm channel
     */
    private async _connect(): Promise<any> {
        this._connecting = true;

        try {
            let connection = this._rabbitmq.connection;

            if (!connection) {
                await this._rabbitmq.connect();

                if (!this._rabbitmq.connection) {
                    throw new Error("Failed to obtain RabbitMQ connection");
                }

                connection = this._rabbitmq.connection;
            }

            const confirmChannel = await connection.createConfirmChannel();

            // drain event
            confirmChannel.on("drain", () => this.emit("drain"));

            // close event
            confirmChannel.on("close", () => {
                this._logger.warn("[ChannelManager] channel closed");
                this._channel = null;
            });

            // error event
            confirmChannel.on("error", (err: any) => {
                this._logger.error("[ChannelManager] channel error", {
                    message: err.message,
                    code: err.code,
                });

                this._channel = null;
                this.emit("error", err);
            });

            this._channel = confirmChannel;

            this._logger.info("[ChannelManager] channel ready");

            // resolve waiters
            for (const w of this._connectWaiters) {
                w.resolve(confirmChannel);
            }

            this._connectWaiters = [];

            return confirmChannel;

        } catch (err) {
            for (const w of this._connectWaiters) {
                w.reject(err);
            }

            this._connectWaiters = [];

            throw err;

        } finally {
            this._connecting = false;
        }
    }
}