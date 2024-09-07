import { SetMetadata } from "@nestjs/common";

export const THROTTLE_KEY = "throttle";

export interface ThrottleOptions {
  default: {
    limit: number;
    ttl: number;
  };
}

export const Throttle = (options: ThrottleOptions) =>
  SetMetadata(THROTTLE_KEY, options);
