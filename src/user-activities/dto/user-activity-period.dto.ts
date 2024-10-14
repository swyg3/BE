import { UserActivityHistoryDto } from "./user-activity-history.dto";

export class UserActivityPeriodDto {
  userId: string;
  activities: UserActivityHistoryDto[];
  startDate: Date;
  endDate: Date;
}