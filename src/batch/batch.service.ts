import { Injectable, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Cron, ScheduleModule, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  /*  constructor(private schedulerRegistry: SchedulerRegistry,
        private commandBus: CommandBus
    ){
        this.handleProductDelete();
    }


    handleProductDelete(){
        const name = '배치 수행'
        const job = new CronJob('0 2 * * *', async () => {
            this.logger.warn('Running product deletion batch');
            
            //await this.commandBus.execute(new DeleteAllProductsCommand());
        });//일단 새벽 두시 전체 상품 초기화
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
        this.logger.warn('add 성공')
    } */
}
