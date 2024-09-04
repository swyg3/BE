import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

export const ValidateUUID = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.params.id;
    
    if (!uuidValidate(id)) {
      throw new BadRequestException('잘못된 ID 형식입니다.');
    }
    
    return id;
  },
);