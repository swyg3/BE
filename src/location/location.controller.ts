import { Controller, Post, Get, Put, Body, Param, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocationViewRepository } from './location-view.repository';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { GetUserLocationsQuery } from './queries/impl/get-userlocation-all.query';
import { AddCurrentLocationCommand } from './commands/impl/add-current-location.command';

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly locationViewRepository: LocationViewRepository
  ) {}

  @Put('current/insert')
  @ApiOperation({ summary: '사용자 진입시 현재 위치 설정' })
  async setCurrentLocation(
    @GetUser() user: JwtPayload,
    @Body() locationData: { longitude: string; latitude: string },
  ) {
    if (!locationData.latitude || !locationData.longitude) {
      throw new BadRequestException('Latitude and longitude are required');
    }
    const { longitude, latitude } = locationData;
    return this.commandBus.execute(
      new AddCurrentLocationCommand(user.userId, longitude, latitude, true)
    );
  }

  @Get('current')
  @ApiOperation({ summary: '현재 선택된 위치 조회' })
  async getCurrentLocation(@GetUser() user: JwtPayload) {
    const currentLocation = await this.locationViewRepository.findCurrentLocation(user.userId);
    if (!currentLocation) {
      throw new NotFoundException('현재 위치가 설정되어 있지 않습니다.');
    }
    return currentLocation;
  }

 
  @Get('all')
  @ApiOperation({ summary: '사용자의 모든 저장된 위치 조회' })
  async getUserLocations(@GetUser() user: JwtPayload) {
    return this.queryBus.execute(new GetUserLocationsQuery(user.userId));
  }
}