import { IsString, IsIn } from 'class-validator';

export class LoginOAuthDto {
  @IsString()
  @IsIn(['google', 'kakao'])
  provider: string

  @IsString()
  @IsIn(['user', 'seller'])
  userType: string

  @IsString()
  accessToken: string;
}