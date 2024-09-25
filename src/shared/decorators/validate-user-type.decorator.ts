import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { UserType } from "src/auth/interfaces/user-type.type";

export const UserTypes = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserType => {
    const request = ctx.switchToHttp().getRequest();
    const userType = request.query.userType as string;

    if (!userType) {
      return UserType.USER; // 기본값
    }

    const normalizedUserType = userType.toUpperCase();
    if (!(normalizedUserType in UserType)) {
      throw new BadRequestException(`Invalid user type: ${userType}`);
    }

    return UserType[normalizedUserType as keyof typeof UserType];
  },
);
