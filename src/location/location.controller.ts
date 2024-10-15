import { Controller, Get, Put, Body, Param, UseGuards, Post, Query, Patch, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { LocationDataDto } from './dto/locationdata.dto';
import { GetCurrentLocationQuery } from './queries/impl/get-userlocation-iscurrent.query';
import { AddressDto } from './dto/address.dto';
import { SaveAddressCommand } from './commands/impl/save-address.command';
import { GetAllAddressesQuery } from './queries/impl/get-all-addresses.query';
import { SetCurrentLocationCommand } from './commands/impl/set-current-location.command';
import { LocationResultCache } from './caches/location-cache';
import { FirstAddressInsertCommand } from './commands/impl/first-address-insert-command';
import { LocationView2 } from './repositories/location-view.repository';

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(LocationResultCache) private cache: LocationResultCache,
  ) { }

@Put('first/address/insert')
@ApiOperation({ summary: '사용자 GPS 동의 및 현재 위치 업데이트' })
@ApiResponse({ status: 200, description: 'GPS 동의 및 현재 위치 업데이트 성공',
  content: {
    'application/json': {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        roadAddress: { type: 'string', example: '%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%ED%85%8C%ED%97%A4%EB%9E%80%EB%A1%9C%20123'}, 
        searchTerm: { type: 'string', example: '%EC%84%9C%EC%B0%95%EB%82%A8%EA%B5%AC%20%ED%85%8C%ED%97%A4%EB%9E%80%EB%A1%9C%20123' }
      }
    }
  }
 })
@ApiResponse({ status: 400, description: '잘못된 요청' })
@ApiBody({ type: LocationDataDto })
async updateLocationConsent(
  @GetUser() user: JwtPayload,
  @Body() locationDataDto: LocationDataDto,
) {
  const { longitude, latitude, agree } = locationDataDto;

  // 캐시 키 생성
  const cacheKey = `location:${user.userId}`;

  try {
    // GPS 동의 및 위치 업데이트 명령 실행
    const command = new FirstAddressInsertCommand(user.userId, longitude, latitude, agree);
    await this.commandBus.execute(command);

    // 캐시에서 결과 조회
    const cacheResult = await this.waitForCacheResult(cacheKey);

    if (cacheResult === null) {
      throw new Error('캐시 업데이트 시간 초과');
    }

    return {
      id: cacheResult.locationId,
      roadAddress: encodeURIComponent(cacheResult.roadAddress),
      searchTerm: encodeURIComponent(cacheResult.searchTerm),
    };
  } catch (error) {
    throw new HttpException('위치 업데이트 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

private async waitForCacheResult(cacheKey: string): Promise<LocationView2 | null> {
  const maxAttempts = 20;
  const delay = 500; // 밀리초

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const result = this.cache.get(cacheKey);
    if (result !== undefined) {
      // 캐시 결과를 찾았지만 삭제하지 않음
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return null;
}

  @Post('address/insert')
  @ApiOperation({ summary: '검색 주소 저장' })
  @ApiBody({
    type: AddressDto,
    description: '저장할 주소 정보',
    examples: {
      address: {
        summary: '주소 예시',
        value: {
          searchTerm: "테헤란로",
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
          roadAddress: { type: 'string', example: '%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B0%95%EB%82%A8%EA%B5%AC%20%ED%85%8C%ED%97%A4%EB%9E%80%EB%A1%9C%20123' }
        }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async setCurrentLocation(@GetUser() user: JwtPayload, @Query('id') id: string) {
    const cacheKey = `${user.userId}:${id}`;

    await this.commandBus.execute(new SetCurrentLocationCommand(user.userId, id));
    const maxAttempts = 10;
    const interval = 100; // ms

    for (let i = 0; i < maxAttempts; i++) {
      const result = this.cache.get(cacheKey);
      if (result !== undefined) {
        this.cache.delete(cacheKey);
        if (result === null) {
          throw new Error('위치 업데이트 중 오류가 발생했습니다.');
        }
        return {
          id: result.locationId,
          roadAddress: encodeURIComponent(result.roadAddress),
        };
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('업데이트 결과를 가져오는 데 실패했습니다.');
  }
}
