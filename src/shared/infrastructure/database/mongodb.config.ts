// import { MongooseModuleOptions } from "@nestjs/mongoose";
// import { ConfigService } from "@nestjs/config";
// import * as fs from "fs";

// export const getMongoConfig = async (
//   configService: ConfigService,
// ): Promise<MongooseModuleOptions> => {
//   const baseUri = configService.get<string>("MONGODB_URI");
//   const sslCertPath = configService.get<string>("MONGODB_SSL_CERT_PATH");

//   let uri = baseUri;
//   if (sslCertPath) {
//     try {
//       await fs.promises.access(sslCertPath, fs.constants.R_OK);
//       uri += `&ssl=true&sslValidate=true&sslCA=${encodeURIComponent(sslCertPath)}`;
//       console.log("SSL certificate found and added to URI");
//     } catch (error) {
//       console.warn(`Failed to access SSL certificate: ${error.message}`);
//     }
//   } else {
//     console.warn("SSL certificate path not provided, connecting without SSL");
//   }

//   return {
//     uri,
//   };
// };

import { MongooseModuleOptions } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>("MONGODB_URI");
  const sslCertPath = configService.get<string>("MONGODB_SSL_CERT_PATH");

  return {
    uri,
    tls: true,
    tlsCAFile: sslCertPath,
  };
};
