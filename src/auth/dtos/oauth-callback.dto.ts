import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class OAuthCallbackDto {
    @IsString()
    @IsNotEmpty()
    provider: string;
  
    @IsString()
    @IsNotEmpty()
    code: string;
  
    @IsString()
    state?: string;
}