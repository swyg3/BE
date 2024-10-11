import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common';
import { LocationViewRepository } from 'src/location/location-view.repository';

export const CurrentLocation = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const locationViewRepository = request.app.get(LocationViewRepository);

    const currentLocation = await locationViewRepository.findCurrentLocation(user.userId);
    if (!currentLocation) {
      throw new NotFoundException('현재 위치 정보가 설정되어 있지 않습니다.');
    }

    return currentLocation;
  },
);