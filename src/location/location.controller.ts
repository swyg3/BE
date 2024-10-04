import { Controller, Get, Put, Body, Param, UseGuards, NotFoundException, BadRequestException, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { GetUserLocationsQuery } from './queries/impl/get-userlocation-all.query';
import { AddCurrentLocationCommand } from './commands/impl/add-current-location.command';
import { LocationDataDto } from './dto/locationdata.dto';
import { GetCurrentLocationQuery } from './queries/impl/get-userlocation-iscurrent.query';
import { UserLocationDto } from './dto/userlocation.dto';
import { AddressDto } from './dto/address.dto';
import { SaveAddressCommand } from './commands/impl/save-address.command';
import { GetAllAddressesQuery } from './queries/query/get-all-addresses.query';

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Put('current/insert')
  @ApiOperation({ summary: '사용자 진입시 현재 위치 설정' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        longitude: { type: 'string', example: '126.9779692' },
        latitude: { type: 'string', example: '37.5662952' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '현재 위치 설정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async setCurrentLocation(
    @GetUser() user: JwtPayload,
    @Body() locationDataDto: LocationDataDto,
  ) {
    const { longitude, latitude, locationType } = locationDataDto;
    return this.commandBus.execute(
      new AddCurrentLocationCommand(user.userId, longitude, latitude, true, locationType, true)
    );
  }

  @Get('current')
  @ApiOperation({ summary: '현재 선택된 위치 조회' })
  @ApiResponse({ 
    status: 200, 
    description: '현재 위치 조회 성공',
  
  })
  @ApiResponse({ status: 404, description: '현재 위치가 설정되어 있지 않음' })
  async getCurrentLocation(@GetUser() user: JwtPayload) {
    return this.queryBus.execute(new GetCurrentLocationQuery(user.userId));
  }

 
  @Get('all')
  @ApiOperation({ summary: '사용자의 모든 저장된 위치 조회' })
  @ApiResponse({ 
    status: 200, 
    description: '모든 저장된 위치 조회 성공',
    type: [UserLocationDto],
  })
  async getUserLocations(@GetUser() user: JwtPayload) {
    return this.queryBus.execute(new GetUserLocationsQuery(user.userId));
  }
  @Post('address')
  @ApiOperation({ summary: '검색 주소 저장' })
  @ApiBody({ type: AddressDto })
  @ApiResponse({ status: 201, description: '주소 저장 성공', type: AddressDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async saveAddress(@GetUser() user: JwtPayload, @Body() addressDto: AddressDto) {
    return this.commandBus.execute(new SaveAddressCommand(user.userId, addressDto));
  }
  
  @Get('addresses')
  @ApiOperation({ summary: '모든 주소 목록 조회' })
  @ApiResponse({ status: 200, description: '주소 목록 조회 성공', type: [AddressDto] })
  async getAllAddresses(@GetUser() user: JwtPayload) {
    return this.queryBus.execute(new GetAllAddressesQuery(user.userId));
  }
}