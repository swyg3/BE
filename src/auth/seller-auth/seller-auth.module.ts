import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SellerAuthController } from "./seller-auth.controller";
import { CompleteSellerProfileHandler } from "./handlers/complete-seller-profile.handler";
import { VerifyBusinessNumberHandler } from "./handlers/verify-business-number.handler";
import { BusinessNumberVerificationService } from "./services/business-number-verification.service";
import { Seller } from "src/sellers/entities/seller.entity";
import { SellersModule } from "src/sellers/sellers.module";

@Module({
  imports: [TypeOrmModule.forFeature([Seller]), SellersModule],
  controllers: [SellerAuthController],
  providers: [
    CompleteSellerProfileHandler,
    VerifyBusinessNumberHandler,
    BusinessNumberVerificationService,
  ],
  exports: [BusinessNumberVerificationService],
})
export class SellerAuthModule {}
