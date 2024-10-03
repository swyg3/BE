import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

export const GetUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | JwtPayload[keyof JwtPayload] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user[data] : user;
  },
);
