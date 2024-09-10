import { IsString, IsIn } from 'class-validator';

export class LoginOAuthDto {
  @IsString()
  @IsIn(['google', 'kakao'])
  provider: 'google' | 'kakao';

  @IsIn(['user', 'seller'])
  userType: 'user' | 'seller';

  @IsString()
  accessToken: string;
}