// import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { ConfigService } from "@nestjs/config";
// import { join } from "path";

// export const getTypeOrmConfig = (
//   configService: ConfigService,
// ): TypeOrmModuleOptions => ({
//   type: "postgres",
//   host: configService.get("DB_HOST"),
//   port: configService.get("DB_PORT"),
//   username: configService.get("DB_USERNAME"),
//   password: configService.get("DB_PASSWORD"),
//   database: configService.get("DB_DATABASE"),
//   entities: [join(__dirname, "..", "..", "**", "*.entity.{ts,js}")],
//   autoLoadEntities: true,
//   synchronize: configService.get("NODE_ENV") === "development",
//   logging:
//     configService.get("NODE_ENV") === "development"
//       ? ["error", "warn", "query"] // 개발환경
//       : ["error"], // 운영환경
// });

import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { join } from "path";

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get("DB_HOST"),
  port: configService.get("DB_PORT"),
  username: configService.get("DB_USERNAME"),
  password: configService.get("DB_PASSWORD"),
  database: configService.get("DB_DATABASE"),
  entities: [join(__dirname, "..", "..", "*", ".entity.{ts,js}")],
  autoLoadEntities: true,
  synchronize: configService.get("NODE_ENV") === "development",
  logging:
    configService.get("NODE_ENV") === "development"
      ? ["error", "warn", "query"]
      : ["error"],
  ssl: {
    rejectUnauthorized: false, // 개발 환경에서만 사용하세요. 프로덕션에서는 true로 설정해야 합니다.
  },
  extra: {
    max: 20,
    connectionTimeoutMillis: 5000,
  },
  retryAttempts: 5,
  retryDelay: 3000,
});
