

export interface RabbitMQConnectionManager {
    connection?: any;
    connect: () => Promise<void>;
}

export interface ConfirmChannelManagerOptions {
    rabbitmq: RabbitMQConnectionManager;
    logger?: Console;
}