import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw err;
    }

    if (!user) {
      // 다양한 예외 타입 처리
      if (info) {
        switch (info.name) {
          case 'TokenExpiredError':
            throw new UnauthorizedException("토큰이 만료되었습니다. 다시 로그인 해주세요.");
          case 'JsonWebTokenError':
            throw new UnauthorizedException("유효하지 않은 토큰입니다. 다시 시도해 주세요.");
          case 'NotBeforeError':
            throw new UnauthorizedException("토큰이 아직 활성화되지 않았습니다.");
          default:
            throw new UnauthorizedException("인증에 실패했습니다.");
        }
      }
      throw new UnauthorizedException("인증에 실패했습니다.");
    }

    return user;
  }
}
