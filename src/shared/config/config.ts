import "dotenv/config";

const toNumber = (value: string | undefined, defaultValue: number) =>
  parseInt(value || String(defaultValue), 10);

if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is required in .env");
}

export interface AppConfig {
  node_env: string;
  port: number;

  mongo: {
    uri: string;
    dbName: string;
  };

  postgres: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };

  rabbitmq: {
    url: string;
    queue: string;
    publisherConfirms: boolean;
    retryAttempts: number;
    retryDelay: number;
  };

  jwt: {
    secret: string;
    expiresIn: string;
  };

  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  cookie: {
    httpOnly: boolean;
    secure: boolean;
    expiresIn: number;
  };
}

const config: AppConfig = {
  node_env: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/api_monitoring",
    dbName: process.env.MONGO_DB_NAME || "api_monitoring",
  },

  postgres: {
    host: process.env.PG_HOST || "localhost",
    port: toNumber(process.env.PG_PORT, 5432),
    database: process.env.PG_DATABASE || "api_monitoring",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "postgres",
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    queue: process.env.RABBITMQ_QUEUE || "api_hits",
    publisherConfirms:
      process.env.RABBITMQ_PUBLISHER_CONFIRMS === "true" ? true : false,
    retryAttempts: toNumber(process.env.RABBITMQ_RETRY_ATTEMPTS, 3),
    retryDelay: toNumber(process.env.RABBITMQ_RETRY_DELAY, 1000),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  rateLimit: {
    windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
    maxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 1000),
  },

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expiresIn: 24 * 60 * 60 * 1000,
  },
};

export default config;