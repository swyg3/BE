import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  Logger,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
  }

  handleRequest(err: Error | null, user: any, info: any) {
    if (info instanceof Error) {
      if (info.name === "TokenExpiredError") {
        if (info.message.includes("refresh")) {
          this.logger.warn("만료된 리프레시 토큰으로 인증 시도");
          throw new UnauthorizedException(
            "리프레시 토큰이 만료되었습니다. 다시 로그인해 주세요.",
          );
        } else {
          this.logger.warn("만료된 액세스 토큰으로 인증 시도");
          throw new UnauthorizedException(
            "액세스 토큰이 만료되었습니다. 리프레시 토큰을 사용하여 새로운 토큰을 발급받으세요.",
          );
        }
      } else if (info.name === "JsonWebTokenError") {
        this.logger.warn("유효하지 않은 토큰으로 인증 시도");
        throw new UnauthorizedException("유효하지 않은 토큰입니다.");
      }
    }

    if (err) {
      if (err.message === "BLACKLISTED_TOKEN") {
        this.logger.warn("블랙리스트에 등록된 토큰으로 인증 시도");
        throw new UnauthorizedException(
          "이 토큰은 무효화되었습니다. 다시 로그인해 주세요.",
        );
      } else if (err.message === "INVALID_PAYLOAD") {
        this.logger.warn("유효하지 않은 페이로드를 가진 토큰으로 인증 시도");
        throw new UnauthorizedException("유효하지 않은 토큰 페이로드입니다.");
      }
    }

    if (!user) {
      throw new UnauthorizedException("인증에 실패했습니다.");
    }

    return user;
  }
}
