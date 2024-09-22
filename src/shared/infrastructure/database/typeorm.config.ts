import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { join } from "path";

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isDev = configService.get("NODE_ENV") === "development";

  const baseConfig: TypeOrmModuleOptions = {
    type: "postgres",
    host: configService.get("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    username: configService.get("DB_USERNAME"),
    password: configService.get("DB_PASSWORD"),
    database: configService.get("DB_DATABASE"),
    entities: [join(__dirname, "..", "..", "**", "*.entity.{ts,js}")],
    autoLoadEntities: true,
    synchronize: isDev, // 개발 환경에서는 true, 프로덕션에서는 false
    logging: isDev ? ["error", "warn", "query"] : ["error"], // 로깅 설정
    ssl: {
      rejectUnauthorized: false,
    },
  };

  return baseConfig;
};
