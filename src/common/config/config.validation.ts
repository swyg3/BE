import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  NODE_PORT: Joi.number().required(),
  
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_DATABASE: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  
  MONGODB_URI: Joi.string().required(),
  
  PROMETHEUS_PORT: Joi.number().required(),
  NODE_EXPORTER_PORT: Joi.number().required(),
  GRAFANA_PORT: Joi.number().required(),
});