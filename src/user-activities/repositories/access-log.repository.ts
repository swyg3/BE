import { Repository } from "typeorm";
import { AccessLog } from "../entities/access-log.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AccessLogRepository {
  constructor(
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
  ) {}

  async createLog(logData: Partial<AccessLog>): Promise<AccessLog> {
    const log = this.accessLogRepository.create(logData);
    return this.accessLogRepository.save(log);
  }
}
