import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccessLogRepository } from "./repositories/access-log.repository";
import { AccessLogService } from "./services/access-log.service";

@Module({
  imports: [TypeOrmModule.forFeature([AccessLogRepository])],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class UserActivitiesModule {}
