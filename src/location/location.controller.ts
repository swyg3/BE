import { Controller, Get, Put, Body, Param, UseGuards, NotFoundException, BadRequestException, Post, Query, Patch } from '@nestjs/common';
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
import { GetAllAddressesQuery } from './queries/impl/get-all-addresses.query';
import { SetCurrentLocationCommand } from './commands/impl/set-current-location.command';

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // @Put('current/insert')
  // @ApiOperation({ summary: '사용자 진입시 현재 위치 설정' })
  // @ApiResponse({ status: 200, description: '현재 위치 설정 성공' })
  // @ApiResponse({ status: 400, description: '잘못된 요청' })
  // async createCurrentLocation(
  //   @GetUser() user: JwtPayload,
  //   @Body() locationDataDto: LocationDataDto,
  // ) {
  //   const { longitude, latitude } = locationDataDto;
  //   return this.commandBus.execute(
  //     new AddCurrentLocationCommand(user.userId, longitude, latitude, true, true)
  //   );
  // }

  // @Get('current')
  // @ApiOperation({ summary: '현재 선택된 위치 조회' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: '현재 위치 조회 성공',
  
  // })
  // @ApiResponse({ status: 404, description: '현재 위치가 설정되어 있지 않음' })
  // async getCurrentLocation(@GetUser() user: JwtPayload) {
  //   return this.queryBus.execute(new GetCurrentLocationQuery(user.userId));
  // }

 
  // @Get('all')
  // @ApiOperation({ summary: '사용자의 모든 저장된 위치 조회' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: '모든 저장된 위치 조회 성공',
  //   type: [UserLocationDto],
  // })
  // async getUserLocations(@GetUser() user: JwtPayload) {
  //   return this.queryBus.execute(new GetUserLocationsQuery(user.userId));
  // }
  @Post('address/insert')
  @ApiOperation({ summary: '검색 주소 저장' })
  @ApiBody({
    type: AddressDto,
    description: '저장할 주소 정보',
    examples: {
      address: {
        summary: '주소 예시',
        value: {
          searchTerm:"테헤란로",
          roadAddress: '서울특별시 강남구 테헤란로 152',
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '주소 저장 성공',
    type: AddressDto,
    content: {
      'application/json': {
        example: {
  
            "userId": "448e7d77-95b2-4159-b43a-f10d0939a8f4",
            "searchTerm": "테헤란로",
            "roadAddress": "서울특별시 강남구 테헤란로 152",
            "latitude": "37.5000263",
            "longitude": "127.0365456",
            "isCurrent": false,
            "isAgreed": true,
            "updatedAt": "2024-10-04T12:30:54.542Z",
            "id": "5c19af6a-20ac-42c6-8cce-0eb5ad756dfe"
        
        }
      }
    }
  })
  @ApiBody({ type: AddressDto })
  @ApiResponse({ status: 201, description: '주소 저장 성공', type: AddressDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async saveAddress(@GetUser() user: JwtPayload, @Body() addressDto: AddressDto) {
    return this.commandBus.execute(new SaveAddressCommand(user.userId, addressDto));
  }
  
  @Get('address/getall')
  @ApiOperation({ summary: '모든 주소 목록 조회' })
  @ApiResponse({ status: 200, description: '주소 목록 조회 성공', type: [AddressDto] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAllAddresses(@GetUser() user: JwtPayload) {
    return this.queryBus.execute(new GetAllAddressesQuery(user.userId));
  }

  @Patch('setcurrent')
  @ApiOperation({ summary: '현재 위치 설정', description: '특정 주소를 사용자의 현재 위치로 설정합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: '설정할 주소의 ID'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '현재 위치 업데이트 성공',
    content: {
      'application/json': {
        example: {
         id: '123e4567-e89b-12d3-a456-426614174000',
          roadAddress: '서울특별시 강남구 테헤란로 123'
        }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async setCurrentLocation(@GetUser() user: JwtPayload, @Query('id') id: string) {
    const result = await this.commandBus.execute(new SetCurrentLocationCommand(user.userId, id));
    return { 
      id: result.id,
      roadAddress: encodeURIComponent(result.roadAddress)
        };
}}