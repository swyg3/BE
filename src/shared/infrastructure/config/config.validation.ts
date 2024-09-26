import * as Joi from "joi";

export const configValidationSchema = Joi.object({
  // NestJS Application
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  NODE_PORT: Joi.number().required(),

  // 인증/소셜로그인 관련
  EMAIL_JWT_SECRET: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRY: Joi.string().required(),
  REFRESH_TOKEN_EXPIRY: Joi.string().required(),
  REFRESH_TOKEN_BLACKLIST_EXPIRY: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  KAKAO_CLIENT_ID: Joi.string().required(),
  KAKAO_CLIENT_SECRET: Joi.string().required(),
  KAKAO_CALLBACK_URL: Joi.string().uri().required(),

  // Nodemailer
  MAIL_ID: Joi.string().email().required(),
  MAIL_PASSWORD: Joi.string().required(),
  HMAC_SECRET: Joi.string().required(),

  // Throttle
  THROTTLE_TTL: Joi.number().required(),
  THROTTLE_LIMIT: Joi.number().required(),

  // PostgreSQL Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_DATABASE: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  // MongoDB Atlas Database
  MONGODB_URI: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  // Prometheus
  PROMETHEUS_PORT: Joi.number().required(),

  // Node Exporter
  NODE_EXPORTER_PORT: Joi.number().required(),

  // Grafana
  GRAFANA_PORT: Joi.number().required(),
});
