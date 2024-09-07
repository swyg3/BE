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
  entities: [join(__dirname, "..", "..", "**", "*.entity.{ts,js}")],
  autoLoadEntities: true,
  synchronize: configService.get("NODE_ENV") === "development",
  logging:
    configService.get("NODE_ENV") === "development"
      ? ["error", "warn", "query"] // 개발환경
      : ["error"], // 운영환경
});
