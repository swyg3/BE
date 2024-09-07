import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BaseAuthController } from "../shared/base-auth.controller";

@Controller("users/auth")
export class UserAuthController extends BaseAuthController {
  constructor(protected readonly commandBus: CommandBus) {
    super(commandBus);
  }

  protected getUserType(): "user" | "seller" {
    return "user";
  }

  /**
   * TODO 1: 위치 정보 활용 동의 API
   */

  /**
   * TODO 2: 판매자로 전환 API
   */
}
