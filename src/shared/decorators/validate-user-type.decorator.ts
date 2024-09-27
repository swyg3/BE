import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { UserType } from "src/auth/interfaces/user-type.type";

export const UserTypes = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserType => {
    const request = ctx.switchToHttp().getRequest();
    let userType = request.query.userType as string;

    // 경로에서 userType을 추출하는 로직 추가 (필요한 경우)
    if (!userType && request.path.includes("seller")) {
      userType = "seller";
    }

    if (!userType) {
      return UserType.USER; // 기본값
    }

    userType = userType.toLowerCase();
    if (!(Object.values(UserType) as string[]).includes(userType)) {
      throw new BadRequestException(`Invalid user type: ${userType}`);
    }

    return userType as UserType;
  },
);
