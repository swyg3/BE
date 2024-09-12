import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccessLogRepository } from "../repositories/access-log.repository";
import { AccessLog } from "../entities/access-log.entity";

@Injectable()
export class AccessLogService {
  constructor(
    @InjectRepository(AccessLogRepository)
    private readonly accessLogRepository: AccessLogRepository,
  ) {}

  async logUserAction(logData: Partial<AccessLog>): Promise<AccessLog> {
    return this.accessLogRepository.createLog(logData);
  }
}
