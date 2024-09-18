// import { MongooseModuleOptions } from "@nestjs/mongoose";
// import { ConfigService } from "@nestjs/config";

// export const getMongoConfig = (
//   configService: ConfigService,
// ): MongooseModuleOptions => ({
//   uri: configService.get<string>("MONGODB_URI"),
// });

import { MongooseModuleOptions } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { readFileSync } from "fs";
import { join } from "path";

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const certFilePath = join(process.cwd(), "global-bundle.pem");

  return {
    uri: configService.get<string>("MONGODB_URI"),
    ssl: true,
    sslCA: readFileSync(certFilePath),
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    retryAttempts: 5,
    retryDelay: 1000,
  } as MongooseModuleOptions;
};
