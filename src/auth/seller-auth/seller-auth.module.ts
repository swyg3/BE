import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../shared/services/auth.service';
import { EmailVerificationService } from '../shared/services/email-verification.service';
import { BusinessNumberVerificationService } from './services/business-number-verification.service';
import { BusinessNumberVerifiedEventHandler } from './handlers/business-number-verified.handler';
import { CompleteSellerProfileHandler } from './handlers/complete-seller-profile.handler';
import { VerifyBusinessNumberHandler } from './handlers/verify-business-number.handler';
import { SellerAuthController } from './seller-auth.controller';
import { SellerRepository } from 'src/sellers/repositories/seller.repository';

const CommandHandlers = [CompleteSellerProfileHandler, VerifyBusinessNumberHandler];
const EventHandlers = [BusinessNumberVerifiedEventHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([SellerRepository]),
  ],
  controllers: [SellerAuthController],
  providers: [
    AuthService,
    EmailVerificationService,
    BusinessNumberVerificationService,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [BusinessNumberVerificationService]
})
export class SellerAuthModule {}