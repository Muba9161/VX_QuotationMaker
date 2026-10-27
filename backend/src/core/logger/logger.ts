import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

// Strict redaction of secrets to prevent accidental credential leakage
const redactKeys = [
  'password',
  'password_hash',
  'DATABASE_PASSWORD',
  'REDIS_PASSWORD',
  'authorization',
  'token',
  'signing_token',
  'secret',
  'cookie',
  'req.headers.authorization',
  'req.headers.cookie',
];

export const logger = pino({
  level: logLevel,
  redact: {
    paths: redactKeys,
    censor: '[REDACTED]',
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});
