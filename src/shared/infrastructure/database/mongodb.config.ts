// import { MongooseModuleOptions } from "@nestjs/mongoose";
// import { ConfigService } from "@nestjs/config";

// export const getMongoConfig = (
//   configService: ConfigService,
// ): MongooseModuleOptions => ({
//   uri: configService.get<string>("MONGODB_URI"),
// });

// import { MongooseModuleOptions } from "@nestjs/mongoose";
// import { ConfigService } from "@nestjs/config";
// import * as fs from "fs";
// import * as path from "path";

// export const getMongoConfig = (
//   configService: ConfigService,
// ): MongooseModuleOptions => {
//   const uri = configService.get<string>("MONGODB_URI");

//   if (!uri) {
//     throw new Error("MONGODB_URI is not defined in the environment variables");
//   }

//   // 인증서 파일 경로 설정
//   const tlsCAFilePath = path.resolve("/home/ubuntu/app", "global-bundle.pem");

//   return {
//     uri,
//     tlsCAFile: fs.readFileSync(tlsCAFilePath, "utf-8"), // 'utf-8'을 지정하여 string으로 변환
//   };
// };

import { ConfigService } from "@nestjs/config";
import * as fs from "fs";

export const getMongoConfig = (configService: ConfigService) => {
  const caFilePath = configService.get<string>("MONGO_TLS_CA_FILE_PATH");
  console.log("Using CA file path:", caFilePath);
  return {
    uri: configService.get<string>("MONGO_URI"),
    tls: true,
    tlsCAFile: caFilePath ? fs.readFileSync(caFilePath, "utf-8") : null,
  };
};
